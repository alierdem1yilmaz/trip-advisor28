"use client";

import Link from "next/link";
import { ArrowRight, CloudSun, MapPin } from "lucide-react";
import { Reveal } from "./Reveal";
import { DayNightGlobe } from "./DayNightGlobe";
import { useLanguage } from "@/lib/i18n/language-context";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section id="top" className="relative overflow-hidden bg-paper">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,_rgba(217,98,46,0.10),_transparent_55%)]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent-soft px-3 py-1 text-xs font-semibold tracking-wide text-accent-dark uppercase">
            {t.hero.badge}
          </span>

          <h1 className="mt-6 font-display text-5xl leading-[1.05] font-semibold tracking-tight text-ink sm:text-6xl">
            {t.hero.headline1} <span className="text-accent italic">{t.hero.headline2}</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-ink-soft">{t.hero.subtitle}</p>

          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-paper shadow-lg shadow-ink/10 transition hover:bg-accent"
            >
              {t.hero.ctaPrimary}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-lg border border-line px-6 py-3 text-sm font-semibold text-ink transition hover:border-ink"
            >
              {t.hero.ctaSecondary}
            </a>
          </div>
        </div>

        <Reveal delay={0.1} className="relative">
          <DayNightGlobe />

          <div className="absolute -bottom-8 -left-8 hidden w-64 rounded-2xl border border-line bg-paper/95 p-4 text-left shadow-xl shadow-ink/10 backdrop-blur sm:block">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <p className="text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
                  {t.hero.mockDay}
                </p>
                <p className="text-xs font-semibold text-ink">{t.hero.mockTitle}</p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent-dark">
                <CloudSun className="h-3 w-3" />
                {t.hero.mockWeather}
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-xs">
              {t.hero.mockStops.slice(0, 2).map((stop) => (
                <li key={stop} className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                  <span className="text-ink-soft">{stop}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
