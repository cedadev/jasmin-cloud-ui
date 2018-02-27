const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                options: {
                    "presets": ["env", "react"],
                    "plugins": [
                        "transform-object-rest-spread",
                        "transform-class-properties"
                    ]
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'JASMIN Cloud Portal',
            template: 'assets/index.template.html',
            hash: true
        }),
        // Add CSS links with hashes for cache busting
        new AddAssetHtmlPlugin([
            // We can't rely on a wildcard as ordering is important
            {
                filepath: './assets/jasmin_theme/css/bootstrap-theme.css',
                outputPath: 'jasmin_theme/css',
                publicPath: '/jasmin_theme/css/',
                typeOfAsset: 'css',
                hash: true,
                includeSourcemap: false
            },
            {
                filepath: './assets/jasmin_theme/css/jasmin.css',
                outputPath: 'jasmin_theme/css',
                publicPath: '/jasmin_theme/css/',
                typeOfAsset: 'css',
                hash: true,
                includeSourcemap: false
            },
            {
                filepath: './assets/*.css',
                typeOfAsset: 'css',
                hash: true,
                includeSourcemap: false
            }
        ]),
        // Add images
        new CopyWebpackPlugin([
            { context: 'assets', from: 'jasmin_theme/img', to: 'jasmin_theme/img' },
        ])
    ]
};
