const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');

const crypto = require('crypto');

/**
 * The MD4 algorithm is not available anymore in Node.js 17+ (because of library SSL 3).
 * In that case, silently replace MD4 by the MD5 algorithm.
 */
try {
    crypto.createHash('md4');
} catch (e) {
    console.warn('Crypto "MD4" is not supported anymore by this Node.js version');
    const origCreateHash = crypto.createHash;
    crypto.createHash = (alg, opts) => origCreateHash(alg === 'md4' ? 'md5' : alg, opts);
}

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        hashFunction: 'sha256'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react'
                        ],
                        plugins: [
                            '@babel/plugin-proposal-object-rest-spread',
                            '@babel/plugin-proposal-class-properties'
                        ]
                    }
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
            {
                filepath: './assets/*.css',
                typeOfAsset: 'css',
                hash: true,
                includeSourcemap: false
            }
        ]),
    ]
};
