// Foursquare Places API — free "Pro" tier only (Place Search with default
// fields: name, location, categories, coordinates). Rating/tips/photos are
// Premium with zero free allowance (confirmed live: requesting them returns
// 429 "no API credits remaining" even on a fresh key) — never request them
// here, this module exists purely as a secondary geocoder.
//
// Foursquare's commercial/business data (cafés, restaurants, shops) is often
// more complete than OpenTripMap's for small specific businesses, so this
// runs as a fallback after OpenTripMap's own lookups fail.

const SEARCH_URL = "https://places-api.foursquare.com/places/search";

export async function resolvePlaceFoursquare(
  name: string,
  near: { lat: number; lon: number },
): Promise<{ lat: number; lon: number } | null> {
  const apiKey = process.env.FOURSQUARE_API_KEY;
  if (!apiKey || !name.trim()) return null;

  try {
    const url = `${SEARCH_URL}?query=${encodeURIComponent(name.trim())}&ll=${near.lat},${near.lon}&limit=1`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-Places-Api-Version": "2025-06-17",
      },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      results?: Array<{ latitude?: number; longitude?: number }>;
    };
    const place = data.results?.[0];
    if (!place || typeof place.latitude !== "number" || typeof place.longitude !== "number") {
      return null;
    }
    return { lat: place.latitude, lon: place.longitude };
  } catch {
    return null;
  }
}
