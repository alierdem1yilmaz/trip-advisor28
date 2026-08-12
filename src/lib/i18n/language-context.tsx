"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { dictionaries, type Dictionary, type Language } from "./dictionaries";
import { LOCALE_COOKIE, SITE_LOCALES, type SiteLocale } from "./siteLocales";

const DEFAULT_LOCALE: SiteLocale = "tr";

// Only en/tr/es have a real translated Dictionary (see dictionaries.ts).
// Every other site locale in SITE_LOCALES falls back to English content —
// the language switcher still offers the full 50+ list (shared with the
// Keşfedin/Cruise zones) so the selector itself stays visually identical
// across all three, even where content translation hasn't caught up yet.
function toDictionaryLanguage(locale: SiteLocale): Language {
  return locale === "tr" || locale === "es" ? locale : "en";
}

function readLocaleCookie(): SiteLocale | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : null;
  return SITE_LOCALES.some((l) => l.locale === value) ? (value as SiteLocale) : null;
}

function writeLocaleCookie(locale: SiteLocale) {
  // Path=/ (not scoped to this zone's basePath) and no explicit Domain, so
  // it's sent on every request to this same origin — including the
  // /kesfedin and /cruises zones proxied in from separate deployments.
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

type LanguageContextValue = {
  locale: SiteLocale;
  setLocale: (locale: SiteLocale) => void;
  language: Language;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SiteLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = readLocaleCookie();
    if (stored) setLocaleState(stored);
  }, []);

  function setLocale(next: SiteLocale) {
    setLocaleState(next);
    writeLocaleCookie(next);
  }

  const language = toDictionaryLanguage(locale);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, language, t: dictionaries[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
