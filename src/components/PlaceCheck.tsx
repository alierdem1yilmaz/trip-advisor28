"use client";

import { useEffect, useState } from "react";
import { CircleCheck, Loader2, TriangleAlert } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export type PlaceCheckStatus = "idle" | "checking" | "ok" | "fuzzy" | "notfound";

/**
 * Debounced live validation against the same OpenTripMap toponym lookup
 * /api/plan (and /api/hotels/search) rely on for geocoding — catches a typo
 * before it silently produces no results, instead of only surfacing the
 * problem after the full request.
 */
export function usePlaceCheck(query: string) {
  const [status, setStatus] = useState<PlaceCheckStatus>("idle");
  const [resolvedName, setResolvedName] = useState("");

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setStatus("idle");
      setResolvedName("");
      return;
    }
    setStatus("checking");
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!data.found) {
          setStatus("notfound");
          setResolvedName("");
        } else {
          setStatus(data.partialMatch ? "fuzzy" : "ok");
          setResolvedName(data.country ? `${data.name}, ${data.country}` : data.name);
        }
      } catch {
        if (!controller.signal.aborted) setStatus("idle");
      }
    }, 500);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { status, resolvedName };
}

export function PlaceStatusRow({
  status,
  resolvedName,
  override,
  onContinueAnyway,
  t,
}: {
  status: PlaceCheckStatus;
  resolvedName: string;
  override: boolean;
  onContinueAnyway: () => void;
  t: ReturnType<typeof useLanguage>["t"];
}) {
  if (status === "idle") return null;
  return (
    <div className="mt-3 text-sm">
      {status === "checking" && (
        <span className="inline-flex items-center gap-1.5 text-ink-faint">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {t.wizard.checkingPlace}
        </span>
      )}
      {status === "ok" && (
        <span className="inline-flex items-center gap-1.5 text-emerald-600">
          <CircleCheck className="h-3.5 w-3.5" />
          {t.wizard.placeFound(resolvedName)}
        </span>
      )}
      {status === "fuzzy" && (
        <span className="inline-flex items-center gap-1.5 text-amber-600">
          <TriangleAlert className="h-3.5 w-3.5" />
          {t.wizard.placeFuzzy(resolvedName)}
        </span>
      )}
      {status === "notfound" && (
        <span className="inline-flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-red-600">
            <TriangleAlert className="h-3.5 w-3.5" />
            {t.wizard.placeNotFound}
          </span>
          {override ? (
            <span className="text-xs text-ink-faint">{t.wizard.placeNotFoundOverridden}</span>
          ) : (
            <button
              type="button"
              onClick={onContinueAnyway}
              className="text-xs text-ink-faint underline decoration-dotted underline-offset-2 hover:text-ink-soft"
            >
              {t.wizard.continueAnyway}
            </button>
          )}
        </span>
      )}
    </div>
  );
}
