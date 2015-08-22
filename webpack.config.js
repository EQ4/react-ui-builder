var webpack = require("webpack");

module.exports = [
    {
        name: "browser",
        entry: {
            main: './client/src/main.js'
        },
        output: {
            path: './build/html',
            filename: 'builder-bundle.js'
        },
        module: {
            loaders: [
                //{ test: /\.js$/, exclude: /node_modules/, loader: 'jsx-loader?harmony' },
                { test: /\.js$/, exclude: /node_modules/, loader: 'babel?cacheDirectory' },
                { test: /\.css$/, exclude: /node_modules/, loader: "style-loader!css-loader" },
                //{ test: /\.(eot|woff|ttf|svg|png|jpg)([\?]?.*)$/, loader: 'url-loader?limit=8000&name=[name]-[hash].[ext]' }
                { test: /\.(eot|woff|ttf|svg|png|jpg)([\?]?.*)$/, exclude: /node_modules/, loader: 'url-loader' }
                //{ test: /\.(eot|woff|ttf)([\?]?.*)$/, loader: "file-loader" }
            ]
        },
        plugins: [
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin({minimize: true})
        ],
        externals: {
            // require("jquery") is external and available
            //  on the global var jQuery
            "jquery": "jQuery"
        }
    }
    //,
    //{
    //    name: "server",
    //    entry: {
    //        api: './server/src/api.js'
    //    },
    //    output: {
    //        path: './build/lib',
    //        filename: '[name].js',
    //        libraryTarget: 'commonjs2'
    //    },
    //    externals: /^[a-z\-0-9_]+$/,
    //    plugins: [
    //        new webpack.optimize.UglifyJsPlugin()
    //    ]
    //}
];

