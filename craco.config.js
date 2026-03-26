module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve = webpackConfig.resolve || {};

      // Disable stream fallback
      webpackConfig.resolve.fallback = {
        ...(webpackConfig.resolve.fallback || {}),
        stream: false,
      };

      // Override papaparse's "browser" field so webpack uses papaparse.js
      // instead of papaparse.min.js — the minified file causes babel-loader
      // to stack-overflow on new Node.js versions
      webpackConfig.resolve.mainFields = ['main', 'module'];

      return webpackConfig;
    },
  },
};
