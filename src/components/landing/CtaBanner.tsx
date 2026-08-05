"use client";

import { Reveal } from "./Reveal";
import { useLanguage } from "@/lib/i18n/language-context";

export function CtaBanner() {
  const { t } = useLanguage();

  return (
    <section id="waitlist" className="mx-auto max-w-6xl px-6 pb-24 sm:pb-32">
      <Reveal className="overflow-hidden rounded-3xl bg-night px-8 py-16 text-center sm:px-16 sm:py-20">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-paper sm:text-4xl">
          {t.cta.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-paper/70">{t.cta.subtitle}</p>

        <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder={t.cta.emailPlaceholder}
            className="w-full rounded-lg border-0 px-5 py-3 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:ring-2 focus:ring-accent focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-dark"
          >
            {t.cta.button}
          </button>
        </form>
      </Reveal>
    </section>
  );
}
