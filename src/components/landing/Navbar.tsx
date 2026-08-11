"use client";

import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/language-context";

export function Navbar() {
  const { t } = useLanguage();
  const { user, isLoading } = useUser();
  const links = [
    { href: "#try-it", label: t.nav.tryIt },
    { href: "#features", label: t.nav.features },
    { href: "#how-it-works", label: t.nav.howItWorks },
    { href: "#reviews", label: t.nav.reviews },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2 font-semibold text-ink">
          <Logo size={32} />
          <span className="font-display text-lg">VoyageAI</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-soft transition hover:text-ink"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/kesfedin"
            className="text-sm font-medium text-ink-soft transition hover:text-ink"
          >
            {t.nav.explore}
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-ink-soft transition hover:text-ink"
          >
            {t.pricing.navLabel}
          </Link>
          <Link
            href="/hotels"
            className="text-sm font-medium text-ink-soft transition hover:text-ink"
          >
            {t.nav.hotelsLink}
          </Link>
          {!isLoading && user && (
            <Link
              href="/saved-trips"
              className="text-sm font-medium text-ink-soft transition hover:text-ink"
            >
              {t.savedTrips.navLink}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {!isLoading && user ? (
            <Link
              href="/account"
              className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-accent"
            >
              {t.auth.account}
            </Link>
          ) : (
            <a
              href="/auth/login"
              rel="nofollow"
              className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-accent"
            >
              {t.auth.loginLink}
            </a>
          )}
        </div>
      </nav>
    </header>
  );
}
