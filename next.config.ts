import type { NextConfig } from "next";

// Next.js Multi-Zones: VisitorGuide (the place-discovery "Keşfedin" tab)
// runs as its own separate Vercel deployment — a second project built from
// the VisitorGuide repo with NEXT_PUBLIC_BASE_PATH=/kesfedin — and this app
// reverse-proxies /kesfedin/* to it server-side, so the browser never
// leaves this domain. That project's Vercel-assigned domain (override via
// VISITORGUIDE_ZONE_URL if it's ever recreated under a different domain).
const visitorGuideZoneUrl =
  process.env.VISITORGUIDE_ZONE_URL ?? "https://visitor-guide-jt6e-phi.vercel.app";

const nextConfig: NextConfig = {
  images: {
    // LiteAPI's (liteapi.travel) hotel photo CDN — used on /hotels result
    // cards and the hotel detail page gallery.
    remotePatterns: [{ protocol: "https", hostname: "static.cupid.travel" }],
  },
  async rewrites() {
    return [
      // The bare basePath root (VisitorGuide's default-locale "tr" home,
      // reached with no locale segment) 404s under Next.js basePath — a
      // narrow edge case in how next-intl's as-needed locale prefixing
      // interacts with basePath, confirmed via local testing (every other
      // route, including /kesfedin/en and /kesfedin/search, works fine).
      // Route the bare tab entry straight to the explicit /tr home instead
      // of hitting that broken bare path.
      { source: "/kesfedin", destination: `${visitorGuideZoneUrl}/kesfedin/tr` },
      { source: "/kesfedin/:path*", destination: `${visitorGuideZoneUrl}/kesfedin/:path*` },
    ];
  },
};

export default nextConfig;
