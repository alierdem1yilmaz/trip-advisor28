"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, Trash2, TriangleAlert } from "lucide-react";
import { SimpleHeader } from "@/components/SimpleHeader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useLanguage } from "@/lib/i18n/language-context";
import { DATE_LOCALE } from "@/lib/dates";
import type { Plan } from "@/components/plan/PlanResults";
import { deleteSavedTrip, extendSavedTrip } from "@/app/actions/savedTrips";

type SavedTrip = {
  id: string;
  plan: Plan;
  createdAt: string;
  expiresAt: string;
};

const EXPIRING_SOON_THRESHOLD_DAYS = 2;

function daysUntil(iso: string): number {
  return Math.ceil(
    (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}

export function SavedTripsContent({
  savedTrips: initialSavedTrips,
  historyTrips,
}: {
  savedTrips: SavedTrip[];
  historyTrips: SavedTrip[];
}) {
  const { t, language } = useLanguage();
  const [tab, setTab] = useState<"saved" | "history">("saved");
  const [savedTrips, setSavedTrips] = useState(initialSavedTrips);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleExtend(id: string) {
    setPending((p) => ({ ...p, [id]: true }));
    startTransition(async () => {
      await extendSavedTrip(id);
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7);
      setSavedTrips((prev) =>
        prev.map((trip) =>
          trip.id === id
            ? { ...trip, expiresAt: newExpiresAt.toISOString() }
            : trip,
        ),
      );
      setPending((p) => ({ ...p, [id]: false }));
    });
  }

  function handleDelete(id: string) {
    setConfirmDeleteId(id);
  }

  function confirmDelete() {
    const id = confirmDeleteId;
    if (!id) return;
    setConfirmDeleteId(null);
    setPending((p) => ({ ...p, [id]: true }));
    startTransition(async () => {
      await deleteSavedTrip(id);
      setSavedTrips((prev) => prev.filter((trip) => trip.id !== id));
    });
  }

  function tripCard(trip: SavedTrip, showActions: boolean) {
    const daysLeft = daysUntil(trip.expiresAt);
    const expiringSoon =
      showActions && daysLeft <= EXPIRING_SOON_THRESHOLD_DAYS;
    const savedOnLabel = new Intl.DateTimeFormat(
      DATE_LOCALE[language] ?? "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      },
    ).format(new Date(trip.createdAt));

    return (
      <li
        key={trip.id}
        className="rounded-2xl border border-line bg-paper-dim p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <Link
            href={`/saved-trips/${trip.id}`}
            className="min-w-0 flex-1 group"
          >
            <p className="flex items-center gap-1.5 text-lg font-semibold text-ink group-hover:text-accent">
              <MapPin className="h-4 w-4 shrink-0 text-ink-faint" />
              {trip.plan.destination}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-faint">
              <CalendarDays className="h-3.5 w-3.5" />
              {t.results.dayTrip(trip.plan.days.length)} &middot;{" "}
              {t.savedTrips.savedOn(savedOnLabel)}
            </p>
          </Link>
          {showActions && (
            <button
              type="button"
              onClick={() => handleDelete(trip.id)}
              disabled={pending[trip.id]}
              title={t.savedTrips.deleteButton}
              className="shrink-0 rounded-full p-1.5 text-ink-faint transition hover:bg-paper hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {expiringSoon ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <span className="inline-flex items-center gap-1.5 text-sm text-amber-800">
              <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
              {t.savedTrips.expiringWarning(daysLeft)}
            </span>
            <button
              type="button"
              onClick={() => handleExtend(trip.id)}
              disabled={pending[trip.id]}
              className="shrink-0 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending[trip.id]
                ? t.savedTrips.extending
                : t.savedTrips.extendButton}
            </button>
          </div>
        ) : (
          <p className="mt-3 text-xs text-ink-faint">
            {t.savedTrips.expiresIn(daysLeft)}
          </p>
        )}
      </li>
    );
  }

  const activeList = tab === "saved" ? savedTrips : historyTrips;

  return (
    <div className="min-h-screen bg-paper">
      <SimpleHeader />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
          {t.savedTrips.title}
        </h1>
        <p className="mt-2 text-ink-soft">
          {tab === "saved"
            ? t.savedTrips.subtitle
            : t.savedTrips.historySubtitle}
        </p>

        <div className="mt-8 flex gap-2">
          <button
            type="button"
            onClick={() => setTab("saved")}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              tab === "saved"
                ? "border-accent bg-accent-soft text-accent-dark"
                : "border-line text-ink-soft hover:border-ink/20"
            }`}
          >
            {t.savedTrips.savedTab}
          </button>
          <button
            type="button"
            onClick={() => setTab("history")}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              tab === "history"
                ? "border-accent bg-accent-soft text-accent-dark"
                : "border-line text-ink-soft hover:border-ink/20"
            }`}
          >
            {t.savedTrips.historyTab}
          </button>
        </div>

        {activeList.length === 0 ? (
          <p className="mt-10 text-ink-faint">
            {tab === "saved" ? t.savedTrips.empty : t.savedTrips.historyEmpty}
          </p>
        ) : (
          <ul className="mt-10 space-y-4">
            {activeList.map((trip) => tripCard(trip, tab === "saved"))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title={t.savedTrips.deleteConfirmTitle}
        description={t.savedTrips.deleteConfirm}
        confirmLabel={t.savedTrips.deleteButton}
        cancelLabel={t.savedTrips.cancelButton}
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
