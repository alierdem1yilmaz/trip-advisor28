import { corsJson, corsPreflight } from "@/lib/cors";
import { getCurrentUserForRequest } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import { STANDARD_MONTHLY_TOKENS, nextMonthlyReset } from "@/lib/plan-limits";

export const runtime = "nodejs";

/**
 * JSON equivalent of src/app/actions/auth.ts's setPlan Server Action — that
 * action is a Next.js RSC-form mechanism the mobile app has no way to call
 * directly, so this route wraps the same logic behind a plain fetchable
 * endpoint. Same free, self-serve beta toggle (no billing yet); same
 * dual-auth (Bearer token or, if ever called same-origin, cookie session).
 */
export async function OPTIONS() {
  return corsPreflight();
}

/** Current account status — plan, remaining tokens, next reset date. */
export async function GET(request: Request) {
  const user = await getCurrentUserForRequest(request);
  if (!user) {
    return corsJson({ error: "Sign in required.", code: "SIGN_IN_REQUIRED" }, { status: 401 });
  }
  return corsJson({
    email: user.email,
    plan: user.plan,
    dayTokens: user.dayTokens,
    tokensResetAt: user.tokensResetAt.toISOString(),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUserForRequest(request);
  if (!user) {
    return corsJson({ error: "Sign in required.", code: "SIGN_IN_REQUIRED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return corsJson({ error: "Invalid JSON body." }, { status: 400 });
  }
  const { plan } = (body ?? {}) as { plan?: unknown };
  if (plan !== "standard" && plan !== "pro") {
    return corsJson({ error: 'plan must be "standard" or "pro".' }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data:
      plan === "pro"
        ? { plan: "pro" }
        : { plan: "standard", dayTokens: STANDARD_MONTHLY_TOKENS, tokensResetAt: nextMonthlyReset() },
  });

  return corsJson({
    plan: updated.plan,
    dayTokens: updated.dayTokens,
    tokensResetAt: updated.tokensResetAt.toISOString(),
  });
}
