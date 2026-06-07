import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Boss Rush moved under /events/boss-rush when /events became a mode hub.
      // Match only the six boss ids so /events/pvp and /events/boss-rush itself
      // are never caught.
      {
        source: "/events/:slug(mortrax|ossivar|vexspinne|vaelthorn|maelgrave|korrin)",
        destination: "/events/boss-rush/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
