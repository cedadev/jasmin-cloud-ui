const path = require('path');

module.exports = {
    entry: "./src/main.js",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist")
    },

    devtool: 'source-map',

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
    }
};
