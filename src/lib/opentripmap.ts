const BASE_URL = "https://api.opentripmap.com/0.1/en/places";

export type Poi = {
  name: string;
  kinds: string;
  rating: number;
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

/** Geocode a place name to coordinates. Returns null if not found or on any API error. */
async function geocode(
  destination: string,
  apiKey: string,
): Promise<{ lat: number; lon: number } | null> {
  const url = `${BASE_URL}/geoname?name=${encodeURIComponent(destination)}&apikey=${apiKey}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== "OK" || typeof data.lat !== "number") return null;
  return { lat: data.lat, lon: data.lon };
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
): Promise<Poi[]> {
  const apiKey = process.env.OPENTRIPMAP_API_KEY;
  if (!apiKey) return [];

  try {
    const coords = await geocode(destination, apiKey);
    if (!coords) return [];

    const kinds = kindsForInterests(interests);
    const url = `${BASE_URL}/radius?radius=6000&lon=${coords.lon}&lat=${coords.lat}&kinds=${kinds}&limit=20&format=json&apikey=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];

    const places = (await res.json()) as Array<{
      name?: string;
      kinds?: string;
      rate?: number;
    }>;

    return places
      .filter((p) => p.name && p.name.trim().length > 0)
      .sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0))
      .slice(0, 12)
      .map((p) => ({ name: p.name!.trim(), kinds: p.kinds ?? "", rating: p.rate ?? 0 }));
  } catch {
    return [];
  }
}
