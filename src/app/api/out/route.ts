import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { vendorOutboundUrl } from "@/lib/makcorps";
import { isValidIsoDate, todayIso, addDaysIso } from "@/lib/dates";

export const runtime = "nodejs";

const MAX_FIELD_LENGTH = 80;

/**
 * Tracked outbound redirect for comparison-site clicks — this is the raw
 * feed for the Phase 2 "how many users did we send to each site" export.
 * Deliberately does NOT accept a destination URL from the client: the
 * target is always rebuilt server-side via vendorOutboundUrl() from
 * trusted, structured params, so this can never be turned into an open
 * redirect to an arbitrary attacker-controlled URL.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vendor = searchParams.get("vendor")?.trim().slice(0, MAX_FIELD_LENGTH);
  const hotelName = searchParams
    .get("hotelName")
    ?.trim()
    .slice(0, MAX_FIELD_LENGTH);
  const destination = searchParams
    .get("destination")
    ?.trim()
    .slice(0, MAX_FIELD_LENGTH);
  const adults = Math.max(
    1,
    Math.min(10, Number(searchParams.get("adults")) || 2),
  );

  if (!vendor || !hotelName || !destination) {
    return NextResponse.redirect(new URL("/hotels", request.url));
  }

  const today = todayIso();
  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");
  const checkInDate = checkin && isValidIsoDate(checkin) ? checkin : today;
  const checkOutDate =
    checkout && isValidIsoDate(checkout)
      ? checkout
      : addDaysIso(checkInDate, 2);

  const target = vendorOutboundUrl(
    vendor,
    hotelName,
    destination,
    checkInDate,
    checkOutDate,
    adults,
  );

  try {
    await prisma.vendorClick.create({
      data: { vendor, hotelName, destination },
    });
  } catch (error) {
    console.error("vendor click logging failed:", error);
  }

  return NextResponse.redirect(target);
}
