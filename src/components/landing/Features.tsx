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

export function Features() {
  const { t } = useLanguage();

  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          {t.features.title}
        </h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{t.features.subtitle}</p>
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {t.features.items.map((feature, index) => {
          const Icon = ICONS[index];
          return (
            <Reveal key={feature.title} delay={(index % 4) * 0.08}>
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 text-white">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
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
