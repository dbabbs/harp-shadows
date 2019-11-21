const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

// this webpack config consists of two generated bundles.
// 1. The bundle that is loaded in the web worker to do background tasks
// 2. The main bundle.

module.exports = [
    {
        entry: {
            mapview: "./src/app.js"
        },
        output: {
            filename: "[name].bundle.js"
        },
        devtool: "source-map",
        externals: {
            three: "THREE"
            // ammo: "Ammo"
        },
        resolve: {
            extensions: [".webpack.js", ".web.ts", ".ts", ".tsx", ".web.js", ".js"]
            // plugins: [ new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })]
        },
        module: {
            rules: [{ test: /\.tsx?$/, loader: "ts-loader" }]
        },
        performance: {
            hints: false
        },
        mode: process.env.NODE_ENV || "development",
        plugins: [
            new HtmlWebpackPlugin({
                template: "./index.html"
            }),
            new CopyWebpackPlugin([
                {
                    from: "../harp.gl/@here/harp-map-theme/resources",
                    to: "resources",
                    toType: "dir"
                },
                {
                    from: "./windmill",
                    to: "windmill",
                    toType: "dir"
                },
                {
                    from: "./css",
                    to: "css",
                    toType: "dir"
                },
                require.resolve("three/build/three.min.js"),
                require.resolve("three/build/three.js")
                // require.resolve("ammo.js/builds/ammo.js")
            ])
        ],
        devServer: {
            contentBase: path.join(__dirname, "dist")
        },
        stats: {
            all: false,
            timings: true,
            exclude: "/resources/",
            errors: true,
            entrypoints: true,
            warnings: true
        }
    },
    {
        target: "webworker",
        entry: {
            decoder: "./src/decoder.js"
        },
        output: {
            filename: "[name].bundle.js"
        },
        devtool: "source-map",
        // externals: {
        //     three: "THREE",
        // },
        resolve: {
            extensions: [".webpack.js", ".web.ts", ".ts", ".tsx", ".web.js", ".js"]
            // plugins: [ new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })]
        },
        module: {
            // rules: [
            //     { test: /\.tsx?$/, loader: "ts-loader" },
            // ]
        },
        performance: {
            hints: false
        },
        mode: process.env.NODE_ENV || "development"
    }
];
