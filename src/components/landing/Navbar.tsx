"use client";

import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/language-context";

export function Navbar() {
  const { t } = useLanguage();
  const links = [
    { href: "#try-it", label: t.nav.tryIt },
    { href: "#features", label: t.nav.features },
    { href: "#how-it-works", label: t.nav.howItWorks },
    { href: "#reviews", label: t.nav.reviews },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/80">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <Logo size={32} />
          <span className="text-lg">VoyageAI</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <a
            href="#waitlist"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {t.nav.getEarlyAccess}
          </a>
        </div>
      </nav>
    </header>
  );
}
