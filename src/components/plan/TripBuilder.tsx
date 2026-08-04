"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, Loader2, MapPin, RotateCcw } from "lucide-react";
import {
  COMPANION_OPTIONS,
  INTEREST_OPTIONS,
  PACE_OPTIONS,
} from "@/lib/trip-options";
import {
  addDaysIso,
  diffInDaysIso,
  todayIso,
  MAX_TRIP_LENGTH_DAYS,
  WEATHER_FORECAST_HORIZON_DAYS,
} from "@/lib/dates";

type Stop = {
  time: string;
  title: string;
  description: string;
  reason: string;
};

type Day = {
  day: number;
  date?: string;
  theme: string;
  stops: Stop[];
};

type Plan = {
  destination: string;
  days: Day[];
  groundedPlaceCount?: number;
};

export function TripBuilder() {
  const today = useMemo(() => todayIso(), []);
  const forecastLimit = useMemo(
    () => addDaysIso(today, WEATHER_FORECAST_HORIZON_DAYS),
    [today],
  );

  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(addDaysIso(today, 2));
  const [pace, setPace] = useState<(typeof PACE_OPTIONS)[number]["value"]>("balanced");
  const [companions, setCompanions] =
    useState<(typeof COMPANION_OPTIONS)[number]["value"]>("solo");
  const [interests, setInterests] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [activeDay, setActiveDay] = useState(1);

  const days = Math.max(diffInDaysIso(startDate, endDate) + 1, 1);
  const endMax = addDaysIso(startDate, Math.min(MAX_TRIP_LENGTH_DAYS - 1, WEATHER_FORECAST_HORIZON_DAYS));

  function handleStartChange(value: string) {
    setStartDate(value);
    // Keep the range valid: end date can't be before the new start, or push
    // the trip past the 7-day / 16-day-forecast caps.
    const maxEnd = addDaysIso(value, Math.min(MAX_TRIP_LENGTH_DAYS - 1, WEATHER_FORECAST_HORIZON_DAYS));
    if (endDate < value) setEndDate(value);
    else if (endDate > maxEnd) setEndDate(maxEnd);
  }

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!destination.trim() || status === "loading") return;

    setStatus("loading");
    setError(null);
    setPlan(null);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, startDate, endDate, pace, interests, companions }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Something went wrong.");
      }
      setPlan(data);
      setActiveDay(1);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  function reset() {
    setPlan(null);
    setStatus("idle");
    setError(null);
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-indigo-600 text-white">
              <Compass className="h-4.5 w-4.5" strokeWidth={2.25} />
            </span>
            VoyageAI
          </Link>
          {plan && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Plan another trip
            </button>
          )}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!plan ? (
          <motion.section
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-2xl px-6 py-20 sm:py-28"
          >
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                Where are we going?
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Tell VoyageAI the shape of your trip. Get a full day-by-day plan,
                built and explained in one pass.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-12 flex flex-col gap-8">
              <div>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Destination — Kyoto, Marrakech, Reykjavík…"
                    maxLength={60}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pr-5 pl-12 text-lg text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="text-sm font-medium text-slate-700">Trip dates</span>
                  <span className="text-sm text-slate-500">
                    {days} {days === 1 ? "day" : "days"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-xs text-slate-400">Start</span>
                    <input
                      type="date"
                      value={startDate}
                      min={today}
                      max={forecastLimit}
                      onChange={(e) => handleStartChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-slate-400">End</span>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      max={endMax}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
                    />
                  </label>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Limited to the next {WEATHER_FORECAST_HORIZON_DAYS} days, up to{" "}
                  {MAX_TRIP_LENGTH_DAYS} days long — that&apos;s as far out as weather
                  forecasts (and weather-aware replanning) actually go.
                </p>
              </div>

              <div>
                <span className="mb-3 block text-sm font-medium text-slate-700">
                  Who&apos;s traveling?
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {COMPANION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setCompanions(option.value)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        companions === option.value
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-3 block text-sm font-medium text-slate-700">Pace</span>
                <div className="flex gap-2">
                  {PACE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPace(option.value)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                        pace === option.value
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-3 block text-sm font-medium text-slate-700">
                  Interests <span className="text-slate-400">(optional)</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                        interests.includes(interest)
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "loading" || !destination.trim()}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-4 text-base font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Building your {days}-day trip…
                  </>
                ) : (
                  "Build my trip"
                )}
              </button>

              {status === "error" && error && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-800">
                  {error}
                </p>
              )}

              {status === "loading" && (
                <p className="text-center text-sm text-slate-400">
                  This can take a minute — VoyageAI is reasoning through real
                  nearby places, not just picking from a template.
                </p>
              )}
            </form>
          </motion.section>
        ) : (
          <motion.section
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl px-6 py-16"
          >
            <div className="text-center">
              <p className="text-sm font-medium text-teal-600">
                {plan.days.length}-day trip
              </p>
              <h1 className="mt-1 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                {plan.destination}
              </h1>
              {!!plan.groundedPlaceCount && plan.groundedPlaceCount > 0 && (
                <p className="mt-3 text-sm text-slate-400">
                  Grounded in {plan.groundedPlaceCount} real nearby places via OpenTripMap
                </p>
              )}
            </div>

            <div className="mt-10 flex justify-center gap-2 overflow-x-auto pb-2">
              {plan.days.map((d) => (
                <button
                  key={d.day}
                  onClick={() => setActiveDay(d.day)}
                  className={`shrink-0 rounded-2xl border px-5 py-2 text-center text-sm font-semibold transition ${
                    activeDay === d.day
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className="block">Day {d.day}</span>
                  {d.date && (
                    <span
                      className={`block text-xs font-normal ${
                        activeDay === d.day ? "text-slate-300" : "text-slate-400"
                      }`}
                    >
                      {d.date}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {plan.days
                .filter((d) => d.day === activeDay)
                .map((d) => (
                  <motion.div
                    key={d.day}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mx-auto mt-10 max-w-2xl"
                  >
                    <h2 className="text-center text-xl font-semibold text-slate-900">
                      {d.theme}
                    </h2>
                    {d.date && (
                      <p className="mt-1 text-center text-sm text-slate-400">{d.date}</p>
                    )}
                    <ul className="mt-8 space-y-6">
                      {d.stops.map((stop, i) => (
                        <motion.li
                          key={`${stop.title}-${i}`}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                        >
                          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                            {stop.time}
                          </p>
                          <p className="mt-1 text-lg font-semibold text-slate-900">
                            {stop.title}
                          </p>
                          <p className="mt-1.5 text-sm text-slate-600">{stop.description}</p>
                          <p className="mt-2 text-xs text-indigo-600 italic">
                            Why: {stop.reason}
                          </p>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
