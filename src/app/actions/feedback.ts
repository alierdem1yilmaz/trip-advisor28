"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/dal";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_EMAIL_LENGTH = 254;

export type SubmitFeedbackResult = { ok: true } | { ok: false; error: "empty" | "too_long" | "server" };

/**
 * Open to signed-out visitors too — a contact form doesn't need an account.
 * Signed-in users' email is captured automatically instead of asking again.
 */
export async function submitFeedback(message: string, email?: string): Promise<SubmitFeedbackResult> {
  const trimmed = message.trim();
  if (!trimmed) return { ok: false, error: "empty" };
  if (trimmed.length > MAX_MESSAGE_LENGTH) return { ok: false, error: "too_long" };

  try {
    const user = await getCurrentUser();
    await prisma.feedback.create({
      data: {
        userId: user?.id ?? null,
        email: user?.email ?? (email?.trim().slice(0, MAX_EMAIL_LENGTH) || null),
        message: trimmed,
      },
    });
    return { ok: true };
  } catch (error) {
    console.error("feedback submission failed:", error);
    return { ok: false, error: "server" };
  }
}
