import { corsJson, corsPreflight } from "@/lib/cors";
import { generateJson } from "@/lib/fal";
import { findPois, geocodeDestination } from "@/lib/opentripmap";
import { getDailyForecast } from "@/lib/weather";
import { LANGUAGE_PROMPT_NAME, resolveLanguage } from "@/lib/i18n/dictionaries";
import { getCurrentUserForRequest } from "@/lib/auth/dal";
import { hasEnoughTokens, consumeTokens } from "@/lib/plan-limits";
import { prisma } from "@/lib/db";
import {
  resolveStopLocation,
  PACE_LABEL,
  COMPANION_LABEL,
  TRANSPORT_LABEL,
  SEASON_LABEL,
  weatherGuidance,
  buildPersonalizationBlock,
} from "@/lib/itinerary";
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
  // The model's own general-knowledge estimate — not live review data. See
  // the "estimatedRating" note near the prompt for why it's labeled, not
  // presented as, a real rating.
  estimatedRating?: number;
  // Best-informed estimate of this stop's typical price level, "$" cheap/
  // free through "$$$" expensive/upscale — judged per stop, not per city.
  priceTier?: "$" | "$$" | "$$$";
  // Internal only, never shown to the user: the internationally-recognized
  // (English) name of this exact place. OpenTripMap only indexes names in
  // English or Russian, so a Turkish/Spanish `title` (e.g. "Ayasofya") won't
  // match its search at all — this gives map lookup a name it can find.
  mapQuery?: string;
};

type ItineraryDay = {
  day: number;
  date?: string;
  theme: string;
  stops: ItineraryStop[];
};

type ResponseStop = {
  time: string;
  title: string;
  description: string;
  reason: string;
  estimatedRating?: number;
  priceTier?: "$" | "$$" | "$$$";
  lat?: number;
  lon?: number;
};

type ResponseDay = Omit<ItineraryDay, "stops"> & {
  stops: ResponseStop[];
  weather?: {
    tempMaxC: number;
    tempMinC: number;
    condition: string;
    label: string;
  };
};

type PlanResponse = {
  destination: string;
  center?: { lat: number; lon: number };
  days: ResponseDay[];
  groundedPlaceCount?: number;
  // Remaining free trip-days after this generation — omitted for Pro users,
  // who have no balance to track.
  tokensRemaining?: number;
};

