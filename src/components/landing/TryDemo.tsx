"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MapPin } from "lucide-react";
import { Reveal } from "./Reveal";
import { PACE_OPTIONS, INTEREST_OPTIONS } from "@/lib/trip-options";
import { useLanguage } from "@/lib/i18n/language-context";

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
  const { t, language } = useLanguage();
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
        body: JSON.stringify({ destination, pace, interests, language }),
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
    <section id="try-it" className="relative overflow-hidden bg-night py-24 text-paper sm:py-32">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(217,164,65,0.12),_transparent_55%),radial-gradient(circle_at_80%_70%,_rgba(217,98,46,0.16),_transparent_55%)]"
      />

      <div className="relative mx-auto max-w-5xl px-6">
        <Reveal className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-semibold tracking-wide text-gold uppercase">
            {t.tryDemo.badge}
          </span>
          <h2 className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-6xl">
            {t.tryDemo.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-paper/70">{t.tryDemo.subtitle}</p>
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-2xl flex-col gap-5 rounded-3xl border border-night-line bg-night-soft/60 p-6 backdrop-blur sm:p-8"
          >
            <div>
              <label htmlFor="destination" className="mb-2 block text-sm font-medium text-paper/70">
                {t.tryDemo.whereTo}
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-paper/40" />
                <input
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={t.tryDemo.placeholder}
                  maxLength={60}
                  required
                  className="w-full rounded-xl border border-night-line bg-night/60 py-3 pr-4 pl-10 text-sm text-paper placeholder:text-paper/35 focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <span className="mb-2 block text-sm font-medium text-paper/70">{t.tryDemo.pace}</span>
              <div className="flex gap-2">
                {PACE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPace(option.value)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                      pace === option.value
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-night-line text-paper/70 hover:border-paper/30"
                    }`}
                  >
                    {t.options.pace[option.value]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-2 block text-sm font-medium text-paper/70">
                {t.tryDemo.interests} <span className="text-paper/40">{t.tryDemo.optional}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                      interests.includes(interest)
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-night-line text-paper/70 hover:border-paper/30"
                    }`}
                  >
                    {t.options.interests[interest as keyof typeof t.options.interests]}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "loading" || !destination.trim()}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-accent hover:text-paper disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.tryDemo.loadingButton}
                </>
              ) : (
                t.tryDemo.generateButton
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
              className="mx-auto mt-8 max-w-2xl rounded-2xl border border-gold/25 bg-gold/10 p-4 text-center text-sm text-gold"
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
              className="mx-auto mt-10 max-w-2xl rounded-3xl border border-night-line bg-night-soft/50 p-6 sm:p-8"
            >
              <p className="text-sm text-gold">{result.summary}</p>
              {!!result.groundedPlaceCount && result.groundedPlaceCount > 0 && (
                <p className="mt-2 text-xs text-paper/50">
                  {t.tryDemo.groundedIn(result.groundedPlaceCount)}
                </p>
              )}
              <ul className="mt-6 space-y-5">
                {result.stops.map((stop, i) => (
                  <motion.li
                    key={`${stop.title}-${i}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12 }}
                    className="border-l-2 border-accent/40 pl-4"
                  >
                    <p className="text-xs font-medium tracking-wide text-paper/50 uppercase">
                      {stop.time}
                    </p>
                    <p className="mt-0.5 font-semibold text-paper">{stop.title}</p>
                    <p className="mt-1 text-sm text-paper/70">{stop.description}</p>
                    <p className="mt-1.5 text-xs text-gold italic">
                      {t.tryDemo.why}: {stop.reason}
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
