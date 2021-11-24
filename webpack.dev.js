const merge = require('webpack-merge');
const path = require('path');

module.exports = merge(
    require('./webpack.common.js'),
    {
        devtool: 'inline-source-map',
        devServer: {
            historyApiFallback: true,
            contentBase: path.join(__dirname, 'dist'),
            compress: true,
            port: 3000,
            disableHostCheck: true,
            proxy: [
                {
                    context: ['/api', '/static'],
                    target: 'http://localhost:8000',
                    changeOrigin: true
                }
            ]
        }
    }
);
