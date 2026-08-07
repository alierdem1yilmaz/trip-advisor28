import { NextResponse } from "next/server";

// The mobile app calls these routes cross-origin (its own bundled origin,
// not this server's) — a real native fetch() doesn't enforce CORS at all,
// but the Expo *web* target (used for fast local iteration in a browser)
// does, so these routes need to allow it explicitly. Both routes already
// gate on auth (Bearer token or cookie session) independently, so a
// permissive origin here doesn't widen access — it only affects who's
// allowed to see the response in a browser context, not who's authorized.
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function corsJson(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: { ...CORS_HEADERS, ...init?.headers },
  });
}

export function corsPreflight() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
