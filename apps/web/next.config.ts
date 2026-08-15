import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.resolve.alias['isomorphic-ws'] = new URL('./lib/isomorphic-ws-fix.mjs', import.meta.url).pathname;
    config.resolve.fallback = { fs: false, net: false, tls: false, child_process: false };
    config.experiments = { asyncWebAssembly: true, topLevelAwait: true };
    return config;
  },
};

export default nextConfig;
