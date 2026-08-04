import Link from "next/link";
import { ArrowRight, CloudSun, MapPin, Sparkles } from "lucide-react";
import { Reveal } from "./Reveal";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.25),_transparent_60%)]"
      />

      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 pt-16 pb-20 text-center sm:pt-24 sm:pb-28">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-600/20 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-300">
          <Sparkles className="h-3.5 w-3.5" />
          Now onboarding early access travelers
        </span>

        <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-tight text-slate-900 sm:text-7xl dark:text-white">
          Your smartest travel companion,{" "}
          <span className="bg-gradient-to-r from-teal-500 to-indigo-600 bg-clip-text text-transparent">
            from planning to exploring.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl dark:text-slate-300">
          VoyageAI turns maps, reviews, weather, and transit into one itinerary that
          actually fits your trip, optimized in seconds and rebuilt on the fly
          whenever your day changes.
        </p>

        <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Plan my trip
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
          >
            See how it works
          </a>
        </div>

        <Reveal delay={0.15} className="mt-16 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white/70 p-5 text-left shadow-xl shadow-slate-900/5 backdrop-blur sm:p-6 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                Day 2 &middot; Paris
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Rebuilt for afternoon rain
              </p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
              <CloudSun className="h-3.5 w-3.5" />
              62°F, rain after 2pm
            </span>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
              <span className="text-slate-600 dark:text-slate-300">
                <span className="font-medium text-slate-900 dark:text-white">
                  9:00 AM
                </span>{" "}
                &mdash; Seine River walk before the crowds arrive
              </span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
              <span className="text-slate-600 dark:text-slate-300">
                <span className="font-medium text-slate-900 dark:text-white">
                  1:30 PM
                </span>{" "}
                &mdash; Musée d&apos;Orsay, moved up to dodge the rain window
              </span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
              <span className="text-slate-600 dark:text-slate-300">
                <span className="font-medium text-slate-900 dark:text-white">
                  7:15 PM
                </span>{" "}
                &mdash; Eiffel Tower at sunset, once the sky clears
              </span>
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
