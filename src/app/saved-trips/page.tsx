import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { prisma } from "@/lib/db";
import type { Plan } from "@/components/plan/PlanResults";
import { SavedTripsContent } from "./SavedTripsContent";

export const metadata: Metadata = {
  title: "Saved trips — VoyageAI",
};

export default async function SavedTripsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const trips = await prisma.savedTrip.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const toContentTrip = (trip: (typeof trips)[number]) => ({
    id: trip.id,
    plan: trip.plan as unknown as Plan,
    createdAt: trip.createdAt.toISOString(),
    expiresAt: trip.expiresAt.toISOString(),
  });

  return (
    <SavedTripsContent
      savedTrips={trips.filter((t) => t.kind === "saved").map(toContentTrip)}
      historyTrips={trips.filter((t) => t.kind === "history").map(toContentTrip)}
    />
  );
}
