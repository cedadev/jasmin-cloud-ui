const merge = require('webpack-merge');
const path = require('path');

module.exports = merge(
    require('./webpack.common.js'),
    {
        devtool: 'inline-source-map',
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            compress: true,
            port: 9000,
            disableHostCheck: true
        }
    }
);
