const BASE_URL = "https://api.makcorps.com";

export class MakcorpsNotConfiguredError extends Error {
  constructor() {
    super("MAKCORPS_API_KEY is not set");
    this.name = "MakcorpsNotConfiguredError";
  }
}

function apiKey(): string {
  const key = process.env.MAKCORPS_API_KEY;
  if (!key) throw new MakcorpsNotConfiguredError();
  return key;
}

export type VendorPrice = { name: string; price: number };

/** Parses Makcorps' "$1,443"-style price strings. Null in, null out — a vendor with no price for these dates. */
function parseVendorPrice(raw: unknown): number | null {
  if (typeof raw !== "string") return null;
  const n = Number(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Makcorps returns vendor/price pairs as numbered sibling keys (vendor1/
 * price1, vendor2/price2, ...) on the same object rather than an array —
 * walk numbered keys until one is missing.
 */
function parseVendorPairs(row: Record<string, unknown>): VendorPrice[] {
  const vendors: VendorPrice[] = [];
  for (let i = 1; ; i++) {
    const name = row[`vendor${i}`];
    if (typeof name !== "string") break;
    const price = parseVendorPrice(row[`price${i}`]);
    if (price !== null) vendors.push({ name, price });
  }
  return vendors;
}

/**
 * Resolves a hotel name + destination to Makcorps' own hotel ID via their
 * mapping API — combining name and destination cuts down on cross-matching
 * a same-named hotel in the wrong city. Only called from the detail page
 * (never the results list), so a search only spends Makcorps quota once
 * the traveler actually opens a specific hotel. Prefers an explicit
 * type: "HOTEL" result; falls back to the first hit otherwise.
 */
export async function resolveHotelId(
  hotelName: string,
  destination: string,
): Promise<string | null> {
  const key = apiKey();
  const query = `${hotelName}, ${destination}`;
  const res = await fetch(
    `${BASE_URL}/mapping?name=${encodeURIComponent(query)}&api_key=${key}`,
    {
      signal: AbortSignal.timeout(8000),
    },
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const results = data as {
    type?: string;
    document_id?: string;
    value?: number;
  }[];
  const hotel = results.find((r) => r.type === "HOTEL") ?? results[0];
  return (
    hotel.document_id ?? (hotel.value != null ? String(hotel.value) : null)
  );
}

/**
 * Full vendor comparison (15+ sites) for a single hotel's detail page. The
 * response carries no hotel identity fields (name/address) — those are
 * carried over via URL params from the results-page link instead.
 */
export async function getHotelComparison({
  hotelId,
  checkInDate,
  checkOutDate,
  adults,
}: {
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
}): Promise<VendorPrice[]> {
  const key = apiKey();
  const params = new URLSearchParams({
    hotelid: hotelId,
    rooms: "1",
    adults: String(adults),
    cur: "USD",
    checkin: checkInDate,
    checkout: checkOutDate,
    api_key: key,
  });
  const res = await fetch(`${BASE_URL}/hotel?${params.toString()}`, {
    signal: AbortSignal.timeout(15000),
  });
  if (res.status === 404) return [];
  if (!res.ok)
    throw new Error(`Makcorps hotel comparison failed: ${res.status}`);
  const data = await res.json();
  const rows = Array.isArray(data?.comparison?.[0]) ? data.comparison[0] : [];

  const vendors: VendorPrice[] = [];
  for (const row of rows as Record<string, unknown>[]) {
    vendors.push(...parseVendorPairs(row));
  }
  return vendors.sort((a, b) => a.price - b.price);
}

const KNOWN_VENDOR_URLS: Record<
  string,
  (h: string, d: string, ci: string, co: string, a: number) => string
> = {
  "booking.com": (h, d, ci, co, a) =>
    `https://www.booking.com/searchresults.html?${new URLSearchParams({
      ss: `${h}, ${d}`,
      checkin: ci,
      checkout: co,
      group_adults: String(a),
    })}`,
  "expedia.com": (h, d, ci, co, a) =>
    `https://www.expedia.com/Hotel-Search?${new URLSearchParams({
      destination: `${h}, ${d}`,
      startDate: ci,
      endDate: co,
      adults: String(a),
    })}`,
  "hotels.com": (h, d) =>
    `https://www.hotels.com/search.do?${new URLSearchParams({ q: `${h}, ${d}` })}`,
  "agoda.com": (h, d) =>
    `https://www.agoda.com/search?${new URLSearchParams({ q: `${h}, ${d}` })}`,
  "trip.com": (h, d) =>
    `https://www.trip.com/hotels/list?${new URLSearchParams({ keyword: `${h}, ${d}` })}`,
  priceline: (h, d) =>
    `https://www.priceline.com/relax/dtl/${encodeURIComponent(`${h} ${d}`)}`,
  travelocity: (h, d) =>
    `https://www.travelocity.com/Hotel-Search?${new URLSearchParams({ destination: `${h}, ${d}` })}`,
  tripadvisor: (h, d) =>
    `https://www.tripadvisor.com/Search?${new URLSearchParams({ q: `${h} ${d}` })}`,
  "skyscanner.com": (h, d) =>
    `https://www.skyscanner.com/hotels/search?${new URLSearchParams({ query: `${h}, ${d}` })}`,
};

/**
 * A real, working outbound link for a vendor row — never a fabricated
 * booking link. Known majors get a pre-filled search URL (same idea as the
 * original bookingSearchUrl()); an unrecognized-but-domain-shaped vendor
 * name (e.g. "ZenHotels.com") gets a plain link to its homepage; anything
 * else falls back to a web search so the link is still honest and useful.
 */
export function vendorOutboundUrl(
  vendor: string,
  hotelName: string,
  destination: string,
  checkInDate: string,
  checkOutDate: string,
  adults: number,
): string {
  const key = vendor.trim().toLowerCase();
  const builder = KNOWN_VENDOR_URLS[key];
  if (builder)
    return builder(hotelName, destination, checkInDate, checkOutDate, adults);

  if (/^[a-z0-9-]+\.[a-z]{2,}$/i.test(vendor.trim())) {
    return `https://www.${vendor.trim().replace(/^www\./i, "")}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(`${vendor} ${hotelName} ${destination}`)}`;
}
