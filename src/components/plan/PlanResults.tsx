"use client";

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Loader2,
  MapPin,
  RefreshCw,
  Star,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export type Stop = {
  time: string;
  title: string;
  description: string;
  reason: string;
  estimatedRating?: number;
  priceTier?: "$" | "$$" | "$$$";
  lat?: number;
  lon?: number;
};

export type Weather = {
  tempMaxC: number;
  tempMinC: number;
  condition: "clear" | "cloudy" | "fog" | "rain" | "snow" | "storm";
  label: string;
};

export type Day = {
  day: number;
  date?: string;
  theme: string;
  stops: Stop[];
  weather?: Weather;
};

export type Plan = {
  destination: string;
  center?: { lat: number; lon: number };
  days: Day[];
  groundedPlaceCount?: number;
};

const StopMap = dynamic(() => import("./StopMap").then((m) => m.StopMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-paper-dim text-sm text-ink-faint">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  ),
});

const WEATHER_ICON: Record<Weather["condition"], LucideIcon> = {
  clear: Sun,
  cloudy: Cloud,
  fog: CloudFog,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
};

// Client-side-only abuse guard on the regenerate button — see the
// onRegenerate caller (TripBuilder.tsx) for why there's no server-side cap.
export const MAX_REGENERATE_ATTEMPTS_PER_STOP = 3;

/**
 * Renders a generated (or saved) trip: destination header, day tabs, and
 * the active day's map + stop list. Shared between the live trip-builder
 * flow (TripBuilder.tsx, which wires up onRegenerate) and the read-only
 * saved-trip viewer (/saved-trips/[id], which omits it) so the two never
 * drift out of sync with each other.
 */
