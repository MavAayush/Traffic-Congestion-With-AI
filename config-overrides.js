const webpack = require("webpack");

module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    zlib: require.resolve("browserify-zlib"),
  };
  return config;
};
