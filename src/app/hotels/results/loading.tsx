"use client";

import { Loader2 } from "lucide-react";
import { SimpleHeader } from "@/components/SimpleHeader";
import { useLanguage } from "@/lib/i18n/language-context";

/**
 * Next.js's file-convention loading UI — shown automatically while the
 * /hotels/results server component is fetching (the LiteAPI rates lookup
 * this depends on can take up to ~20-30s for a large batch of hotels).
 */
export default function HotelResultsLoading() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-paper">
      <SimpleHeader />
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center sm:py-40">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <p className="mt-6 text-lg text-ink-soft">{t.hotels.searching}</p>
      </div>
    </div>
  );
}
