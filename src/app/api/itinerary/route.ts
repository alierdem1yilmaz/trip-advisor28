import { NextResponse } from "next/server";
import { generateJson } from "@/lib/fal";
import { findPois } from "@/lib/opentripmap";
import { LANGUAGE_PROMPT_NAME, resolveLanguage } from "@/lib/i18n/dictionaries";

export const runtime = "nodejs";

type ItineraryStop = {
  time: string;
  title: string;
  description: string;
  reason: string;
};

type ItineraryResponse = {
  summary: string;
  stops: ItineraryStop[];
  groundedPlaceCount?: number;
};

const PACE_LABEL: Record<string, string> = {
  relaxed: "relaxed, with plenty of downtime",
  balanced: "balanced",
  intensive: "intensive, packing in as much as possible",
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

  const { destination, pace, interests, language } = (body ?? {}) as {
    destination?: unknown;
    pace?: unknown;
    interests?: unknown;
    language?: unknown;
  };
  const lang = resolveLanguage(language);

  if (typeof destination !== "string" || !destination.trim()) {
    return NextResponse.json(
      { error: "destination is required." },
      { status: 400 },
    );
  }
  if (destination.length > MAX_FIELD_LENGTH) {
    return NextResponse.json(
      { error: "destination is too long." },
      { status: 400 },
    );
  }

  const paceKey = typeof pace === "string" && pace in PACE_LABEL ? pace : "balanced";

  const interestList = Array.isArray(interests)
    ? interests
        .filter((i): i is string => typeof i === "string")
        .map((i) => i.trim())
        .filter(Boolean)
        .slice(0, MAX_INTERESTS)
    : [];

  const pois = await findPois(destination.trim(), interestList);
  const groundingBlock =
    pois.length > 0
      ? `Real places actually near "${destination.trim()}" (prefer these by name where they fit; you may add well-known others too):
${pois.map((p) => `- ${p.name} (${p.kinds})`).join("\n")}`
      : "";

  const prompt = `You are the itinerary-planning engine for VoyageAI, an AI travel planner.
Generate a single sample day (4 stops) for a trip to "${destination.trim()}".
Pace preference: ${PACE_LABEL[paceKey]}.
${interestList.length > 0 ? `Traveler interests: ${interestList.join(", ")}.` : ""}
${groundingBlock}

Respond with ONLY minified JSON matching exactly this shape, no markdown fences:
{"summary": string (one sentence framing the day), "stops": [{"time": string (e.g. "9:00 AM"), "title": string (short stop name), "description": string (max 18 words), "reason": string (max 16 words, why this stop is scheduled here/now)}]}

Exactly 4 stops, ordered chronologically across a single day. Be specific to the destination — use real or plausible place names, not generic placeholders.
Write all text values (summary, title, description, reason) entirely in ${LANGUAGE_PROMPT_NAME[lang]}. Keep proper place names as they really are.`;

  try {
    const itinerary = await generateJson<ItineraryResponse>(prompt);
    if (!itinerary?.stops?.length) {
      throw new Error("Malformed itinerary response");
    }
    itinerary.groundedPlaceCount = pois.length;
    return NextResponse.json(itinerary);
  } catch (error) {
    if (error instanceof Error && error.message === "FAL_KEY is not set") {
      return NextResponse.json(
        {
          error:
            "The live demo isn't configured yet — add FAL_KEY to .env.local and restart the dev server.",
        },
        { status: 503 },
      );
    }
    console.error("itinerary generation failed:", error);
    return NextResponse.json(
      { error: "Couldn't generate an itinerary right now. Try again in a moment." },
      { status: 502 },
    );
  }
}
