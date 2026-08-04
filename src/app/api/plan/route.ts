import { NextResponse } from "next/server";
import { generateJson } from "@/lib/fal";
import { findPois } from "@/lib/opentripmap";
import {
  addDaysIso,
  diffInDaysIso,
  formatFriendlyIso,
  isValidIsoDate,
  todayIso,
  MAX_TRIP_LENGTH_DAYS,
  WEATHER_FORECAST_HORIZON_DAYS,
} from "@/lib/dates";

export const runtime = "nodejs";

type ItineraryStop = {
  time: string;
  title: string;
  description: string;
  reason: string;
};

type ItineraryDay = {
  day: number;
  date?: string;
  theme: string;
  stops: ItineraryStop[];
};

type PlanResponse = {
  destination: string;
  days: ItineraryDay[];
  groundedPlaceCount?: number;
};

const PACE_LABEL: Record<string, string> = {
  relaxed: "relaxed, with plenty of downtime and few stops per day",
  balanced: "balanced",
  intensive: "intensive, packing in as much as possible each day",
};

const COMPANION_LABEL: Record<string, string> = {
  solo: "a solo traveler",
  couple: "a couple",
  family: "a family with kids",
  friends: "a group of friends",
};

const MAX_INTERESTS = 6;
const MAX_FIELD_LENGTH = 60;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { destination, startDate, endDate, pace, interests, companions } = (body ?? {}) as {
    destination?: unknown;
    startDate?: unknown;
    endDate?: unknown;
    pace?: unknown;
    interests?: unknown;
    companions?: unknown;
  };

  if (typeof destination !== "string" || !destination.trim()) {
    return NextResponse.json({ error: "destination is required." }, { status: 400 });
  }
  if (destination.length > MAX_FIELD_LENGTH) {
    return NextResponse.json({ error: "destination is too long." }, { status: 400 });
  }

  if (
    typeof startDate !== "string" ||
    typeof endDate !== "string" ||
    !isValidIsoDate(startDate) ||
    !isValidIsoDate(endDate)
  ) {
    return NextResponse.json(
      { error: "startDate and endDate are required (YYYY-MM-DD)." },
      { status: 400 },
    );
  }

  const today = todayIso();
  const forecastLimit = addDaysIso(today, WEATHER_FORECAST_HORIZON_DAYS);
  if (startDate < today || startDate > forecastLimit || endDate < startDate) {
    return NextResponse.json(
      {
        error: `Trip dates must fall within the next ${WEATHER_FORECAST_HORIZON_DAYS} days, so weather-aware planning stays reliable.`,
      },
      { status: 400 },
    );
  }

  const dayCount = Math.min(diffInDaysIso(startDate, endDate) + 1, MAX_TRIP_LENGTH_DAYS);
  const clampedEndDate = addDaysIso(startDate, dayCount - 1);
  if (clampedEndDate > forecastLimit) {
    return NextResponse.json(
      {
        error: `Trip dates must fall within the next ${WEATHER_FORECAST_HORIZON_DAYS} days, so weather-aware planning stays reliable.`,
      },
      { status: 400 },
    );
  }

  const paceKey = typeof pace === "string" && pace in PACE_LABEL ? pace : "balanced";
  const companionsKey =
    typeof companions === "string" && companions in COMPANION_LABEL ? companions : "solo";

  const interestList = Array.isArray(interests)
    ? interests
        .filter((i): i is string => typeof i === "string")
        .map((i) => i.trim())
        .filter(Boolean)
        .slice(0, MAX_INTERESTS)
    : [];

  const pois = await findPois(destination.trim(), interestList, dayCount * 6);
  const groundingBlock =
    pois.length > 0
      ? `Real places actually near "${destination.trim()}" (prefer these by name where they fit naturally; spread them across days, don't reuse the same one twice; you may add other well-known real places too):
${pois.map((p) => `- ${p.name} (${p.kinds})`).join("\n")}`
      : "";

  const prompt = `You are the itinerary-planning engine for VoyageAI, an AI travel planner.
Generate a full ${dayCount}-day trip to "${destination.trim()}" for ${COMPANION_LABEL[companionsKey]}, running from ${startDate} to ${clampedEndDate}.
Pace preference: ${PACE_LABEL[paceKey]}.
${interestList.length > 0 ? `Traveler interests: ${interestList.join(", ")}.` : ""}
${groundingBlock}

Respond with ONLY minified JSON matching exactly this shape, no markdown fences:
{"days": [{"day": number, "theme": string (short theme for the day, e.g. "Old Town & River Views"), "stops": [{"time": string (e.g. "9:00 AM"), "title": string (short stop name), "description": string (max 18 words), "reason": string (max 16 words, why this stop is scheduled here/now)}]}]}

Exactly ${dayCount} day objects, days numbered 1 to ${dayCount} in order. Each day has exactly 4 stops, ordered chronologically. Vary the stops across days — no repeats. Be specific to the destination — use real or plausible place names, not generic placeholders.`;

  try {
    const plan = await generateJson<{ days: ItineraryDay[] }>(prompt);
    if (!plan?.days?.length) {
      throw new Error("Malformed plan response");
    }
    const daysWithDates = plan.days.map((d) => ({
      ...d,
      date: formatFriendlyIso(addDaysIso(startDate, d.day - 1)),
    }));
    const response: PlanResponse = {
      destination: destination.trim(),
      days: daysWithDates,
      groundedPlaceCount: pois.length,
    };
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof Error && error.message === "FAL_KEY is not set") {
      return NextResponse.json(
        {
          error:
            "The trip builder isn't configured yet — add FAL_KEY to .env.local and restart the dev server.",
        },
        { status: 503 },
      );
    }
    console.error("plan generation failed:", error);
    return NextResponse.json(
      { error: "Couldn't build your trip right now. Try again in a moment." },
      { status: 502 },
    );
  }
}
