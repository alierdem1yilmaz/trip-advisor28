import { corsJson, corsPreflight } from "@/lib/cors";
import { generateJson } from "@/lib/fal";
import { findPois, geocodeDestination } from "@/lib/opentripmap";
import { LANGUAGE_PROMPT_NAME, resolveLanguage } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/auth/dal";
import {
  resolveStopLocation,
  PACE_LABEL,
  COMPANION_LABEL,
  TRANSPORT_LABEL,
  SEASON_LABEL,
} from "@/lib/itinerary";

export const runtime = "nodejs";

const MAX_FIELD_LENGTH = 60;
const MAX_INTERESTS = 6;

type CurrentStop = {
  time?: unknown;
  title?: unknown;
  description?: unknown;
  reason?: unknown;
};

type OtherStop = { title?: unknown };

type NewStop = {
  time: string;
  title: string;
  description: string;
  reason: string;
  estimatedRating?: number;
  priceTier?: "$" | "$$" | "$$$";
  mapQuery?: string;
};

export async function OPTIONS() {
  return corsPreflight();
}

/**
 * Replaces exactly one already-generated stop with a fresh alternative,
 * without touching the rest of the day or the trip's dayTokens balance —
 * the day was already paid for via /api/plan, this is a free refinement.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return corsJson(
      { error: "Sign in to refresh a suggestion.", code: "SIGN_IN_REQUIRED" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return corsJson({ error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    destination,
    dayTheme,
    season,
    pace,
    companions,
    transport,
    interests,
    language,
    currentStop,
    otherStops,
  } = (body ?? {}) as {
    destination?: unknown;
    dayTheme?: unknown;
    season?: unknown;
    pace?: unknown;
    companions?: unknown;
    transport?: unknown;
    interests?: unknown;
    language?: unknown;
    currentStop?: CurrentStop;
    otherStops?: OtherStop[];
  };
  const lang = resolveLanguage(language);

  if (typeof destination !== "string" || !destination.trim() || destination.length > MAX_FIELD_LENGTH) {
    return corsJson({ error: "destination is required." }, { status: 400 });
  }
  if (typeof currentStop?.title !== "string" || !currentStop.title.trim()) {
    return corsJson({ error: "currentStop.title is required." }, { status: 400 });
  }

  const paceKey = typeof pace === "string" && pace in PACE_LABEL ? pace : "balanced";
  const companionsKey =
    typeof companions === "string" && companions in COMPANION_LABEL ? companions : "solo";
  const transportKey =
    typeof transport === "string" && transport in TRANSPORT_LABEL ? transport : "walking";
  const seasonKey = typeof season === "string" && season in SEASON_LABEL ? season : "summer";

  const interestList = Array.isArray(interests)
    ? interests
        .filter((i): i is string => typeof i === "string")
        .map((i) => i.trim())
        .filter(Boolean)
        .slice(0, MAX_INTERESTS)
    : [];

  const otherTitles = Array.isArray(otherStops)
    ? otherStops
        .map((s) => (typeof s?.title === "string" ? s.title.trim() : ""))
        .filter(Boolean)
    : [];

  const center = await geocodeDestination(destination.trim());
  // A small, targeted grounding set for this one replacement — no need for
  // the full dayCount * 10 POIs /api/plan fetches for a whole trip.
  const pois = await findPois(destination.trim(), interestList, 10, center);

  const groundingBlock =
    pois.length > 0
      ? `Real places actually near "${destination.trim()}" (prefer one of these by name if it fits naturally; you may suggest another well-known real place too):
${pois.map((p) => `- ${p.name} (${p.kinds})`).join("\n")}`
      : "";

  const prompt = `You are the itinerary-planning engine for VoyageAI, an AI travel planner.
The traveler is on a "${typeof dayTheme === "string" ? dayTheme : ""}" day of their trip to "${destination.trim()}" and wants ONE replacement for the stop currently scheduled at ${currentStop.time ?? "some point that day"}: "${currentStop.title}"${typeof currentStop.description === "string" && currentStop.description ? ` — ${currentStop.description}` : ""}.
Suggest a different, comparably-scheduled alternative stop. Do NOT suggest the same place, and do NOT suggest any of these other stops already planned that day: ${otherTitles.length > 0 ? otherTitles.join(", ") : "(none)"}.
For ${COMPANION_LABEL[companionsKey]}. Pace preference: ${PACE_LABEL[paceKey]}. Getting around: ${TRANSPORT_LABEL[transportKey]}
Season the traveler wants (a deliberate style choice, bias the *kind* of stop toward this): ${SEASON_LABEL[seasonKey]}.
${interestList.length > 0 ? `Traveler interests: ${interestList.join(", ")}.` : ""}
${groundingBlock}

Respond with ONLY minified JSON matching exactly this shape, no markdown fences:
{"time": string (e.g. "9:00 AM", keep it close to the original stop's time slot), "title": string (just the plain place name, nothing else — see rule below), "description": string (max 18 words), "reason": string (max 16 words, why this stop fits here/now), "estimatedRating": number (your own best-informed estimate on a 1.0-5.0 scale, one decimal place), "priceTier": string (one of "$", "$$", "$$$" — judged for this specific stop, not the destination's overall cost of living), "mapQuery": string (the internationally-recognized/English name of this exact place, for map lookup only — never shown to the user)}

Critical rule for "title": it must be ONLY the real, plain name of the place, exactly as it would appear on a map or sign — nothing else appended. Never add descriptive suffixes, alternate names in parentheses, or explanatory text to the title.
Write all text values (time, title, description, reason) entirely in ${LANGUAGE_PROMPT_NAME[lang]}. Keep proper place names as they really are — never translate a proper name. The exception is "mapQuery", which is always in English regardless of the response language.`;

  try {
    const stop = await generateJson<NewStop>(prompt);
    if (!stop?.title) {
      throw new Error("Malformed stop response");
    }

    const { mapQuery, ...rest } = stop;
    const location = await resolveStopLocation(mapQuery || stop.title, pois, center);

    return corsJson(location ? { ...rest, lat: location.lat, lon: location.lon } : rest);
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
    console.error("stop regeneration failed:", error);
    return corsJson(
      { error: "Couldn't refresh this stop right now. Try again in a moment." },
      { status: 502 },
    );
  }
}
