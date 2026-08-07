import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHotelDetails } from "@/lib/liteapi";
import {
  resolveHotelId,
  getHotelComparison,
  type VendorPrice,
} from "@/lib/makcorps";
import { addDaysIso, isValidIsoDate, todayIso } from "@/lib/dates";
import { HotelDetailContent } from "./HotelDetailContent";

export const metadata: Metadata = {
  title: "Hotel — VoyageAI",
};

/** Best-effort — a failed/empty comparison never blocks the rest of the page. */
async function fetchComparison(
  name: string,
  destination: string,
  checkInDate: string,
  checkOutDate: string,
  adults: number,
): Promise<VendorPrice[]> {
  try {
    const makcorpsId = await resolveHotelId(name, destination);
    if (!makcorpsId) return [];
    return await getHotelComparison({
      hotelId: makcorpsId,
      checkInDate,
      checkOutDate,
      adults,
    });
  } catch (error) {
    console.error("price comparison fetch failed:", error);
    return [];
  }
}

export default async function HotelDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ hotelId: string }>;
  searchParams: Promise<{
    checkin?: string;
    checkout?: string;
    adults?: string;
    destination?: string;
    name?: string;
  }>;
}) {
  const { hotelId } = await params;
  const sp = await searchParams;

  // Falls back to the same defaults the search form itself uses whenever
  // this page is opened without search context (e.g. a shared/bookmarked
  // link) — never crashes, just re-prices for a sensible default stay.
  const today = todayIso();
  const checkInDate =
    sp.checkin && isValidIsoDate(sp.checkin) ? sp.checkin : today;
  const checkOutDate =
    sp.checkout && isValidIsoDate(sp.checkout) && sp.checkout > checkInDate
      ? sp.checkout
      : addDaysIso(checkInDate, 2);
  const adults = Math.max(1, Math.min(10, Number(sp.adults) || 2));
  const destination = sp.destination?.trim() || "";

  const details = await getHotelDetails(hotelId);
  if (!details) notFound();

  // The price-comparison table matches against Makcorps' own catalog by
  // name — the results-page link already carries it as `name`; a shared/
  // bookmarked link without it falls back to LiteAPI's own resolved name.
  const hotelName = sp.name?.trim() || details.name;
  const vendors = await fetchComparison(
    hotelName,
    destination,
    checkInDate,
    checkOutDate,
    adults,
  );

  return (
    <HotelDetailContent
      hotelId={hotelId}
      details={details}
      vendors={vendors}
      searchContext={{ destination, checkInDate, checkOutDate, adults }}
    />
  );
}
