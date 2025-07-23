/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable Next.js automated font optimization
  optimizeFonts: false,
  webpack(config, { dev, isServer }) {
    // Reduce memory usage in development
    if (dev) {
      config.devtool = 'eval-cheap-module-source-map';
      config.cache = false;
      // Disable source maps in development to save memory
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
    
    // Limit memory usage
    config.resolve = {
      ...config.resolve,
      symlinks: false,
    };
    
    return config;
  },
  // Reduce memory usage and disable problematic features
  experimental: {
    workerThreads: false,
    cpus: 1,
    esmExternals: false,
  },
  // Disable SWC minification to reduce memory usage
  swcMinify: true,
};

module.exports = nextConfig;
