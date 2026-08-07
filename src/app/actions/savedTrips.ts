"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/dal";
import type { Plan } from "@/components/plan/PlanResults";

const SAVED_TRIP_LIFETIME_DAYS = 7;

function newExpiryDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + SAVED_TRIP_LIFETIME_DAYS);
  return d;
}

export type SaveTripResult = { ok: true } | { ok: false; error: "signin" | "server" };

/**
 * Bookmarks an already-generated plan as-is — saving doesn't touch
 * dayTokens, that was already spent by the /api/plan call that produced it.
 */
export async function saveTrip(plan: Plan): Promise<SaveTripResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "signin" };

  try {
    await prisma.savedTrip.create({
      data: { userId: user.id, plan: plan as object, kind: "saved", expiresAt: newExpiryDate() },
    });
    revalidatePath("/saved-trips");
    return { ok: true };
  } catch (error) {
    console.error("saveTrip failed:", error);
    return { ok: false, error: "server" };
  }
}

export async function deleteSavedTrip(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  // kind: "saved" — history rows aren't a managed collection, no
  // delete/extend affordance is exposed for them client-side, and this
  // scopes the server side to match rather than trusting the client.
  await prisma.savedTrip.deleteMany({ where: { id, userId: user.id, kind: "saved" } });
  revalidatePath("/saved-trips");
}

/** Resets expiresAt to another 7 days out, regardless of how much was left. */
export async function extendSavedTrip(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  await prisma.savedTrip.updateMany({
    where: { id, userId: user.id, kind: "saved" },
    data: { expiresAt: newExpiryDate() },
  });
  revalidatePath("/saved-trips");
}
