import { auth0 } from "./lib/auth0";
import { LOCALE_COOKIE, SITE_LOCALES, type SiteLocale } from "./lib/i18n/siteLocales";

const LOCALE_CODES: readonly string[] = SITE_LOCALES.map((l) => l.locale);

function isSiteLocale(value: string): value is SiteLocale {
  return LOCALE_CODES.includes(value);
}

// Next.js 16 replaced middleware.ts with proxy.ts as the network-interception
// boundary. This is where the Auth0 SDK mounts its /auth/* routes (login,
// logout, callback, profile, etc.) and manages the session cookie.
export async function proxy(request: Request) {
  const url = new URL(request.url);

  // The bare /kesfedin entry (no locale segment) 404s under VisitorGuide's
  // own basePath routing — see next.config.ts's rewrites() comment. Resolve
  // the right locale ourselves (shared NEXT_LOCALE cookie, same one every
  // zone reads/writes, falling back to Turkish) and redirect to the
  // explicit path before the rewrite proxies it through.
  if (url.pathname === "/kesfedin") {
    const cookieLocale = request.headers
      .get("cookie")
      ?.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`))?.[1];
    const locale = cookieLocale && isSiteLocale(cookieLocale) ? cookieLocale : "tr";
    return Response.redirect(new URL(`/kesfedin/${locale}`, url), 307);
  }

  return await auth0.middleware(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
