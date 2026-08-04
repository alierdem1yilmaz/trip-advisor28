"use client";

import { Reveal } from "./Reveal";
import { useLanguage } from "@/lib/i18n/language-context";

export function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section
      id="how-it-works"
      className="bg-slate-50 py-24 sm:py-32 dark:bg-slate-900/40"
    >
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            {t.howItWorks.title}
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {t.howItWorks.steps.map((step, index) => (
            <Reveal
              key={step.title}
              delay={index * 0.1}
              className="relative pl-14 sm:pl-0 sm:pt-14 sm:text-center"
            >
              <span className="absolute top-0 left-0 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white sm:static sm:mx-auto sm:mb-4 dark:bg-white dark:text-slate-900">
                {index + 1}
              </span>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {step.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
