"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/dal";
import { STANDARD_MONTHLY_TOKENS, nextMonthlyReset } from "@/lib/plan-limits";

// Sign up / sign in / sign out are all handled by the Auth0 SDK's own
// /auth/login, /auth/logout, and /auth/callback routes (mounted by the
// proxy — see src/proxy.ts) — there's nothing left for this app to do
// there. This file now only holds the app-specific plan toggle.

/**
 * Flips the current user's plan. There's no billing integration yet — this
 * is a free, self-serve toggle for trying the Pro tier during the beta, per
 * the product decision to launch the tier system before wiring up real
 * payments. Swap this for a real checkout flow when that's ready.
 */
export async function setPlan(plan: "standard" | "pro") {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  await prisma.user.update({
    where: { id: user.id },
    data:
      plan === "pro"
        ? { plan: "pro" }
        : { plan: "standard", dayTokens: STANDARD_MONTHLY_TOKENS, tokensResetAt: nextMonthlyReset() },
  });
  redirect("/account");
}
