import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { AccountContent } from "./AccountContent";

export const metadata: Metadata = {
  title: "Your account — VoyageAI",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <AccountContent
      email={user.email}
      plan={user.plan as "standard" | "pro"}
      dayTokens={user.dayTokens}
      tokensResetAt={user.tokensResetAt.toISOString()}
    />
  );
}
