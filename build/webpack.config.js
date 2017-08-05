const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const utils = require('./utils');
const config = require('./config');
const extractLess = new ExtractTextPlugin({
    filename: "css/[name].css",
});

module.exports = {
    context: path.resolve('./src'),
    entry: {
        content_script: './js/script/key-event-monitor.js',
        background: [
            './js/background/extension.js',
            './js/background/shortcut.js',
            './js/background/message.js',
            './js/background/app.js',
        ],
        popup: './js/popup.js',
        tour: './js/tour.js',
    },
    output: {
        path: path.resolve(__dirname, '../extension/dist'),
        publicPath: './dist/',
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                // use vue-loader for *.vue files
                test: /\.vue$/,
                // Rule.loader is a shortcut to Rule.use: [ { loader } ]
                loader: 'vue-loader',
                options: {
                    loaders: utils.cssLoaders({
                        sourceMap: config.isProduction,
                        extract: config.isProduction
                    }),
                }
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
                test: /\.html$/,
                loader: 'html-loader',
                options: {
                    attrs: ['img:src', 'img:data-src']
                }
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'img/[name].[ext]',
                }
            },
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
            'BUILD_DEBUG': JSON.stringify(config.env.debug),
            'BUILD_SCHEMA': JSON.stringify(config.env.schema),
            'BUILD_DOMAIN': JSON.stringify(config.env.domain),
        }),
        extractLess,
    ]
};