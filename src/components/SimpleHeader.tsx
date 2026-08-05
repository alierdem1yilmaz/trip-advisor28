"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

/** Shared header for secondary pages (auth, pricing, account) — the same
 * logo + language-switcher chrome as the trip builder, plus an optional
 * right-aligned slot for page-specific actions. */
export function SimpleHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
          <Logo size={32} />
          <span className="font-display">VoyageAI</span>
        </Link>
        <div className="flex items-center gap-4">
          {children}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
