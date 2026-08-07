import { resolvePlaceName, type Poi } from "@/lib/opentripmap";
import { resolvePlaceFoursquare } from "@/lib/foursquare";
import type { DailyWeather } from "@/lib/weather";

/** Case-insensitive, either-direction substring match against the grounded POI list. */
export function matchPoi(title: string, pois: Poi[]): Poi | undefined {
  const needle = title.trim().toLowerCase();
  if (!needle) return undefined;
  return pois.find((p) => {
    const hay = p.name.trim().toLowerCase();
    return hay === needle || hay.includes(needle) || needle.includes(hay);
  });
}

/**
 * The model sometimes writes a descriptive title instead of the plain
 * indexed place name — e.g. "Şehzade Camii ve Avlusu" ("...and its
 * courtyard") or "Fatih Anıtı (Fatih Sultan Mehmet)" — which breaks both
 * grounded-POI matching and the autosuggest fallback. Strip parentheticals
 * and common "X and Y" conjunctions (in the languages this app supports) to
 * get a second, cleaner candidate to try.
 */
export function cleanPlaceName(title: string): string {
  let cleaned = title.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  for (const conjunction of [" and ", " ve ", " y "]) {
    const idx = cleaned.toLowerCase().indexOf(conjunction);
    if (idx > 3) {
      cleaned = cleaned.slice(0, idx).trim();
      break;
    }
  }
  return cleaned;
}

export async function resolveStopLocation(
  title: string,
  pois: Poi[],
  center: { lat: number; lon: number } | null,
): Promise<{ lat: number; lon: number } | null> {
  const direct = matchPoi(title, pois);
  if (direct) return { lat: direct.lat, lon: direct.lon };

  const cleaned = cleanPlaceName(title);
  if (cleaned !== title) {
    const cleanedMatch = matchPoi(cleaned, pois);
    if (cleanedMatch) return { lat: cleanedMatch.lat, lon: cleanedMatch.lon };
  }

  if (!center) return null;

  const resolved = await resolvePlaceName(title, center);
  if (resolved) return resolved;
  if (cleaned !== title) {
    const resolvedCleaned = await resolvePlaceName(cleaned, center);
    if (resolvedCleaned) return resolvedCleaned;
  }

  // Last resort: Foursquare's free tier tends to know small commercial
  // places (cafés, restaurants, shops) that OpenTripMap/OSM misses.
  const viaFoursquare = await resolvePlaceFoursquare(title, center);
  if (viaFoursquare) return viaFoursquare;
  if (cleaned !== title) return resolvePlaceFoursquare(cleaned, center);
  return null;
}

export const PACE_LABEL: Record<string, string> = {
  relaxed: "relaxed, with plenty of downtime and few stops per day",
  balanced: "balanced",
  intensive: "intensive, packing in as much as possible each day",
};

export const COMPANION_LABEL: Record<string, string> = {
  solo: "a solo traveler",
  couple: "a couple",
  family: "a family with kids",
  friends: "a group of friends",
};

export const TRANSPORT_LABEL: Record<string, string> = {
  walking:
    "on foot. Choose stops within easy walking distance of each other each day, in an order that minimizes backtracking and long walks between consecutive stops.",
  transit:
    "public transportation (metro, bus, tram). Prefer stops that are well-connected by transit, and sequence them to minimize transfers and travel time between stops.",
  car: "by car. Sequence stops to minimize total drive time and avoid backtracking. Where relevant, schedule around likely rush-hour traffic (roughly 8-9:30am and 5-7pm on weekdays) — e.g. avoid a cross-town drive right at 6pm if an earlier or later slot works as well.",
};

// A deliberate style knob, independent of the real forecast below (which
// stays authoritative for practical logistics like indoor/outdoor). The
// traveler may want a "summer" trip in spirit even if the actual dates or
// destination don't match — this only nudges the *kind* of stops chosen.
export const SEASON_LABEL: Record<string, string> = {
  summer:
    "summer — lean into beach clubs, waterfront bars/rooftop nightlife, outdoor festivals, ice cream/gelato stops, and warm-weather activities where plausible for this destination",
  autumn:
    "autumn — lean into harvest markets, cozy cafés, foliage/park walks, and indoor cultural stops as days shorten",
  winter:
    "winter — lean into ski/snow-sport spots if the destination plausibly has them, holiday markets, cozy indoor venues, and hot food/drink stops",
  spring:
    "spring — lean into blooming parks/gardens, outdoor markets, and mild-weather walking routes",
};

export type PastPlanRating = {
  destination: string;
  pace: string;
  companions: string;
  transport: string;
  season: string;
  rating: number;
  comment: string | null;
};

/**
 * Pro-only personalization context — a summary of how this traveler has
 * rated past AI-generated plans, fed into the prompt so future plans lean
 * toward what they've actually liked. Standard-plan users accumulate the
 * same PlanRating rows (see /api/plan), but this block is never built for
 * them — the data sits unused until they upgrade.
 */
export function buildPersonalizationBlock(ratings: PastPlanRating[]): string {
  if (ratings.length === 0) return "";
  return `This traveler has rated trips VoyageAI planned for them before — use these to better match their taste (favor what they rated highly, steer away from what they didn't):
${ratings
  .map(
    (r) =>
      `- ${r.destination} (${PACE_LABEL[r.pace] ?? r.pace}, ${COMPANION_LABEL[r.companions] ?? r.companions}, ${SEASON_LABEL[r.season] ?? r.season}): ${r.rating}/5${r.comment ? ` — "${r.comment}"` : ""}`,
  )
  .join("\n")}`;
}

export function weatherGuidance(w: DailyWeather): string {
  switch (w.condition) {
    case "rain":
    case "storm":
      return "rain expected — favor indoor or covered stops (museums, markets, galleries) over open-air ones";
    case "snow":
      return "snow expected — favor cozy indoor stops, or snow-friendly outdoor spots, and allow extra time for cold-weather logistics";
    case "clear":
      return "clear skies — a good day for outdoor landmarks, parks, and walking routes";
    case "fog":
      return "fog expected — fine for indoor stops; skip viewpoints that depend on a clear view";
    default:
      return "mixed conditions — a flexible day works well with a blend of indoor and outdoor stops";
  }
}
