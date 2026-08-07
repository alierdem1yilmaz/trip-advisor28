const BASE_URL = "https://api.opentripmap.com/0.1/en/places";

export type Poi = {
  name: string;
  kinds: string;
  rating: number;
  lat: number;
  lon: number;
};

const INTEREST_KINDS: Record<string, string> = {
  Food: "foods",
  History: "historic",
  Art: "museums,cultural",
  Nature: "natural,gardens_and_parks",
  Nightlife: "amusements",
  Shopping: "shops",
};

const DEFAULT_KINDS = "interesting_places,museums,architecture,historic,foods";

function kindsForInterests(interests: string[]): string {
  const mapped = interests.map((i) => INTEREST_KINDS[i]).filter(Boolean);
  return mapped.length > 0 ? [...new Set(mapped)].join(",") : DEFAULT_KINDS;
}

export type PlaceLookup = {
  lat: number;
  lon: number;
  name: string;
  country: string;
  // OpenTripMap set this when it couldn't match the query exactly and fell
  // back to a broader/looser match (e.g. a typo'd or oddly-specific query
  // resolving to just the city) — surfaced to the wizard so a near-miss can
  // be shown to the traveler instead of silently swapping in a different place.
  partialMatch: boolean;
};

/**
 * Resolve a free-text place name (city/region) via OpenTripMap's toponym
 * search, including the fields needed to show the traveler what actually
 * matched. Null when the key is missing, the name doesn't resolve to
 * anything, or the request fails.
 */
export async function lookupPlace(name: string): Promise<PlaceLookup | null> {
  const apiKey = process.env.OPENTRIPMAP_API_KEY;
  if (!apiKey || !name.trim()) return null;
  try {
    const url = `${BASE_URL}/geoname?name=${encodeURIComponent(name.trim())}&apikey=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== "OK" || typeof data.lat !== "number") return null;
    return {
      lat: data.lat,
      lon: data.lon,
      name: data.name ?? name.trim(),
      country: data.country ?? "",
      partialMatch: !!data.partial_match,
    };
  } catch {
    return null;
  }
}

/** Geocode a destination name (city/region) to coordinates. Null on any failure. */
export async function geocodeDestination(
  destination: string,
): Promise<{ lat: number; lon: number } | null> {
  const result = await lookupPlace(destination);
  return result ? { lat: result.lat, lon: result.lon } : null;
}

/**
 * Best-effort lookup of real, named points of interest near a destination,
 * for grounding LLM-generated itineraries. Returns [] on any failure
 * (missing key, geocode miss, network error) — callers should treat this
 * as optional context, never a hard dependency.
 */
export async function findPois(
  destination: string,
  interests: string[],
  limit = 12,
  precomputedCenter?: { lat: number; lon: number } | null,
): Promise<Poi[]> {
  const apiKey = process.env.OPENTRIPMAP_API_KEY;
  if (!apiKey) return [];

  try {
    const coords = precomputedCenter ?? (await geocodeDestination(destination));
    if (!coords) return [];

    const kinds = kindsForInterests(interests);
    const fetchLimit = Math.min(Math.max(limit, 1), 50);
    const url = `${BASE_URL}/radius?radius=8000&lon=${coords.lon}&lat=${coords.lat}&kinds=${kinds}&limit=${fetchLimit}&format=json&apikey=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return [];

    const places = (await res.json()) as Array<{
      name?: string;
      kinds?: string;
      rate?: number;
      point?: { lat: number; lon: number };
    }>;

    return places
      .filter((p) => p.name && p.name.trim().length > 0 && p.point)
      .sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0))
      .slice(0, fetchLimit)
      .map((p) => ({
        name: p.name!.trim(),
        kinds: p.kinds ?? "",
        rating: p.rate ?? 0,
        lat: p.point!.lat,
        lon: p.point!.lon,
      }));
  } catch {
    return [];
  }
}

/**
 * Best-effort resolution of a specific place name to coordinates, searched
 * near a reference point. Used as a fallback for stops the model added that
 * weren't in the original grounding list. Returns null on any failure —
 * an unresolved stop just doesn't get a map pin, never a hard error.
 */
export async function resolvePlaceName(
  name: string,
  near: { lat: number; lon: number },
): Promise<{ lat: number; lon: number } | null> {
  const apiKey = process.env.OPENTRIPMAP_API_KEY;
  if (!apiKey || !name.trim()) return null;
  try {
    const url = `${BASE_URL}/autosuggest?name=${encodeURIComponent(name.trim())}&radius=15000&lon=${near.lon}&lat=${near.lat}&limit=1&format=json&apikey=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const matches = (await res.json()) as Array<{
      point?: { lat: number; lon: number };
    }>;
    const point = matches[0]?.point;
    return point ? { lat: point.lat, lon: point.lon } : null;
  } catch {
    return null;
  }
}
