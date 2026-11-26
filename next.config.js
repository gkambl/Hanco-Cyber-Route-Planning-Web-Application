/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  webpack(config, { dev }) {
    // Reduce memory usage in development
    if (dev) {
      config.cache = false;
      config.devtool = false;
    }

    // Optimize WebAssembly handling to prevent memory issues
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    };

    // Reduce memory pressure with aggressive optimization
    config.optimization = {
      ...config.optimization,
      minimize: false,
      splitChunks: {
        chunks: 'all',
        maxSize: 200000,
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      },
    };

    config.resolve = {
      ...config.resolve,
      symlinks: false,
    };

    return config;
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

module.exports = nextConfig;
