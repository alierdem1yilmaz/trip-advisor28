import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { geocodeDestination } from "@/lib/opentripmap";
import {
  searchHotels,
  LiteApiNotConfiguredError,
  type HotelResult,
} from "@/lib/liteapi";
import { addDaysIso, isValidIsoDate, todayIso } from "@/lib/dates";
import { HotelResultsContent } from "./HotelResultsContent";

export const metadata: Metadata = {
  title: "Hotel price comparison — VoyageAI",
};

const MAX_ADULTS = 10;

export default async function HotelResultsPage({
  searchParams,
}: {
  searchParams: Promise<{
    destination?: string;
    checkin?: string;
    checkout?: string;
    adults?: string;
  }>;
}) {
  const sp = await searchParams;
  const destination = sp.destination?.trim() ?? "";
  if (!destination) redirect("/hotels");

  const today = todayIso();
  const checkInDate =
    sp.checkin && isValidIsoDate(sp.checkin) ? sp.checkin : today;
  const checkOutDate =
    sp.checkout && isValidIsoDate(sp.checkout) && sp.checkout > checkInDate
      ? sp.checkout
      : addDaysIso(checkInDate, 2);
  const adults = Math.max(1, Math.min(MAX_ADULTS, Number(sp.adults) || 2));

  const searchContext = { destination, checkInDate, checkOutDate, adults };

  let hotels: HotelResult[] = [];
  let error: "destination_not_found" | "not_configured" | "server" | undefined;

  const center = await geocodeDestination(destination);
  if (!center) {
    error = "destination_not_found";
  } else {
    try {
      hotels = await searchHotels({
        lat: center.lat,
        lon: center.lon,
        checkInDate,
        checkOutDate,
        adults,
      });
    } catch (err) {
      error =
        err instanceof LiteApiNotConfiguredError ? "not_configured" : "server";
      console.error("hotel results page failed:", err);
    }
  }

  return (
    <HotelResultsContent
      hotels={hotels}
      searchContext={searchContext}
      error={error}
    />
  );
}
