"use client";

import { useState, useTransition, type FormEvent } from "react";
import { CircleCheck } from "lucide-react";
import { Reveal } from "./Reveal";
import { useLanguage } from "@/lib/i18n/language-context";
import { submitFeedback } from "@/app/actions/feedback";

export function CtaBanner() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await submitFeedback("Waitlist sign-up request.", email);
      setStatus(result.ok ? "done" : "error");
    });
  }

  return (
    <section id="waitlist" className="mx-auto max-w-6xl px-6 pb-24 sm:pb-32">
      <Reveal className="overflow-hidden rounded-3xl bg-night px-8 py-16 text-center sm:px-16 sm:py-20">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-paper sm:text-4xl">
          {t.cta.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-paper/70">{t.cta.subtitle}</p>

        {status === "done" ? (
          <p className="mx-auto mt-8 flex max-w-md items-center justify-center gap-2 text-sm font-medium text-paper">
            <CircleCheck className="h-4 w-4 shrink-0 text-emerald-400" />
            {t.cta.successMessage}
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.cta.emailPlaceholder}
              className="w-full rounded-lg border-0 px-5 py-3 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:ring-2 focus:ring-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={pending}
              className="shrink-0 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-paper transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? t.cta.submittingButton : t.cta.button}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="mx-auto mt-4 max-w-md text-sm text-gold">
            {t.cta.errorMessage}
          </p>
        )}
      </Reveal>
    </section>
  );
}
