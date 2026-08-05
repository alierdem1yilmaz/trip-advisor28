"use client";

import { Logo } from "@/components/Logo";
import { useLanguage } from "@/lib/i18n/language-context";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-line py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div className="flex items-center gap-2 text-sm font-medium text-ink-soft">
          <Logo size={20} />
          VoyageAI
        </div>
        <p className="text-xs text-ink-faint">
          {t.footer.tagline(new Date().getFullYear())}
        </p>
      </div>
    </footer>
  );
}
