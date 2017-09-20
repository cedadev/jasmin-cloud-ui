const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
        new CopyWebpackPlugin([
            { context: 'assets', from: 'jasmin_theme/css', to: 'jasmin_theme/css' },
            { context: 'assets', from: 'jasmin_theme/img', to: 'jasmin_theme/img' },
            { context: 'assets', from: 'tweaks.css' }
        ])
    ]
};
