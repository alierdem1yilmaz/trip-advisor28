"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import type { Language } from "@/lib/i18n/dictionaries";

const OPTIONS: { value: Language; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "tr", label: "TR" },
  { value: "es", label: "ES" },
];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`inline-flex items-center gap-0.5 rounded-full border border-slate-200 p-0.5 dark:border-slate-700 ${className}`}>
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLanguage(option.value)}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
            language === option.value
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
