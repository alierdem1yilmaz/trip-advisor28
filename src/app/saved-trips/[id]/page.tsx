import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import type { Plan } from "@/components/plan/PlanResults";
import { SavedTripDetailContent } from "./SavedTripDetailContent";

export const metadata: Metadata = {
  title: "Saved trip — VoyageAI",
};

export default async function SavedTripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const trip = await prisma.savedTrip.findFirst({ where: { id, userId: user.id } });
  if (!trip) notFound();

  return <SavedTripDetailContent plan={trip.plan as unknown as Plan} />;
}
