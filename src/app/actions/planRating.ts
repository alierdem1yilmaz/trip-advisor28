"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/dal";
import { todayIso } from "@/lib/dates";

const ELIGIBILITY_WINDOW_DAYS = 7;
const MAX_COMMENT_LENGTH = 1000;

export type PendingPlanRating = {
  id: string;
  destination: string;
};

/**
 * The one plan (if any) this traveler should be asked to rate right now —
 * generated on a previous calendar day, not yet rated or dismissed, and not
 * so old the prompt would feel out of place. Called once on app mount by
 * PlanRatingPrompt.
 */
export async function getPendingPlanRating(): Promise<PendingPlanRating | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const startOfToday = new Date(`${todayIso()}T00:00:00`);
  const windowStart = new Date(startOfToday);
  windowStart.setDate(windowStart.getDate() - ELIGIBILITY_WINDOW_DAYS);

  const pending = await prisma.planRating.findFirst({
    where: {
      userId: user.id,
      respondedAt: null,
      dismissed: false,
      createdAt: { lt: startOfToday, gte: windowStart },
    },
    orderBy: { createdAt: "asc" },
  });

  return pending ? { id: pending.id, destination: pending.destination } : null;
}

export async function submitPlanRating(
  id: string,
  rating: number,
  comment?: string,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return;

  await prisma.planRating.updateMany({
    where: { id, userId: user.id },
    data: {
      rating,
      comment: comment?.trim().slice(0, MAX_COMMENT_LENGTH) || null,
      respondedAt: new Date(),
    },
  });
}

export async function dismissPlanRating(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  await prisma.planRating.updateMany({
    where: { id, userId: user.id },
    data: { dismissed: true },
  });
}
