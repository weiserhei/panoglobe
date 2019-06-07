  const merge = require('webpack-merge');
  const common = require('./webpack.common.js');

  module.exports = merge(common, {
    mode: 'production',
    performance: { 
      // hints: false,
      maxEntrypointSize: 5120000,
      maxAssetSize: 5120000
    }
  });