import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { auth0 } from "@/lib/auth0";
import { ensureFreshTokens, STANDARD_MONTHLY_TOKENS, nextMonthlyReset } from "@/lib/plan-limits";

// cache() dedupes this within a single request — Server Components,
// layouts, and API routes can all call getCurrentUser() freely without
// triggering repeat session reads or DB queries for the same request.
export const getCurrentUser = cache(async () => {
  const session = await auth0.getSession();
  const authUser = session?.user;
  if (!authUser?.sub) return null;

  // Auth0 owns identity; this app only learns about a given user the first
  // time it sees their session, at which point it provisions the local row
  // that actually tracks plan/token state — there's no separate "signup"
  // step of our own anymore.
  const user =
    (await prisma.user.findUnique({ where: { auth0Sub: authUser.sub } })) ??
    (await prisma.user.create({
      data: {
        auth0Sub: authUser.sub,
        email: authUser.email ?? `${authUser.sub}@unknown.voyageai`,
        dayTokens: STANDARD_MONTHLY_TOKENS,
        tokensResetAt: nextMonthlyReset(),
      },
    }));

  return ensureFreshTokens(user);
});
