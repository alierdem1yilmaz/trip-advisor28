import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/dal";
import { FeedbackContent } from "./FeedbackContent";

export const metadata: Metadata = {
  title: "Feedback — VoyageAI",
};

export default async function FeedbackPage() {
  const user = await getCurrentUser();

  return <FeedbackContent userEmail={user?.email ?? null} />;
}
