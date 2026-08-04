import type { Metadata } from "next";
import { TripBuilder } from "@/components/plan/TripBuilder";

export const metadata: Metadata = {
  title: "Build a trip — VoyageAI",
  description: "Tell VoyageAI the shape of your trip and get a full day-by-day plan, explained.",
};

export default function PlanPage() {
  return <TripBuilder />;
}
