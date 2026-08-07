"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  getPendingPlanRating,
  submitPlanRating,
  dismissPlanRating,
  type PendingPlanRating,
} from "@/app/actions/planRating";

const STARS = [1, 2, 3, 4, 5];

export function PlanRatingPrompt() {
  const { t } = useLanguage();
  const [pending, setPending] = useState<PendingPlanRating | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");

  useEffect(() => {
    // Runs once when the app is first opened this session — matches the
    // "ask when they open the app the next day" requirement without
    // re-checking on every client-side navigation (the root layout that
    // mounts this doesn't remount on route changes).
    getPendingPlanRating().then((result) => {
      if (result) setPending(result);
    });
  }, []);

  if (!pending) return null;

  function handleSkip() {
    void dismissPlanRating(pending!.id);
    setPending(null);
  }

  function handleSubmit() {
    if (rating === 0 || status === "submitting") return;
    setStatus("submitting");
    submitPlanRating(pending!.id, rating, comment).then(() =>
      setStatus("done"),
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6 backdrop-blur-sm"
        onClick={status === "done" ? undefined : handleSkip}
      >
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          role="dialog"
          aria-modal="true"
          className="w-full max-w-sm rounded-2xl border border-line bg-paper p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {status === "done" ? (
            <div className="text-center">
              <CircleCheck className="mx-auto h-8 w-8 text-emerald-600" />
              <p className="mt-3 text-sm font-medium text-ink">
                {t.planRating.thankYouMessage}
              </p>
              <button
                type="button"
                onClick={() => setPending(null)}
                className="mt-5 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-accent"
              >
                {t.planRating.closeButton}
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-ink">
                {t.planRating.title}
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                {t.planRating.subtitle(pending.destination)}
              </p>

              <div className="mt-4 flex gap-1">
                {STARS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`${n}`}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        n <= (hoverRating || rating)
                          ? "fill-amber-500 text-amber-500"
                          : "fill-transparent text-line"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t.planRating.commentPlaceholder}
                maxLength={1000}
                rows={3}
                className="mt-4 w-full rounded-xl border border-line bg-paper-dim px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:bg-paper focus:outline-none"
              />

              <div className="mt-5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-sm font-medium text-ink-soft transition hover:text-ink"
                >
                  {t.planRating.skipButton}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={rating === 0 || status === "submitting"}
                  className="rounded-lg bg-ink px-5 py-2 text-sm font-semibold text-paper transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "submitting"
                    ? t.planRating.submittingButton
                    : t.planRating.submitButton}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