export function PlanResults({
  plan,
  onRegenerate,
  regenerating,
  regenerateError,
  regenerateAttempts,
  headerLeft,
  headerRight,
}: {
  plan: Plan;
  onRegenerate?: (day: Day, stopIndex: number) => void;
  regenerating?: Record<string, boolean>;
  regenerateError?: Record<string, string>;
  regenerateAttempts?: Record<string, number>;
  // Optional slots either side of the title — TripBuilder uses these for a
  // prominent "back to menu" / "save trip" pair; the read-only saved-trip
  // viewer omits both since neither action applies there.
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
}) {
  const { t } = useLanguage();
  const [activeDay, setActiveDay] = useState(1);

  return (
    <>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-1 justify-center sm:justify-start">{headerLeft}</div>
        <div className="text-center">
          <p className="text-sm font-medium text-accent">{t.results.dayTrip(plan.days.length)}</p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {plan.destination}
          </h1>
          {!!plan.groundedPlaceCount && plan.groundedPlaceCount > 0 && (
            <p className="mt-3 text-sm text-ink-faint">
              {t.results.groundedIn(plan.groundedPlaceCount)}
            </p>
          )}
        </div>
        <div className="flex flex-1 justify-center sm:justify-end">{headerRight}</div>
      </div>

      <div className="mt-10 flex justify-center gap-2 overflow-x-auto pb-2">
        {plan.days.map((d) => {
          const WeatherIcon = d.weather ? WEATHER_ICON[d.weather.condition] : null;
          return (
            <button
              key={d.day}
              onClick={() => setActiveDay(d.day)}
              className={`shrink-0 rounded-2xl border px-5 py-2 text-center text-sm font-semibold transition ${
                activeDay === d.day
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-ink-soft hover:border-ink/20"
              }`}
            >
              <span className="block">{t.results.day(d.day)}</span>
              {d.date && (
                <span
                  className={`block text-xs font-normal ${
                    activeDay === d.day ? "text-paper/60" : "text-ink-faint"
                  }`}
                >
                  {d.date}
                </span>
              )}
              {d.weather && WeatherIcon && (
                <span
                  className={`mt-1 flex items-center justify-center gap-1 text-xs font-normal ${
                    activeDay === d.day ? "text-paper/60" : "text-ink-faint"
                  }`}
                >
                  <WeatherIcon className="h-3 w-3" />
                  {d.weather.tempMaxC}°C
                </span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {plan.days
          .filter((d) => d.day === activeDay)
          .map((d) => {
            const stopsWithCoords = d.stops.filter(
              (s): s is Stop & { lat: number; lon: number } => s.lat != null && s.lon != null,
            );
            const mapCenter =
              plan.center ??
              (stopsWithCoords.length > 0
                ? { lat: stopsWithCoords[0].lat, lon: stopsWithCoords[0].lon }
                : null);

            return (
              <motion.div
                key={d.day}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-auto mt-10"
              >
                <h2 className="text-center text-xl font-semibold text-ink">{d.theme}</h2>
                {(d.date || d.weather) && (
                  <p className="mt-1 flex items-center justify-center gap-2 text-center text-sm text-ink-faint">
                    {d.date}
                    {d.date && d.weather && <span>&middot;</span>}
                    {d.weather &&
                      (() => {
                        const WeatherIcon = WEATHER_ICON[d.weather.condition];
                        return (
                          <span className="inline-flex items-center gap-1">
                            <WeatherIcon className="h-3.5 w-3.5" />
                            {d.weather.label}, {d.weather.tempMinC}–{d.weather.tempMaxC}°C
                          </span>
                        );
                      })()}
                  </p>
                )}

                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                  <div className="h-[420px] overflow-hidden rounded-2xl border border-line lg:sticky lg:top-6 lg:h-[calc(100vh-8rem)] lg:max-h-[640px]">
                    {mapCenter ? (
                      <StopMap stops={d.stops} center={mapCenter} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-paper-dim px-6 text-center text-sm text-ink-faint">
                        <MapPin className="mr-2 h-4 w-4" />
                        Map unavailable for this trip
                      </div>
                    )}
                  </div>

                  <ul className="space-y-6">
                    {d.stops.map((stop, i) => {
                      const key = `${d.day}-${i}`;
                      const isRegenerating = regenerating?.[key];
                      const attemptsUsed = regenerateAttempts?.[key] ?? 0;
                      const attemptsExhausted = attemptsUsed >= MAX_REGENERATE_ATTEMPTS_PER_STOP;
                      const stopError = regenerateError?.[key];
                      return (
                        <motion.li
                          key={`${stop.title}-${i}`}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex gap-3 rounded-2xl border border-line bg-paper-dim p-5"
                        >
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium tracking-wide text-ink-faint uppercase">
                              {stop.time}
                            </p>
                            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                              <p className="text-lg font-semibold text-ink">{stop.title}</p>
                              {stop.estimatedRating != null && (
                                <span
                                  title={t.results.aiEstimate}
                                  className="inline-flex items-center gap-1 text-xs font-medium text-amber-600"
                                >
                                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                  {stop.estimatedRating.toFixed(1)}
                                  <span className="text-ink-faint">({t.results.aiEstimate})</span>
                                </span>
                              )}
                              {stop.priceTier && (
                                <span
                                  title={t.results.priceTierLabel}
                                  className="inline-flex items-center rounded-full bg-paper px-2 py-0.5 text-xs font-semibold text-ink-soft"
                                >
                                  {stop.priceTier}
                                </span>
                              )}
                              {onRegenerate && (
                                <button
                                  type="button"
                                  onClick={() => onRegenerate(d, i)}
                                  disabled={isRegenerating || attemptsExhausted}
                                  title={
                                    attemptsExhausted
                                      ? t.results.regenerateLimitReached
                                      : t.results.regenerate
                                  }
                                  className="ml-auto shrink-0 rounded-full p-1.5 text-ink-faint transition hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <RefreshCw
                                    className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`}
                                  />
                                </button>
                              )}
                            </div>
                            <p className="mt-1.5 text-sm text-ink-soft">{stop.description}</p>
                            <p className="mt-2 text-xs text-accent-dark italic">
                              {t.results.why}: {stop.reason}
                            </p>
                            {stopError && <p className="mt-2 text-xs text-amber-700">{stopError}</p>}
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                </div>
              </motion.div>
            );
          })}
      </AnimatePresence>
    </>
  );
}
