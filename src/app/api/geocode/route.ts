import type { NextRequest } from "next/server";
import { corsJson, corsPreflight } from "@/lib/cors";
import { lookupPlace } from "@/lib/opentripmap";

export const runtime = "nodejs";

const MAX_QUERY_LENGTH = 120;

export async function OPTIONS() {
  return corsPreflight();
}

/**
 * Lets the wizard verify a destination/accommodation query against the same
 * OpenTripMap toponym lookup the plan-generation route relies on, so a typo
 * gets caught before it silently produces a plan with no grounded places or
 * weather (both of which depend on this same lookup succeeding).
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim().slice(0, MAX_QUERY_LENGTH) ?? "";
  if (!q) {
    return corsJson({ found: false });
  }

  const result = await lookupPlace(q);
  if (!result) {
    return corsJson({ found: false });
  }

  return corsJson({
    found: true,
    name: result.name,
    country: result.country,
    partialMatch: result.partialMatch,
    // Not used by the web wizard (it only needs found/name/country to show
    // a validation message) — the mobile app's wizard uses these to animate
    // its live map background as a destination/accommodation resolves.
    lat: result.lat,
    lon: result.lon,
  });
}
