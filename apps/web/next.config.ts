import type { NextConfig } from "next";

import path from 'path';

const nextConfig: NextConfig = {
  webpack(config) {
    config.resolve.alias['isomorphic-ws'] = path.join(process.cwd(), 'lib', 'isomorphic-ws-fix.mjs');
    config.resolve.fallback = { fs: false, net: false, tls: false, child_process: false };
    config.experiments = { 
      ...config.experiments, 
      asyncWebAssembly: true, 
      topLevelAwait: true,
      layers: true 
    };
    return config;
  },
};

export default nextConfig;
