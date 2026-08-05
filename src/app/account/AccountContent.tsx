"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Loader2, LogOut, Sparkles } from "lucide-react";
import { SimpleHeader } from "@/components/SimpleHeader";
import { useLanguage } from "@/lib/i18n/language-context";
import { setPlan } from "@/app/actions/auth";
import { DATE_LOCALE } from "@/lib/dates";

export function AccountContent({
  email,
  plan,
  dayTokens,
  tokensResetAt,
}: {
  email: string;
  plan: "standard" | "pro";
  dayTokens: number;
  tokensResetAt: string;
}) {
  const { t, language } = useLanguage();
  const [pending, startTransition] = useTransition();

  const resetLabel = new Intl.DateTimeFormat(DATE_LOCALE[language] ?? "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(tokensResetAt));

  return (
    <div className="min-h-screen bg-paper">
      <SimpleHeader>
        {/* Auth0's own route — must stay a plain <a> so this is a full
            navigation, not client-side routing (see the SDK's docs). */}
        <a
          href="/auth/logout"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-ink"
        >
          <LogOut className="h-3.5 w-3.5" />
          {t.auth.logout}
        </a>
      </SimpleHeader>

      <div className="mx-auto max-w-lg px-6 py-16">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
          {t.account.title}
        </h1>
        <p className="mt-2 text-ink-soft">{email}</p>

        <div className="mt-10 rounded-2xl border border-line bg-paper-dim p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-soft">{t.account.planLabel}</span>
            <span className="inline-flex items-center gap-1.5 font-display text-lg font-semibold text-ink">
              {plan === "pro" && <Sparkles className="h-4 w-4 text-accent" />}
              {plan === "pro" ? t.account.proPlan : t.account.standardPlan}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="text-sm text-ink-soft">
              {plan === "pro" ? t.account.unlimitedTokens : t.account.tokensLeft(dayTokens)}
            </span>
            {plan === "standard" && (
              <span className="text-xs text-ink-faint">{t.account.resetsOn(resetLabel)}</span>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {plan === "standard" ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => setPlan("pro"))}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3.5 text-base font-semibold text-paper transition hover:bg-accent-dark disabled:opacity-60"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.account.upgradeButton}
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => setPlan("standard"))}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-line px-6 py-3.5 text-base font-semibold text-ink transition hover:bg-paper-dim disabled:opacity-60"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.account.downgradeButton}
            </button>
          )}
          <Link
            href="/pricing"
            className="text-center text-sm font-medium text-ink-soft hover:text-ink"
          >
            {t.account.viewPricing}
          </Link>
        </div>
      </div>
    </div>
  );
}
