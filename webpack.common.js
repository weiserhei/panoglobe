const path = require('path');
const webpack = require('webpack'); //to access built-in plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './src/js/index.js',
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new HtmlWebpackPlugin({
            title: 'Panoglobe',
            meta: {"viewport": 'width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0'}
        })
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        alias: {
          Classes: path.resolve(__dirname, 'src/js/classes/'),
        }
    },
    module: {
        rules: [
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        },
        {
            test: /\.scss$/,
            use: [
                "style-loader", // creates style nodes from JS strings
                "css-loader", // translates CSS into CommonJS
                "sass-loader" // compiles Sass to CSS, using Node Sass by default
            ]
        },
        {
            test: /\.(png|svg|jpg|gif)$/,
            use: [
                { 
                    loader: 'file-loader',
                    options: { outputPath: 'images' } // where to place images referenced in CSS
                }
            ]
        },
        {
            test: /\.(woff|woff2|eot|ttf|otf)$/,
            use: [
                'file-loader'
            ]
        }
        ]
    }
};