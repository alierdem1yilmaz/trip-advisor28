"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Search } from "lucide-react";
import { SimpleHeader } from "@/components/SimpleHeader";
import { usePlaceCheck, PlaceStatusRow } from "@/components/PlaceCheck";
import { useLanguage } from "@/lib/i18n/language-context";
import { addDaysIso, todayIso } from "@/lib/dates";

/**
 * Pure search form — submitting navigates to /hotels/results, a real
 * server-rendered page keyed off the URL's query params. Results used to
 * live in this component's client state instead, which meant the hotel
 * detail page's "back to results" link had nothing reliable to restore —
 * a real destination URL fixes that outright (and gives free browser
 * back/forward support, sharable links, etc.).
 */
export function HotelsContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const today = useMemo(() => todayIso(), []);

  const [destination, setDestination] = useState("");
  const [destinationOverride, setDestinationOverride] = useState(false);
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(addDaysIso(today, 2));
  const [adults, setAdults] = useState(2);
  const [navigating, setNavigating] = useState(false);

  const destinationCheck = usePlaceCheck(destination);
  const destinationBlocked = destinationCheck.status === "notfound" && !destinationOverride;
  const canSearch = destination.trim().length > 0 && !destinationBlocked && checkOutDate > checkInDate;

  function handleSearch() {
    if (!canSearch) return;
    setNavigating(true);
    const params = new URLSearchParams({
      destination,
      checkin: checkInDate,
      checkout: checkOutDate,
      adults: String(adults),
    });
    router.push(`/hotels/results?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-paper">
      <SimpleHeader />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
          {t.hotels.title}
        </h1>
        <p className="mt-2 text-ink-soft">{t.hotels.subtitle}</p>

        <div className="mt-8 space-y-4 rounded-2xl border border-line bg-paper-dim p-6">
          <label className="block">
            <span className="mb-2 block text-sm text-ink-soft">{t.hotels.destinationLabel}</span>
            <div className="relative">
              <MapPin className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setDestinationOverride(false);
                }}
                placeholder={t.hotels.destinationPlaceholder}
                maxLength={60}
                className="w-full rounded-xl border border-line bg-paper py-3 pr-4 pl-10 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
              />
            </div>
            <PlaceStatusRow
              status={destinationCheck.status}
              resolvedName={destinationCheck.resolvedName}
              override={destinationOverride}
              onContinueAnyway={() => setDestinationOverride(true)}
              t={t}
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-2 block text-sm text-ink-soft">{t.hotels.checkInLabel}</span>
              <input
                type="date"
                value={checkInDate}
                min={today}
                onChange={(e) => {
                  setCheckInDate(e.target.value);
                  if (checkOutDate <= e.target.value) setCheckOutDate(addDaysIso(e.target.value, 1));
                }}
                className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-base text-ink focus:border-accent focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-ink-soft">{t.hotels.checkOutLabel}</span>
              <input
                type="date"
                value={checkOutDate}
                min={addDaysIso(checkInDate, 1)}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-base text-ink focus:border-accent focus:outline-none"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-ink-soft">{t.hotels.adultsLabel}</span>
            <input
              type="number"
              min={1}
              max={10}
              value={adults}
              onChange={(e) => setAdults(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
              className="w-24 rounded-xl border border-line bg-paper px-4 py-3 text-base text-ink focus:border-accent focus:outline-none"
            />
          </label>

          <button
            type="button"
            onClick={handleSearch}
            disabled={!canSearch || navigating}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-6 py-3.5 text-base font-semibold text-paper transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {navigating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {navigating ? t.hotels.searching : t.hotels.searchButton}
          </button>
        </div>
      </div>
    </div>
  );
}
