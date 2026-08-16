import type { NextConfig } from "next";

import path from 'path';

const nextConfig: NextConfig = {
  webpack(config, { isServer }) {
    config.resolve.alias['isomorphic-ws'] = path.join(process.cwd(), 'lib', 'isomorphic-ws-fix.mjs');
    config.resolve.fallback = { fs: false, net: false, tls: false, child_process: false };
    config.experiments = { 
      ...config.experiments, 
      asyncWebAssembly: true, 
      topLevelAwait: true,
      layers: true 
    };

    // Tell Webpack the browser target supports async/await natively
    // This silences the "async/await" WASM warnings for client bundles
    if (!isServer) {
      config.output = {
        ...config.output,
        environment: {
          ...config.output?.environment,
          asyncFunction: true,
        },
      };
    }

    // Suppress known harmless warnings from Midnight SDK dynamic imports
    const originalWarnHandler = config.ignoreWarnings || [];
    config.ignoreWarnings = [
      ...originalWarnHandler,
      /Critical dependency: the request of a dependency is an expression/,
      /async\/await.*asyncWebAssembly/,
    ];

    return config;
  },
};

export default nextConfig;
