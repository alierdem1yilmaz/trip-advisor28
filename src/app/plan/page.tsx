import type { Metadata } from "next";
import { TripBuilder } from "@/components/plan/TripBuilder";
import { getCurrentUser } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Build a trip — VoyageAI",
  description: "Tell VoyageAI the shape of your trip and get a full day-by-day plan, explained.",
};

export default async function PlanPage() {
  const user = await getCurrentUser();
  return (
    <TripBuilder
      user={
        user
          ? {
              plan: user.plan as "standard" | "pro",
              dayTokens: user.dayTokens,
              tokensResetAt: user.tokensResetAt.toISOString(),
            }
          : null
      }
    />
  );
}
