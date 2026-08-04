"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MapPin, Sparkles } from "lucide-react";
import { Reveal } from "./Reveal";

const PACE_OPTIONS = [
  { value: "relaxed", label: "Relaxed" },
  { value: "balanced", label: "Balanced" },
  { value: "intensive", label: "Intensive" },
] as const;

const INTEREST_OPTIONS = ["Food", "History", "Art", "Nature", "Nightlife", "Shopping"];

type Stop = {
  time: string;
  title: string;
  description: string;
  reason: string;
};

type Result = {
  summary: string;
  stops: Stop[];
  groundedPlaceCount?: number;
};

export function TryDemo() {
  const [destination, setDestination] = useState("");
  const [pace, setPace] = useState<(typeof PACE_OPTIONS)[number]["value"]>("balanced");
  const [interests, setInterests] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

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
    setResult(null);

    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, pace, interests }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Something went wrong.");
      }
      setResult(data);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <section id="try-it" className="relative overflow-hidden bg-slate-950 py-24 text-white sm:py-32">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(45,212,191,0.18),_transparent_55%),radial-gradient(circle_at_80%_70%,_rgba(99,102,241,0.22),_transparent_55%)]"
      />

      <div className="relative mx-auto max-w-5xl px-6">
        <Reveal className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-teal-300">
            <Sparkles className="h-3.5 w-3.5" />
            Live demo, powered by Gemini
          </span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            See it think.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
            Type a destination. Watch VoyageAI build a day and explain every
            decision, live.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-2xl flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8"
          >
            <div>
              <label htmlFor="destination" className="mb-2 block text-sm font-medium text-slate-300">
                Where to?
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Kyoto, Marrakech, Reykjavík…"
                  maxLength={60}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-teal-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <span className="mb-2 block text-sm font-medium text-slate-300">Pace</span>
              <div className="flex gap-2">
                {PACE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPace(option.value)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                      pace === option.value
                        ? "border-teal-400 bg-teal-400/15 text-teal-300"
                        : "border-white/10 text-slate-300 hover:border-white/25"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Interests <span className="text-slate-500">(optional)</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                      interests.includes(interest)
                        ? "border-indigo-400 bg-indigo-400/15 text-indigo-300"
                        : "border-white/10 text-slate-300 hover:border-white/25"
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
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Planning your day…
                </>
              ) : (
                "Generate my day"
              )}
            </button>
          </form>
        </Reveal>

        <AnimatePresence mode="wait">
          {status === "error" && error && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-auto mt-8 max-w-2xl rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-center text-sm text-amber-200"
            >
              {error}
            </motion.div>
          )}

          {status === "done" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-auto mt-10 max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8"
            >
              <p className="text-sm text-teal-300">{result.summary}</p>
              {!!result.groundedPlaceCount && result.groundedPlaceCount > 0 && (
                <p className="mt-2 text-xs text-slate-400">
                  Grounded in {result.groundedPlaceCount} real nearby places via OpenTripMap
                </p>
              )}
              <ul className="mt-6 space-y-5">
                {result.stops.map((stop, i) => (
                  <motion.li
                    key={`${stop.title}-${i}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12 }}
                    className="border-l-2 border-teal-400/40 pl-4"
                  >
                    <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                      {stop.time}
                    </p>
                    <p className="mt-0.5 font-semibold text-white">{stop.title}</p>
                    <p className="mt-1 text-sm text-slate-300">{stop.description}</p>
                    <p className="mt-1.5 text-xs text-indigo-300 italic">
                      Why: {stop.reason}
                    </p>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
