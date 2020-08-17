const path = require("path");
// const webpack = require("webpack"); //to access built-in plugins
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    entry: "./src/js/index.js",
    plugins: [
        new CleanWebpackPlugin(),
        // new webpack.ProvidePlugin({
        //     $: 'jquery',
        //     jQuery: 'jquery'
        // }),
        new HtmlWebpackPlugin({
            title: "Panoglobe",
            favicon: "favicon.ico",
            meta: {
                viewport:
                    "width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0",
            },
        }),
    ],
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
    optimization: {
        splitChunks: { name: "vendor", chunks: "all" },
    },
    resolve: {
        alias: {
            Classes: path.resolve(__dirname, "src/js/classes/"),
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            // {
            //     test: /\.scss$/,
            //     use: [
            //         "style-loader", // creates style nodes from JS strings
            //         "css-loader", // translates CSS into CommonJS
            //         "sass-loader" // compiles Sass to CSS, using Node Sass by default
            //     ]
            // },

            {
                test: /\.(scss)$/,
                use: [
                    {
                        loader: "style-loader", // inject CSS to page
                    },
                    {
                        loader: "css-loader", // translates CSS into CommonJS modules
                    },
                    {
                        loader: "postcss-loader", // Run postcss actions
                        options: {
                            plugins: function () {
                                // postcss plugins, can be exported to postcss.config.js
                                return [
                                    // require('precss'),
                                    require("autoprefixer"),
                                ];
                            },
                        },
                    },
                    {
                        loader: "sass-loader", // compiles Sass to CSS
                    },
                ],
            },

            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: { outputPath: "images" }, // where to place images
                    },
                ],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: { outputPath: "fonts" },
                    },
                ],
            },
        ],
    },
};
