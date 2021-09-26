const path = require("path")
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {

    entry: "./src/index.js",
    plugins: [ 
        new HtmlWebpackPlugin({
            template: "./src/template.html"
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "src", "three.css"),
                    to: path.resolve(__dirname, "dist")
                },
                {
                    from: path.resolve(__dirname, "src/resources/images"),
                    to: path.resolve(__dirname, "dist/resources/images")
                }
            ]

        }),
    ],

    module: {
        rules: [
            {
                test: /\.(svg|png|jpg|gif)$/,
                use: {
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        outputPath: "dist\resources\images"
                    }
                }
            }
        ]
    }
};