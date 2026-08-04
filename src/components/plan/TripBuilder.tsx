"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, MapPin, RotateCcw } from "lucide-react";
import { Logo } from "@/components/Logo";
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

const STEPS = ["destination", "dates", "companions", "pace", "interests"] as const;
type StepKey = (typeof STEPS)[number];

export function TripBuilder() {
  const today = useMemo(() => todayIso(), []);
  const forecastLimit = useMemo(
    () => addDaysIso(today, WEATHER_FORECAST_HORIZON_DAYS),
    [today],
  );

  const [stepIndex, setStepIndex] = useState(0);
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

  const stepKey: StepKey = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const canAdvance = stepKey !== "destination" || destination.trim().length > 0;

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

  function goNext() {
    if (!canAdvance) return;
    if (isLastStep) {
      void handleSubmit();
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function handleSubmit() {
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
    setStepIndex(0);
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
            <Logo size={32} />
            VoyageAI
          </Link>
          {plan && status === "done" && (
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
        {status === "loading" ? (
          <motion.section
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center sm:py-40"
          >
            <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Your trip is being planned…
            </h1>
            <p className="mt-3 text-slate-500">
              This can take a minute — VoyageAI is reasoning through real
              nearby places for {destination || "your destination"}, not just
              picking from a template.
            </p>
          </motion.section>
        ) : status === "done" && plan ? (
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
        ) : (
          <motion.section
            key="wizard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto flex min-h-[calc(100vh-73px)] max-w-2xl flex-col justify-center px-6 py-16"
          >
            <div className="mb-10 flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= stepIndex ? "bg-teal-500" : "bg-slate-100"
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={stepKey}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                {stepKey === "destination" && (
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                      Where are we going?
                    </h1>
                    <p className="mt-3 text-lg text-slate-600">
                      Tell VoyageAI the shape of your trip. Get a full
                      day-by-day plan, built and explained in one pass.
                    </p>
                    <div className="relative mt-10">
                      <MapPin className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        autoFocus
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            goNext();
                          }
                        }}
                        placeholder="Kyoto, Marrakech, Reykjavík…"
                        maxLength={60}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pr-5 pl-12 text-lg text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {stepKey === "dates" && (
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                      When are you going?
                    </h1>
                    <p className="mt-3 text-lg text-slate-600">
                      Pick real dates. VoyageAI adapts each day to the actual
                      forecast, so trips are capped to the next{" "}
                      {WEATHER_FORECAST_HORIZON_DAYS} days — as far out as
                      weather forecasting (and weather-aware replanning)
                      reliably goes.
                    </p>
                    <div className="mt-10 grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="mb-2 block text-sm text-slate-500">Start</span>
                        <input
                          type="date"
                          value={startDate}
                          min={today}
                          max={forecastLimit}
                          onChange={(e) => handleStartChange(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm text-slate-500">End</span>
                        <input
                          type="date"
                          value={endDate}
                          min={startDate}
                          max={endMax}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
                        />
                      </label>
                    </div>
                    <p className="mt-4 text-sm font-medium text-teal-600">
                      {days} {days === 1 ? "day" : "days"} in {destination || "your destination"}
                    </p>
                  </div>
                )}

                {stepKey === "companions" && (
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                      Who&apos;s traveling?
                    </h1>
                    <p className="mt-3 text-lg text-slate-600">
                      VoyageAI adjusts the whole plan around who&apos;s coming.
                    </p>
                    <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {COMPANION_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setCompanions(option.value)}
                          className={`rounded-xl border px-4 py-4 text-base font-medium transition ${
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
                )}

                {stepKey === "pace" && (
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                      What pace feels right?
                    </h1>
                    <p className="mt-3 text-lg text-slate-600">
                      Relaxed leaves room to breathe; intensive packs in as
                      much as possible.
                    </p>
                    <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                      {PACE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPace(option.value)}
                          className={`flex-1 rounded-xl border px-4 py-4 text-base font-medium transition ${
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
                )}

                {stepKey === "interests" && (
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                      Anything you&apos;re into?
                    </h1>
                    <p className="mt-3 text-lg text-slate-600">
                      Optional — pick as many as you like, or skip this one.
                    </p>
                    <div className="mt-10 flex flex-wrap gap-2.5">
                      {INTEREST_OPTIONS.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`rounded-full border px-5 py-2.5 text-base transition ${
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
                )}

                {status === "error" && error && (
                  <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-800">
                    {error}
                  </p>
                )}

                <div className="mt-12 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={stepIndex === 0}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canAdvance}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLastStep ? "Build my trip" : "Next"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
