const path = require("path");
// const webpack = require("webpack"); //to access built-in plugins
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    entry: "./src/js/App",
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
                "og:title": { property: "og:title", content: "panoglobe" },
                "og:description": {
                    property: "og:description",
                    content: "3D Globe Route Visualizer",
                },
                "og:image": {
                    property: "og:image",
                    content:
                        "https://raw.githubusercontent.com/weiserhei/panoglobe/dev/ogimage.jpg",
                },
                "og:url": {
                    property: "og:url",
                    content: "https://weiserhei.github.io/panoglobe/",
                },
            },
        }),
    ],
    output: {
        filename: "[name].[contenthash].bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
    optimization: {
        splitChunks: { name: "vendor", chunks: "all" },
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js"],
        alias: {
            Classes: path.resolve(__dirname, "src/js/classes/"),
        },
    },
    module: {
        rules: [
            {
                // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.geojson$/,
                loader: "json-loader",
            },
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
