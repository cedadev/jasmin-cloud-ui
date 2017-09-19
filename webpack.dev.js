const merge = require('webpack-merge');

module.exports = merge(
    require('./webpack.common.js'),
    {
        devtool: 'inline-source-map'
    }
);
