"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  ImageOff,
  Loader2,
  MapPin,
  Star,
} from "lucide-react";
import { SimpleHeader } from "@/components/SimpleHeader";
import { useLanguage } from "@/lib/i18n/language-context";
import type { HotelDetails, HotelReview } from "@/lib/liteapi";
import type { VendorPrice } from "@/lib/makcorps";

// Facility lists from LiteAPI can run 20-30 items long — collapsed to a
// manageable first screen with a "+N more" expander.
const FACILITIES_COLLAPSED_COUNT = 12;

export function HotelDetailContent({
  hotelId,
  details,
  vendors,
  searchContext,
}: {
  hotelId: string;
  details: HotelDetails;
  vendors: VendorPrice[];
  searchContext: {
    destination: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
  };
}) {
  const { t, language } = useLanguage();
  const [activeImage, setActiveImage] = useState(0);
  const image = details.images[activeImage];

  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const facilities = details.facilities ?? [];
  const visibleFacilities = showAllFacilities
    ? facilities
    : facilities.slice(0, FACILITIES_COLLAPSED_COUNT);

  // Reviews are fetched client-side rather than passed down from the server
  // component — the site's active language lives in localStorage only, so
  // the server render has no way to know it yet. Two requests fire in
  // parallel: the untranslated one resolves in under a second and renders
  // immediately, the translated one (an LLM call) lands a few seconds later
  // and swaps the text in place — translating first would mean staring at
  // a spinner for the full round trip instead of reading real reviews
  // right away. Re-runs if the visitor switches language mid-visit.
  const [reviews, setReviews] = useState<HotelReview[] | null>(null);
  const [translating, setTranslating] = useState(false);
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: resets to the loading state when hotelId/language changes, same pattern as usePlaceCheck (src/components/PlaceCheck.tsx)
    setReviews(null);
    setTranslating(true);

    fetch(`/api/hotels/${hotelId}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setReviews(data.reviews ?? []);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      });

    fetch(`/api/hotels/${hotelId}/reviews?language=${language}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          if (data.reviews) setReviews(data.reviews);
          setTranslating(false);
        }
      })
      .catch(() => {
        if (!cancelled) setTranslating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hotelId, language]);

  // /hotels/results is a real server-rendered page keyed off these query
  // params, so linking straight back to it (rather than router.back())
  // always reproduces the same result set, reliably.
  const backParams = new URLSearchParams({
    destination: searchContext.destination,
    checkin: searchContext.checkInDate,
    checkout: searchContext.checkOutDate,
    adults: String(searchContext.adults),
  });

  function outboundHref(vendor: string): string {
    const params = new URLSearchParams({
      vendor,
      hotelName: details.name,
      destination: searchContext.destination,
      checkin: searchContext.checkInDate,
      checkout: searchContext.checkOutDate,
      adults: String(searchContext.adults),
    });
    return `/api/out?${params.toString()}`;
  }

  return (
    <div className="min-h-screen bg-paper">
      <SimpleHeader>
        <Link
          href={`/hotels/results?${backParams.toString()}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.hotels.backToResults}
        </Link>
      </SimpleHeader>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-paper-dim">
          {image ? (
            <Image
              src={image.url}
              alt={image.caption || details.name}
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              priority
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-faint">
              <ImageOff className="h-10 w-10" />
            </div>
          )}
        </div>

        {details.images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {details.images.map((img, i) => (
              <button
                key={img.url + i}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  i === activeImage
                    ? "border-accent"
                    : "border-transparent opacity-80 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.caption || details.name}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="mt-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            {details.name}
          </h1>
          {details.address && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-faint">
              <MapPin className="h-3.5 w-3.5" />
              {details.address}
              {details.city ? `, ${details.city}` : ""}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {details.rating != null && (
              <span
                title={t.hotels.ratingLabel}
                className="inline-flex items-center gap-1 text-sm font-medium text-amber-600"
              >
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                {details.rating}
              </span>
            )}
            {!!details.reviewCount && (
              <span className="text-sm text-ink-faint">
                {t.hotels.reviewCount(details.reviewCount)}
              </span>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-ink">
            {t.hotels.compareTitle}
          </h2>
          {vendors.length === 0 ? (
            <p className="mt-3 text-sm text-ink-faint">{t.hotels.noVendors}</p>
          ) : (
            <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-paper-dim">
              {vendors.map((v, i) => (
                <li
                  key={`${v.name}-${i}`}
                  className="flex items-center justify-between gap-4 px-5 py-3.5"
                >
                  <span className="font-medium text-ink">{v.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-ink">
                      ${v.price.toLocaleString()}
                    </span>
                    <a
                      href={outboundHref(v.name)}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-1 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-accent"
                    >
                      {t.hotels.goToSite}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {details.description && (
          <p className="mt-8 text-sm leading-relaxed text-ink-soft">
            {details.description}
          </p>
        )}

        {facilities.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-ink">
              {t.hotels.facilitiesTitle}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {visibleFacilities.map((facility) => (
                <span
                  key={facility}
                  className="rounded-full border border-line bg-paper-dim px-3.5 py-1.5 text-sm text-ink-soft"
                >
                  {facility}
                </span>
              ))}
              {!showAllFacilities &&
                facilities.length > FACILITIES_COLLAPSED_COUNT && (
                  <button
                    type="button"
                    onClick={() => setShowAllFacilities(true)}
                    className="rounded-full border border-line px-3.5 py-1.5 text-sm font-medium text-accent transition hover:border-accent"
                  >
                    {t.hotels.showMoreFacilities(
                      facilities.length - FACILITIES_COLLAPSED_COUNT,
                    )}
                  </button>
                )}
            </div>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-ink">
            {t.hotels.reviewsTitle}
          </h2>
          {reviews === null ? (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-faint">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t.hotels.reviewsLoading}
            </p>
          ) : reviews.length === 0 ? (
            <p className="mt-3 text-sm text-ink-faint">{t.hotels.noReviews}</p>
          ) : (
            <>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-faint">
                {translating && <Loader2 className="h-3 w-3 animate-spin" />}
                {translating
                  ? t.hotels.translatingNote
                  : t.hotels.reviewsTranslatedNote}
              </p>
              <ul className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {reviews.map((review, i) => (
                  <li
                    key={i}
                    className="rounded-2xl border border-line bg-paper-dim p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-ink">
                        {review.name}
                        {review.country && (
                          <span className="ml-1 text-xs font-normal text-ink-faint uppercase">
                            {review.country}
                          </span>
                        )}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        {review.score}/10
                      </span>
                    </div>
                    {review.headline && (
                      <p className="mt-1 text-sm font-medium text-ink">
                        {review.headline}
                      </p>
                    )}
                    {review.pros && (
                      <p className="mt-2 text-sm text-emerald-700">
                        + {review.pros}
                      </p>
                    )}
                    {review.cons && (
                      <p className="mt-1 text-sm text-red-700">
                        − {review.cons}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
