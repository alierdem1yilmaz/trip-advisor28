"use client";

import {
  CloudSun,
  Gauge,
  Leaf,
  Route,
  Sparkles,
  Users,
  Utensils,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { useLanguage } from "@/lib/i18n/language-context";

// Fixed order matching the icon for each feature in the dictionary's
// features.items array — icons don't change per language, only the text.
const ICONS: LucideIcon[] = [Wand2, Route, CloudSun, Gauge, Utensils, Sparkles, Users, Leaf];

// A bento-style grid instead of a uniform 4-up grid: the first feature reads
// as the headline capability, the rest fill in around it at varying sizes
// so the section doesn't read as eight identical stamped-out cards.
const SPANS = [
  "sm:col-span-2 sm:row-span-2",
  "sm:col-span-2 sm:row-span-1",
  "sm:col-span-1 sm:row-span-1",
  "sm:col-span-1 sm:row-span-1",
  "sm:col-span-1 sm:row-span-1",
  "sm:col-span-1 sm:row-span-1",
  "sm:col-span-1 sm:row-span-1",
  "sm:col-span-1 sm:row-span-1",
];

export function Features() {
  const { t } = useLanguage();

  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <Reveal className="max-w-xl">
        <h2 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {t.features.title}
        </h2>
        <p className="mt-4 text-lg text-ink-soft">{t.features.subtitle}</p>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-4 sm:auto-rows-[minmax(9rem,auto)]">
        {t.features.items.map((feature, index) => {
          const Icon = ICONS[index];
          const isHero = index === 0;
          return (
            <Reveal key={feature.title} delay={(index % 4) * 0.08} className={SPANS[index]}>
              <div
                className={`flex h-full flex-col rounded-2xl border p-6 transition hover:-translate-y-0.5 ${
                  isHero
                    ? "border-accent/30 bg-accent-soft"
                    : "border-line bg-paper hover:border-ink/20"
                }`}
              >
                <span
                  className={`flex shrink-0 items-center justify-center rounded-xl ${
                    isHero ? "h-12 w-12 bg-accent text-paper" : "h-10 w-10 bg-accent-soft text-accent-dark"
                  }`}
                >
                  <Icon className={isHero ? "h-6 w-6" : "h-5 w-5"} strokeWidth={2} />
                </span>
                <h3
                  className={`mt-4 font-semibold text-ink ${isHero ? "font-display text-xl" : ""}`}
                >
                  {feature.title}
                </h3>
                <p className={`mt-2 text-sm text-ink-soft ${isHero ? "max-w-xs" : ""}`}>
                  {feature.description}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
