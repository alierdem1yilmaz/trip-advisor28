"use client";

import { Reveal } from "./Reveal";
import { useLanguage } from "@/lib/i18n/language-context";

export function StatsBar() {
  const { t } = useLanguage();

  return (
    <section className="border-y border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
        {t.stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.06} className="text-center">
            <p className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {stat.label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
