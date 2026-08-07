"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SimpleHeader } from "@/components/SimpleHeader";
import { useLanguage } from "@/lib/i18n/language-context";
import { PlanResults, type Plan } from "@/components/plan/PlanResults";

export function SavedTripDetailContent({ plan }: { plan: Plan }) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-paper">
      <SimpleHeader>
        <Link
          href="/saved-trips"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.savedTrips.navLink}
        </Link>
      </SimpleHeader>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <PlanResults plan={plan} />
      </div>
    </div>
  );
}
