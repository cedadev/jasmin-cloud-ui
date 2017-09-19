const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
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
            template: 'index.template.html',
            hash: true
        })
    ]
};
