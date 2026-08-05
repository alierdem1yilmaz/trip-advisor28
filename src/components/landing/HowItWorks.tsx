"use client";

import { Reveal } from "./Reveal";
import { useLanguage } from "@/lib/i18n/language-context";

// A slight vertical stagger per step instead of a perfectly even row — small
// touch, but a dead-even 3-column row is one of the more recognizable
// "generated landing page" tells.
const OFFSET = ["sm:translate-y-0", "sm:translate-y-8", "sm:-translate-y-2"];

export function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section id="how-it-works" className="bg-paper-dim py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="max-w-xl">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {t.howItWorks.title}
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {t.howItWorks.steps.map((step, index) => (
            <Reveal
              key={step.title}
              delay={index * 0.1}
              className={`relative pl-14 sm:pl-0 ${OFFSET[index]}`}
            >
              <span className="font-display absolute top-0 left-0 text-4xl font-semibold text-accent/40 sm:static sm:mb-4 sm:block">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{step.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
