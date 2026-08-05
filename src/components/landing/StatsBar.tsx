"use client";

import { Reveal } from "./Reveal";
import { useLanguage } from "@/lib/i18n/language-context";

export function StatsBar() {
  const { t } = useLanguage();

  return (
    <section className="border-y border-line bg-paper-dim">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
        {t.stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.06} className="text-center">
            <p className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {stat.label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
