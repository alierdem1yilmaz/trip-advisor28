import { NextRequest, NextResponse } from "next/server";
import { lookupPlace } from "@/lib/opentripmap";

export const runtime = "nodejs";

const MAX_QUERY_LENGTH = 120;

/**
 * Lets the wizard verify a destination/accommodation query against the same
 * OpenTripMap toponym lookup the plan-generation route relies on, so a typo
 * gets caught before it silently produces a plan with no grounded places or
 * weather (both of which depend on this same lookup succeeding).
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim().slice(0, MAX_QUERY_LENGTH) ?? "";
  if (!q) {
    return NextResponse.json({ found: false });
  }

  const result = await lookupPlace(q);
  if (!result) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({
    found: true,
    name: result.name,
    country: result.country,
    partialMatch: result.partialMatch,
  });
}
