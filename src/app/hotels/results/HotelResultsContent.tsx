"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Flame,
  ImageOff,
  List,
  Map as MapIcon,
  Star,
} from "lucide-react";
import { SimpleHeader } from "@/components/SimpleHeader";
import { useLanguage } from "@/lib/i18n/language-context";
import type { HotelResult } from "@/lib/liteapi";
import { FilterSidebar } from "./FilterSidebar";

// Leaflet touches `window` at import time — must be client-only, same
// pattern as the trip-itinerary map (src/components/plan/StopMap.tsx).
const HotelsMap = dynamic(
  () => import("./HotelsMap").then((m) => m.HotelsMap),
  { ssr: false },
);

type SortOption = "recommended" | "price_asc" | "price_desc" | "rating_desc";

type SearchContext = {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
};

const MAX_RECOMMENDED = 6;

/** Top hotels by review count — the strongest "real interest" signal the API gives us. */
function recommendedIds(list: HotelResult[]): Set<string> {
  return new Set(
    [...list]
      .filter((h) => (h.reviewCount ?? 0) > 0)
      .sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
      .slice(0, MAX_RECOMMENDED)
      .map((h) => h.hotelId),
  );
}

export function HotelResultsContent({
  hotels,
  searchContext,
  error,
}: {
  hotels: HotelResult[];
  searchContext: SearchContext;
  error?: "destination_not_found" | "not_configured" | "server";
}) {
  const { t } = useLanguage();
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sort, setSort] = useState<SortOption>("recommended");
  const [view, setView] = useState<"list" | "map">("list");

  const sortedPrices = useMemo(
    () =>
      hotels
        .filter(
          (
            h,
          ): h is HotelResult & { price: NonNullable<HotelResult["price"]> } =>
            !!h.price,
        )
        .map((h) => Number(h.price.total))
        .sort((a, b) => a - b),
    [hotels],
  );
  const priceBounds: [number, number] | null = useMemo(
    () =>
      sortedPrices.length > 0
        ? [
            Math.floor(sortedPrices[0]),
            Math.ceil(sortedPrices[sortedPrices.length - 1]),
          ]
        : null,
    [sortedPrices],
  );
  const [priceRange, setPriceRange] = useState<[number, number]>(
    priceBounds ?? [0, 0],
  );
  // Keeps the slider's range in sync if a new search result set arrives with different bounds.
  const [boundsKey, setBoundsKey] = useState(priceBounds?.join(","));
  if (priceBounds && priceBounds.join(",") !== boundsKey) {
    setBoundsKey(priceBounds.join(","));
    setPriceRange(priceBounds);
  }

  const recommended = useMemo(() => recommendedIds(hotels), [hotels]);

  const displayedHotels = useMemo(() => {
    const priceFilterActive =
      !!priceBounds &&
      (priceRange[0] > priceBounds[0] || priceRange[1] < priceBounds[1]);
    const filtered = hotels.filter((h) => {
      if (minRating !== null && (h.rating ?? 0) < minRating) return false;
      if (priceFilterActive) {
        if (!h.price) return false;
        const p = Number(h.price.total);
        if (p < priceRange[0] || p > priceRange[1]) return false;
      }
      return true;
    });

    if (sort === "recommended") return filtered;
    const sorted = [...filtered];
    if (sort === "price_asc" || sort === "price_desc") {
      sorted.sort((a, b) => {
        if (!a.price && !b.price) return 0;
        if (!a.price) return 1;
        if (!b.price) return -1;
        const diff = Number(a.price.total) - Number(b.price.total);
        return sort === "price_asc" ? diff : -diff;
      });
    } else if (sort === "rating_desc") {
      sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    }
    return sorted;
  }, [hotels, minRating, priceRange, priceBounds, sort]);

  const hotelsWithCoords = useMemo(
    () => displayedHotels.filter((h) => h.lat != null && h.lon != null),
    [displayedHotels],
  );
  const mapCenter: [number, number] | null =
    hotelsWithCoords.length > 0
      ? [
          hotelsWithCoords.reduce((sum, h) => sum + h.lat!, 0) /
            hotelsWithCoords.length,
          hotelsWithCoords.reduce((sum, h) => sum + h.lon!, 0) /
            hotelsWithCoords.length,
        ]
      : null;

  const detailParams = new URLSearchParams({
    checkin: searchContext.checkInDate,
    checkout: searchContext.checkOutDate,
    adults: String(searchContext.adults),
    destination: searchContext.destination,
  });

  return (
    <div className="min-h-screen bg-paper">
      <SimpleHeader>
        <Link
          href="/hotels"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.hotels.modifySearch}
        </Link>
      </SimpleHeader>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          {searchContext.destination}
        </h1>
        <p className="mt-1 text-sm text-ink-faint">
          {searchContext.checkInDate} – {searchContext.checkOutDate} ·{" "}
          {t.hotels.adultsLabel}: {searchContext.adults}
        </p>

        {error ? (
          <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {error === "destination_not_found"
              ? t.hotels.destinationNotFound
              : t.hotels.error}
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
            <FilterSidebar
              minRating={minRating}
              onRatingChange={setMinRating}
              priceBounds={priceBounds}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              sortedPrices={sortedPrices}
              onClear={() => {
                setMinRating(null);
                if (priceBounds) setPriceRange(priceBounds);
              }}
            />

            {displayedHotels.length === 0 ? (
              <p className="text-ink-faint">{t.hotels.noResults}</p>
            ) : (
              <div>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm text-ink-soft">
                    {t.hotels.sortLabel}
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortOption)}
                      className="rounded-lg border border-line bg-paper px-2.5 py-1.5 text-sm text-ink focus:border-accent focus:outline-none"
                    >
                      <option value="recommended">
                        {t.hotels.sortRecommended}
                      </option>
                      <option value="price_asc">{t.hotels.sortPriceAsc}</option>
                      <option value="price_desc">
                        {t.hotels.sortPriceDesc}
                      </option>
                      <option value="rating_desc">{t.hotels.sortRating}</option>
                    </select>
                  </label>

                  {mapCenter && (
                    <div className="flex items-center gap-1 rounded-lg border border-line p-1">
                      <button
                        type="button"
                        onClick={() => setView("list")}
                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                          view === "list"
                            ? "bg-ink text-paper"
                            : "text-ink-soft hover:bg-paper-dim"
                        }`}
                      >
                        <List className="h-3.5 w-3.5" />
                        {t.hotels.viewList}
                      </button>
                      <button
                        type="button"
                        onClick={() => setView("map")}
                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                          view === "map"
                            ? "bg-ink text-paper"
                            : "text-ink-soft hover:bg-paper-dim"
                        }`}
                      >
                        <MapIcon className="h-3.5 w-3.5" />
                        {t.hotels.viewMap}
                      </button>
                    </div>
                  )}
                </div>

                {view === "map" && mapCenter ? (
                  <div className="h-[600px] overflow-hidden rounded-2xl border border-line">
                    <HotelsMap
                      hotels={hotelsWithCoords.map((h) => ({
                        hotelId: h.hotelId,
                        name: h.name,
                        price: h.price,
                        lat: h.lat!,
                        lon: h.lon!,
                        detailHref: `/hotels/${h.hotelId}?${detailParams.toString()}&name=${encodeURIComponent(h.name)}`,
                      }))}
                      center={mapCenter}
                    />
                  </div>
                ) : (
                  <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {displayedHotels.map((hotel) => (
                      <li key={hotel.hotelId}>
                        <Link
                          href={`/hotels/${hotel.hotelId}?${detailParams.toString()}&name=${encodeURIComponent(hotel.name)}`}
                          className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-paper-dim transition hover:border-ink/20"
                        >
                          <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-paper">
                            {hotel.mainPhoto ? (
                              <Image
                                src={hotel.mainPhoto}
                                alt={hotel.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover transition group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-ink-faint">
                                <ImageOff className="h-8 w-8" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col p-5">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-ink group-hover:text-accent">
                                {hotel.name}
                              </p>
                              {recommended.has(hotel.hotelId) && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent-dark">
                                  <Flame className="h-3 w-3" />
                                  {t.hotels.recommendedBadge}
                                </span>
                              )}
                            </div>
                            {hotel.address && (
                              <p className="mt-1 text-sm text-ink-faint">
                                {hotel.address}
                              </p>
                            )}
                            <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
                              {hotel.rating != null && (
                                <span
                                  title={t.hotels.ratingLabel}
                                  className="inline-flex items-center gap-1 text-xs font-medium text-amber-600"
                                >
                                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                  {hotel.rating}
                                </span>
                              )}
                              {!!hotel.reviewCount && (
                                <span className="text-xs text-ink-faint">
                                  {t.hotels.reviewCount(hotel.reviewCount)}
                                </span>
                              )}
                              <span className="ml-auto text-sm font-semibold text-ink">
                                {hotel.price
                                  ? `${hotel.price.total} ${hotel.price.currency}`
                                  : t.hotels.priceUnavailable}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
