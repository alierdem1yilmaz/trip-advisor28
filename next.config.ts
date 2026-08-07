import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // LiteAPI's (liteapi.travel) hotel photo CDN — used on /hotels result
    // cards and the hotel detail page gallery.
    remotePatterns: [{ protocol: "https", hostname: "static.cupid.travel" }],
  },
};

export default nextConfig;
