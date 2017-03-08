var path = require('path');

module.exports = {
    entry: './main.coffee',
    module: {
		loaders: [
			{ test: /\.coffee$/, loader: "coffee-loader" }
		]
	},
	resolve: {
		extensions: [".coffee", ".js"]
	},
	output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist/'
    },
    devServer: {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
        }
    },
}