const MAX_INTERESTS = 6;
const MAX_FIELD_LENGTH = 60;

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return corsJson({ error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    destination,
    accommodation,
    startDate,
    endDate,
    season,
    pace,
    interests,
    companions,
    transport,
    language,
  } = (body ?? {}) as {
    destination?: unknown;
    accommodation?: unknown;
    startDate?: unknown;
    endDate?: unknown;
    season?: unknown;
    pace?: unknown;
    interests?: unknown;
    companions?: unknown;
    transport?: unknown;
    language?: unknown;
  };
  const lang = resolveLanguage(language);

  if (typeof destination !== "string" || !destination.trim()) {
    return corsJson({ error: "destination is required." }, { status: 400 });
  }
  if (destination.length > MAX_FIELD_LENGTH) {
    return corsJson({ error: "destination is too long." }, { status: 400 });
  }
  const accommodationText =
    typeof accommodation === "string"
      ? accommodation.trim().slice(0, MAX_FIELD_LENGTH)
      : "";

  if (
    typeof startDate !== "string" ||
    typeof endDate !== "string" ||
    !isValidIsoDate(startDate) ||
    !isValidIsoDate(endDate)
  ) {
    return corsJson(
      { error: "startDate and endDate are required (YYYY-MM-DD)." },
      { status: 400 },
    );
  }

  const today = todayIso();
  const forecastLimit = addDaysIso(today, WEATHER_FORECAST_HORIZON_DAYS);
  if (startDate < today || startDate > forecastLimit || endDate < startDate) {
    return corsJson(
      {
        error: `Trip dates must fall within the next ${WEATHER_FORECAST_HORIZON_DAYS} days, so weather-aware planning stays reliable.`,
      },
      { status: 400 },
    );
  }

  const dayCount = Math.min(
    diffInDaysIso(startDate, endDate) + 1,
    MAX_TRIP_LENGTH_DAYS,
  );
  const clampedEndDate = addDaysIso(startDate, dayCount - 1);
  if (clampedEndDate > forecastLimit) {
    return corsJson(
      {
        error: `Trip dates must fall within the next ${WEATHER_FORECAST_HORIZON_DAYS} days, so weather-aware planning stays reliable.`,
      },
      { status: 400 },
    );
  }

  const user = await getCurrentUserForRequest(request);
  if (!user) {
    return corsJson(
      { error: "Sign in to build a trip.", code: "SIGN_IN_REQUIRED" },
      { status: 401 },
    );
  }
  if (!hasEnoughTokens(user, dayCount)) {
    return corsJson(
      {
        error: `This ${dayCount}-day trip needs ${dayCount} trip-days, but you only have ${user.dayTokens} left this month.`,
        code: "OUT_OF_TOKENS",
        tokensRemaining: user.dayTokens,
        resetsAt: user.tokensResetAt.toISOString(),
      },
      { status: 402 },
    );
  }

  const paceKey =
    typeof pace === "string" && pace in PACE_LABEL ? pace : "balanced";
  const companionsKey =
    typeof companions === "string" && companions in COMPANION_LABEL
      ? companions
      : "solo";
  const transportKey =
    typeof transport === "string" && transport in TRANSPORT_LABEL
      ? transport
      : "walking";
  const seasonKey =
    typeof season === "string" && season in SEASON_LABEL ? season : "summer";

  const interestList = Array.isArray(interests)
    ? interests
        .filter((i): i is string => typeof i === "string")
        .map((i) => i.trim())
        .filter(Boolean)
        .slice(0, MAX_INTERESTS)
    : [];

  // If the traveler gave an accommodation area, ground the whole trip near
  // it instead of the city center — "staying in Ortaköy" shouldn't produce
  // a day built around Caddebostan on the other side of the city. Falls
  // back to the plain destination center if that string doesn't geocode.
  const accommodationQuery = accommodationText
    ? `${accommodationText}, ${destination.trim()}`
    : null;
  // Personalization is Pro-only (see buildPersonalizationBlock docs): past
  // ratings are only fetched, and therefore only ever influence the prompt,
  // for Pro users. Standard users' PlanRating rows still accumulate below —
  // they just sit unused unless the user upgrades.
  const [accommodationCenter, destinationCenter, forecast, pastRatings] =
    await Promise.all([
      accommodationQuery
        ? geocodeDestination(accommodationQuery)
        : Promise.resolve(null),
      geocodeDestination(destination.trim()),
      getDailyForecast(destination.trim(), startDate, clampedEndDate),
      user.plan === "pro"
        ? prisma.planRating.findMany({
            where: { userId: user.id, rating: { not: null } },
            orderBy: { createdAt: "desc" },
            take: 8,
          })
        : Promise.resolve([]),
    ]);
  const center = accommodationCenter ?? destinationCenter;
  const groundedNearAccommodation = !!accommodationCenter;
  const personalizationBlock = buildPersonalizationBlock(
    pastRatings.map((r) => ({
      destination: r.destination,
      pace: r.pace,
      companions: r.companions,
      transport: r.transport,
      season: r.season,
      rating: r.rating!,
      comment: r.comment,
    })),
  );

  const pois = await findPois(
    destination.trim(),
    interestList,
    dayCount * 10,
    center,
  );

  const groundingBlock =
    pois.length > 0
      ? `Real places actually near "${destination.trim()}"${groundedNearAccommodation ? ` (specifically near the traveler's accommodation)` : ""} (prefer these by name where they fit naturally; spread them across days, don't reuse the same one twice; you may add other well-known real places too):
${pois.map((p) => `- ${p.name} (${p.kinds})`).join("\n")}`
      : "";

  const accommodationBlock = accommodationText
    ? `The traveler is staying near "${accommodationText}" in ${destination.trim()}. Favor stops that keep each day's travel reasonably close to this base rather than crossing the whole city and back — this matters most for a walking-based day, but keep it in mind for any transport mode.`
    : "";

  const weatherByDate = new Map((forecast ?? []).map((w) => [w.date, w]));
  const weatherBlock =
    forecast && forecast.length > 0
      ? `Actual forecast for each day (adapt stop choices to it — this is the whole point of weather-aware planning):
${forecast
  .map(
    (w, i) =>
      `Day ${i + 1} (${w.date}): ${w.label}, ${w.tempMinC}-${w.tempMaxC}°C — ${weatherGuidance(w)}.`,
  )
  .join("\n")}`
      : "";

  const prompt = `You are the itinerary-planning engine for VoyageAI, an AI travel planner.
Generate a full ${dayCount}-day trip to "${destination.trim()}" for ${COMPANION_LABEL[companionsKey]}, running from ${startDate} to ${clampedEndDate}.
Pace preference: ${PACE_LABEL[paceKey]}.
Getting around: ${TRANSPORT_LABEL[transportKey]}
Season the traveler wants (a deliberate style choice — it may not match the actual forecast below, which is real; use the forecast for practical logistics like indoor/outdoor, but bias the *kind* of stops chosen toward this season): ${SEASON_LABEL[seasonKey]}.
${accommodationBlock}
${interestList.length > 0 ? `Traveler interests: ${interestList.join(", ")}.` : ""}
${weatherBlock}
${groundingBlock}
${personalizationBlock}

Respond with ONLY minified JSON matching exactly this shape, no markdown fences:
{"days": [{"day": number, "theme": string (short theme for the day, e.g. "Old Town & River Views"), "stops": [{"time": string (e.g. "9:00 AM"), "title": string (just the plain place name, nothing else — see rule below), "description": string (max 18 words), "reason": string (max 16 words, why this stop is scheduled here/now, referencing weather or transport when it's the actual reason), "estimatedRating": number (your own best-informed estimate of this place's general quality/reputation on a 1.0-5.0 scale, one decimal place — based on general knowledge, NOT live review data you don't have), "priceTier": string (one of "$", "$$", "$$$" — your best-informed estimate of this specific stop's typical price level, "$" = cheap/free, "$$" = mid-range, "$$$" = expensive/upscale), "mapQuery": string (the internationally-recognized/English name of this exact place, for map lookup only — never shown to the user, so it's fine for it to differ in language from "title")}]}]}

Exactly ${dayCount} day objects, days numbered 1 to ${dayCount} in order. Each day has exactly 4 stops, ordered chronologically. Vary the stops across days — no repeats. Be specific to the destination — use real or plausible place names, not generic placeholders.
Critical rule for "title": it must be ONLY the real, plain name of the place, exactly as it would appear on a map or sign — nothing else appended. Never add descriptive suffixes ("... and its courtyard"), alternate names in parentheses, or explanatory text to the title. Any extra context like that belongs in "description" instead, not "title".
For "priceTier", judge the specific stop, not the destination's overall cost of living — a free viewpoint is "$" even in an expensive city, a Michelin-starred restaurant is "$$$" even in a cheap one.
Write all text values (theme, time, title, description, reason) entirely in ${LANGUAGE_PROMPT_NAME[lang]}. Keep proper place names as they really are — never translate a proper name. The exception is "mapQuery", which is always in English regardless of the response language.`;

  try {
    const plan = await generateJson<{ days: ItineraryDay[] }>(prompt);
    if (!plan?.days?.length) {
      throw new Error("Malformed plan response");
    }

    // Resolve a map pin per stop: prefer an exact match against the already-
    // fetched grounded POIs (free, no extra call); fall back to a single
    // autosuggest lookup near the destination center for stops the model
    // added on its own. Runs concurrently — an unresolved stop just has no
    // pin, never a hard failure.
    const daysWithCoords: ResponseDay[] = await Promise.all(
      plan.days.map(async (d) => {
        const iso = addDaysIso(startDate, d.day - 1);
        const w = weatherByDate.get(iso);
        const stops: ResponseStop[] = await Promise.all(
          d.stops.map(async (stop) => {
            const { mapQuery, ...rest } = stop;
            const location = await resolveStopLocation(
              mapQuery || stop.title,
              pois,
              center,
            );
            return location
              ? { ...rest, lat: location.lat, lon: location.lon }
              : rest;
          }),
        );
        return {
          ...d,
          stops,
          date: formatFriendlyIso(iso, lang),
          weather: w
            ? {
                tempMaxC: w.tempMaxC,
                tempMinC: w.tempMinC,
                condition: w.condition,
                label: w.label,
              }
            : undefined,
        };
      }),
    );

    let tokensRemaining: number | undefined;
    if (user.plan === "standard") {
      await consumeTokens(user.id, dayCount);
      tokensRemaining = Math.max(user.dayTokens - dayCount, 0);
    }

    const response: PlanResponse = {
      destination: destination.trim(),
      center: center ?? undefined,
      days: daysWithCoords,
      groundedPlaceCount: pois.length,
      tokensRemaining,
    };

    // Passive, unmanaged log of every trip generated — separate from the
    // user-initiated "Save trip" bookmark (src/app/actions/savedTrips.ts,
    // kind "saved", 7 days). Best-effort: never let a logging failure break
    // an otherwise-successful generation.
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);
      await prisma.savedTrip.create({
        data: {
          userId: user.id,
          plan: response as object,
          kind: "history",
          expiresAt,
        },
      });
    } catch (error) {
      console.error("history logging failed:", error);
    }

    // Logged for every plan, on both plans — this is the data collection
    // half of the rating loop (src/components/PlanRatingPrompt.tsx prompts
    // for a rating the next day). Whether it ever gets *used* again is
    // gated separately, by plan tier, in the personalization fetch above.
    try {
      await prisma.planRating.create({
        data: {
          userId: user.id,
          destination: destination.trim(),
          pace: paceKey,
          companions: companionsKey,
          transport: transportKey,
          season: seasonKey,
          interests: interestList,
        },
      });
    } catch (error) {
      console.error("plan rating logging failed:", error);
    }

    return corsJson(response);
  } catch (error) {
    if (error instanceof Error && error.message === "FAL_KEY is not set") {
      return corsJson(
        {
          error:
            "The trip builder isn't configured yet — add FAL_KEY to .env.local and restart the dev server.",
        },
        { status: 503 },
      );
    }
    console.error("plan generation failed:", error);
    return corsJson(
      { error: "Couldn't build your trip right now. Try again in a moment." },
      { status: 502 },
    );
  }
}
