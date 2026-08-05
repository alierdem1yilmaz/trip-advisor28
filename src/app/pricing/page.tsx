import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/dal";
import { PricingContent } from "./PricingContent";

export const metadata: Metadata = {
  title: "Pricing — VoyageAI",
};

export default async function PricingPage() {
  const user = await getCurrentUser();
  return (
    <PricingContent
      isSignedIn={!!user}
      plan={(user?.plan as "standard" | "pro") ?? null}
    />
  );
}
