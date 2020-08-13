const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    // devtool: 'inline-source-map',
    devtool: 'source-map',
    devServer: {
        contentBase: './src/',
        open: true,
        port: 8080,
        public: 'http://localhost:' + 8080,
        host: "0.0.0.0"
    }
});