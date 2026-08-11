import type { NextConfig } from "next";

// Next.js Multi-Zones: VisitorGuide (the place-discovery "Keşfedin" tab)
// runs as its own separate Vercel deployment — a second project built from
// the VisitorGuide repo with NEXT_PUBLIC_BASE_PATH=/kesfedin — and this app
// reverse-proxies /kesfedin/* to it server-side, so the browser never
// leaves this domain. Defaults to the Vercel project name suggested when
// setting that deployment up; override via VISITORGUIDE_ZONE_URL if the
// project ends up with a different auto-generated domain.
const visitorGuideZoneUrl =
  process.env.VISITORGUIDE_ZONE_URL ?? "https://visitorguide-kesfedin.vercel.app";

const nextConfig: NextConfig = {
  images: {
    // LiteAPI's (liteapi.travel) hotel photo CDN — used on /hotels result
    // cards and the hotel detail page gallery.
    remotePatterns: [{ protocol: "https", hostname: "static.cupid.travel" }],
  },
  async rewrites() {
    return [
      { source: "/kesfedin", destination: `${visitorGuideZoneUrl}/kesfedin` },
      { source: "/kesfedin/:path*", destination: `${visitorGuideZoneUrl}/kesfedin/:path*` },
    ];
  },
};

export default nextConfig;
