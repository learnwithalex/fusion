/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  serverExternalPackages: ['pino', 'thread-stream'],
  turbopack: {},
  webpack: (config, { isServer, webpack }) => {
    // Ignore test files and directories
    config.plugins.push(
      new webpack.IgnorePlugin({
        checkResource(resource) {
          return (
            resource.includes('/test/') ||
            resource.includes('test/') ||
            resource.endsWith('.test.js') ||
            resource.endsWith('.test.mjs') ||
            resource.endsWith('.spec.js') ||
            resource.endsWith('bench.js')
          );
        },
      })
    );

    // If client-side, replace server-only packages with empty module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'pino': false,
        'thread-stream': false,
        'pino-pretty': false,
        'tap': false,
      };
    }

    return config;
  },
};

export default nextConfig;
