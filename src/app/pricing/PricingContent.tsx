"use client";

import { useTransition } from "react";
import { Check, Sparkles } from "lucide-react";
import { SimpleHeader } from "@/components/SimpleHeader";
import { useLanguage } from "@/lib/i18n/language-context";
import { setPlan } from "@/app/actions/auth";

function Row({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2.5 py-2 text-sm text-ink-soft">
      <Check className="h-4 w-4 shrink-0 text-accent" />
      {label}
    </li>
  );
}

export function PricingContent({
  isSignedIn,
  plan,
}: {
  isSignedIn: boolean;
  plan: "standard" | "pro" | null;
}) {
  const { t } = useLanguage();
  const [pending, startTransition] = useTransition();
  const f = t.pricing.features;

  return (
    <div className="min-h-screen bg-paper">
      <SimpleHeader />
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {t.pricing.title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">{t.pricing.subtitle}</p>

        <div className="mt-14 grid gap-6 text-left sm:grid-cols-2">
          {/* Standard */}
          <div className="rounded-2xl border border-line bg-paper p-8">
            {plan === "standard" && (
              <span className="mb-4 inline-block rounded-full bg-paper-dim px-3 py-1 text-xs font-semibold text-ink-soft">
                {t.pricing.currentPlanBadge}
              </span>
            )}
            <h2 className="font-display text-2xl font-semibold text-ink">
              {t.pricing.standardName}
            </h2>
            <p className="mt-1 text-sm text-ink-faint">{t.pricing.standardTagline}</p>
            <p className="mt-6 font-display text-3xl font-semibold text-ink">
              {t.pricing.standardPrice}
            </p>

            <ul className="mt-6 divide-y divide-line border-t border-line">
              <Row label={f.dayAllowance} />
              <Row label={f.tripLength} />
              <Row label={f.tripBuilder} />
              <Row label={f.weather} />
              <Row label={f.map} />
              <Row label={f.chat} />
              <Row label={f.aiRatings} />
              <Row label={f.languages} />
            </ul>

            {!isSignedIn ? (
              <a
                href="/auth/login?screen_hint=signup"
                rel="nofollow"
                className="mt-8 block rounded-lg border border-ink px-6 py-3 text-center text-sm font-semibold text-ink transition hover:bg-paper-dim"
              >
                {t.pricing.ctaStandard}
              </a>
            ) : plan === "pro" ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(() => setPlan("standard"))}
                className="mt-8 w-full rounded-lg border border-ink px-6 py-3 text-center text-sm font-semibold text-ink transition hover:bg-paper-dim disabled:opacity-60"
              >
                {t.account.downgradeButton}
              </button>
            ) : null}
          </div>

          {/* Pro */}
          <div className="rounded-2xl border border-accent/30 bg-accent-soft p-8">
            {plan === "pro" && (
              <span className="mb-4 inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-paper">
                {t.pricing.currentPlanBadge}
              </span>
            )}
            <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink">
              <Sparkles className="h-5 w-5 text-accent" />
              {t.pricing.proName}
            </h2>
            <p className="mt-1 text-sm text-accent-dark">{t.pricing.proTagline}</p>
            <p className="mt-6 font-display text-3xl font-semibold text-ink">{t.pricing.proPrice}</p>

            <ul className="mt-6 divide-y divide-accent/20 border-t border-accent/20">
              <Row label={f.unlimitedDays} />
              <Row label={f.longerTrips} />
              <Row label={f.tripBuilder} />
              <Row label={f.weather} />
              <Row label={f.map} />
              <Row label={f.chat} />
              <Row label={f.aiRatings} />
              <Row label={f.languages} />
              <Row label={f.prioritySupport} />
            </ul>

            {plan !== "pro" && isSignedIn && (
              <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(() => setPlan("pro"))}
                className="mt-8 block w-full rounded-lg bg-accent px-6 py-3 text-center text-sm font-semibold text-paper transition hover:bg-accent-dark disabled:opacity-60"
              >
                {t.pricing.ctaPro}
              </button>
            )}
            {plan !== "pro" && !isSignedIn && (
              <a
                href="/auth/login?screen_hint=signup"
                rel="nofollow"
                className="mt-8 block rounded-lg bg-accent px-6 py-3 text-center text-sm font-semibold text-paper transition hover:bg-accent-dark"
              >
                {t.pricing.ctaPro}
              </a>
            )}
          </div>
        </div>

        <p className="mt-8 text-sm text-ink-faint">{t.pricing.betaNote}</p>
      </div>
    </div>
  );
}
