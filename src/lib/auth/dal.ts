import "server-only";
import { cache } from "react";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { prisma } from "@/lib/db";
import { auth0 } from "@/lib/auth0";
import { ensureFreshTokens, STANDARD_MONTHLY_TOKENS, nextMonthlyReset } from "@/lib/plan-limits";

// Auth0 owns identity; this app only learns about a given user the first
// time it sees their session/token, at which point it provisions the local
// row that actually tracks plan/token state — there's no separate "signup"
// step of our own anymore. Shared by both the web (cookie-session) and
// mobile (Bearer-token) identity paths below.
async function resolveUser(sub: string, email: string | null) {
  const user =
    (await prisma.user.findUnique({ where: { auth0Sub: sub } })) ??
    (await prisma.user.create({
      data: {
        auth0Sub: sub,
        email: email ?? `${sub}@unknown.voyageai`,
        dayTokens: STANDARD_MONTHLY_TOKENS,
        tokensResetAt: nextMonthlyReset(),
      },
    }));

  return ensureFreshTokens(user);
}

// cache() dedupes this within a single request — Server Components and
// layouts can call getCurrentUser() freely without triggering repeat
// session reads or DB queries for the same request. Cookie-session only —
// this is what web pages use. API routes the mobile app calls use
// getCurrentUserForRequest() below instead.
export const getCurrentUser = cache(async () => {
  const session = await auth0.getSession();
  const authUser = session?.user;
  if (!authUser?.sub) return null;
  return resolveUser(authUser.sub, authUser.email ?? null);
});

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJwks() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`));
  }
  return jwks;
}

/**
 * Identity resolution for API routes the mobile app calls (currently
 * /api/plan, /api/geocode, /api/account/plan) — checks for a mobile
 * Authorization: Bearer <Auth0 access token JWT> first, verified against
 * Auth0's JWKS (issuer + the mobile-only API audience, so a token minted
 * for some other Auth0 API can't be replayed here). Falls back to the same
 * cookie session getCurrentUser() uses, so the *web* app's existing fetch
 * calls to these same routes (same-origin, cookie-authenticated) keep
 * working unchanged.
 */
export async function getCurrentUserForRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length);
    try {
      const { payload } = await jwtVerify(token, getJwks(), {
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        audience: process.env.AUTH0_MOBILE_AUDIENCE,
      });
      if (typeof payload.sub !== "string") return null;
      const email = typeof payload.email === "string" ? payload.email : null;
      return resolveUser(payload.sub, email);
    } catch {
      // Invalid/expired/wrong-audience token — treat as unauthenticated
      // rather than throwing, same as a missing cookie session would.
      return null;
    }
  }

  return getCurrentUser();
}
