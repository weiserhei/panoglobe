const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new CopyPlugin([
      { from: 'src/data', to: 'data' },
      { from: 'src/textures', to: 'textures' },
    ]),
  ],
  performance: { 
    // hints: false,
    maxEntrypointSize: 5120000,
    maxAssetSize: 5120000
  }
});