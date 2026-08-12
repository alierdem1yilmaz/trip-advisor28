"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { SITE_LOCALES, type SiteLocale } from "@/lib/i18n/siteLocales";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const active = SITE_LOCALES.find((l) => l.locale === locale) ?? SITE_LOCALES[0];

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function select(next: SiteLocale) {
    setLocale(next);
    setOpen(false);
  }

  const filtered = SITE_LOCALES.filter((l) =>
    l.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:text-ink ${className}`}
      >
        {active.flag} {active.locale.toUpperCase()}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-paper shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="border-b border-line p-4">
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search language..."
                className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {filtered.map((l) => (
                  <button
                    key={l.locale}
                    type="button"
                    onClick={() => select(l.locale)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      l.locale === locale
                        ? "border-accent bg-accent-soft"
                        : "border-line hover:bg-paper-dim"
                    }`}
                  >
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
