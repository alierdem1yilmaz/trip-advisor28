"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";

export function SignupContent() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");

  const googleHref = `/auth/login?connection=google-oauth2&screen_hint=signup&returnTo=${encodeURIComponent("/")}`;

  // Same approach as the login page: Auth0's hosted screen finishes the
  // actual account creation, this form is for visual parity with the
  // Keşfedin zone's register page. screen_hint=signup opens Auth0
  // Universal Login directly on its signup tab.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const href = `/auth/login?login_hint=${encodeURIComponent(email)}&screen_hint=signup&returnTo=${encodeURIComponent("/")}`;
    window.location.href = href;
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="font-display text-2xl font-medium text-ink">{t.auth.signupTitle}</h1>
      <p className="mt-1 text-sm text-ink-soft">{t.auth.signupSubtitle}</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.auth.emailLabel}
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="password"
          name="password"
          required
          minLength={8}
          placeholder={t.auth.passwordLabel}
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <p className="-mt-2 text-xs text-ink-faint">{t.auth.passwordHint}</p>
        <button
          type="submit"
          className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-accent"
        >
          {t.auth.signupButton}
        </button>
      </form>

      <a
        href={googleHref}
        className="mt-3 block w-full rounded-lg border border-line bg-paper px-5 py-2.5 text-center text-sm font-semibold text-ink transition hover:bg-paper-dim"
      >
        {t.auth.continueWithGoogle}
      </a>

      <Link
        href="/login"
        className="mt-4 block text-center text-sm font-medium text-accent hover:text-accent-dark"
      >
        {t.auth.haveAccount} {t.auth.loginLink}
      </Link>
    </div>
  );
}
