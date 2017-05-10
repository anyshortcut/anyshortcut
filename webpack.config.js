const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractLess = new ExtractTextPlugin({
    filename: "css/[name].css",
});

module.exports = {
    entry: {
        content_script: './js/script/key-event-monitor.js',
        background: [
            './js/background/message-handler.js',
            './js/background/commands.js',
            './js/background/app.js',
        ],
        popup: './js/popup.js',
    },
    output: {
        path: path.resolve(__dirname, 'extension/dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                // use vue-loader for *.vue files
                test: /\.vue$/,
                // Rule.loader is a shortcut to Rule.use: [ { loader } ]
                loader: 'vue-loader',
                include: [
                    path.resolve(__dirname, "component"),
                    path.resolve(__dirname, "view"),
                ],
                exclude: [
                    path.resolve(__dirname, "node_modules")
                ],
                // options: {
                //     presets: ["es2015"]
                // },
            },
            {
                // use less-loader for *.less files
                test: /\.less$/,
                use: extractLess.extract({
                    use: [{
                        loader: 'css-loader'
                    }, {
                        loader: 'less-loader',
                        options: {
                            strictMath: true,
                            noIeCompat: true
                        }
                    }],
                })
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    // name: utils.assetsPath('img/[name].[hash:7].[ext]')
                }
            }
        ],
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.common.js',
            'popper$': 'popper.js',
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'BUILD_DEBUG': JSON.stringify(process.env.BUILD_DEBUG),
            'BUILD_SCHEMA': JSON.stringify(process.env.BUILD_SCHEMA),
            'BUILD_DOMAIN': JSON.stringify(process.env.BUILD_DOMAIN),
        }),
        extractLess,
    ]
};