import "server-only";
import { prisma } from "@/lib/db";
import type { User } from "@/generated/prisma/client";

// The free "Standard" plan's monthly allowance, in trip-days — not trips.
// A single 3-day trip and three separate 1-day trips both cost 3 tokens.
export const STANDARD_MONTHLY_TOKENS = 3;

export function nextMonthlyReset(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 1);
  return d;
}

/**
 * Lazily refills a Standard-plan user's token balance once their monthly
 * cycle has elapsed. There's no background scheduler in this app, so the
 * reset happens the next time the user is looked up rather than on a timer.
 * Pro users are left untouched — their balance is never checked or spent.
 */
export async function ensureFreshTokens(user: User): Promise<User> {
  if (user.plan !== "standard") return user;
  if (user.tokensResetAt > new Date()) return user;

  return prisma.user.update({
    where: { id: user.id },
    data: {
      dayTokens: STANDARD_MONTHLY_TOKENS,
      tokensResetAt: nextMonthlyReset(),
    },
  });
}

export function hasEnoughTokens(user: User, days: number): boolean {
  return user.plan === "pro" || user.dayTokens >= days;
}

export async function consumeTokens(userId: string, days: number): Promise<void> {
  // Only Standard users have a balance to spend — this is only ever called
  // after hasEnoughTokens() confirmed the user isn't on "pro".
  await prisma.user.update({
    where: { id: userId },
    data: { dayTokens: { decrement: days } },
  });
}
