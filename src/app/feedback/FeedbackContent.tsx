"use client";

import { useState, useTransition } from "react";
import { CircleCheck, Loader2 } from "lucide-react";
import { SimpleHeader } from "@/components/SimpleHeader";
import { useLanguage } from "@/lib/i18n/language-context";
import { submitFeedback } from "@/app/actions/feedback";

const MAX_MESSAGE_LENGTH = 2000;

export function FeedbackContent({ userEmail }: { userEmail: string | null }) {
  const { t } = useLanguage();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<"empty" | "too_long" | "server" | null>(null);
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitFeedback(message, email);
      if (result.ok) {
        setSent(true);
      } else {
        setError(result.error);
      }
    });
  }

  function sendAnother() {
    setSent(false);
    setMessage("");
    setEmail("");
    setError(null);
  }

  return (
    <div className="min-h-screen bg-paper">
      <SimpleHeader />
      <div className="mx-auto max-w-lg px-6 py-16">
        {sent ? (
          <div className="text-center">
            <CircleCheck className="mx-auto h-10 w-10 text-emerald-600" />
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
              {t.feedback.thankYouTitle}
            </h1>
            <p className="mt-2 text-ink-soft">{t.feedback.thankYouSubtitle}</p>
            <button
              type="button"
              onClick={sendAnother}
              className="mt-8 text-sm font-medium text-ink-soft hover:text-ink"
            >
              {t.feedback.sendAnother}
            </button>
          </div>
        ) : (
          <>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
              {t.feedback.title}
            </h1>
            <p className="mt-2 text-ink-soft">{t.feedback.subtitle}</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-ink-soft">{t.feedback.messageLabel}</span>
                <textarea
                  autoFocus
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.feedback.messagePlaceholder}
                  maxLength={MAX_MESSAGE_LENGTH}
                  rows={6}
                  className="w-full rounded-2xl border border-line bg-paper-dim px-4 py-3 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:bg-paper focus:outline-none"
                />
              </label>

              {!userEmail && (
                <label className="block">
                  <span className="mb-2 block text-sm text-ink-soft">{t.feedback.emailLabel}</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.feedback.emailPlaceholder}
                    className="w-full rounded-xl border border-line bg-paper-dim px-4 py-3 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:bg-paper focus:outline-none"
                  />
                </label>
              )}

              {error && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  {t.feedback.errors[error]}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-6 py-3.5 text-base font-semibold text-paper transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                {pending ? t.feedback.submittingButton : t.feedback.submitButton}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
