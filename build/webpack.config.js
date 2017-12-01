const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');

const utils = require('./utils');
const config = require('./config');
const extractLess = new ExtractTextPlugin({
    filename: "css/[name].css",
});

module.exports = {
    context: path.resolve('./src'),
    entry: {
        content_script: './js/script/content-script.js',
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
        publicPath: '/dist/',
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [path.resolve(__dirname, '../src')],
                options: {
                    presets: ['es2015']
                }
            },
            {
                // use vue-loader for *.vue files
                test: /\.vue$/,
                // Rule.loader is a shortcut to Rule.use: [ { loader } ]
                loader: 'vue-loader',
                options: {
                    loaders: utils.cssLoaders({
                        sourceMap: config.isProduction,
                        extract: true
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
                loader: 'file-loader',
                options: {
                    name: 'img/[name].[ext]',
                }
            },
        ],
    },
    resolve: {
        alias: {
            '@': path.join(__dirname, '..', 'src'),
            '%': path.join(__dirname, '..', 'src/templates'),
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

if (!config.env.debug) {
    const optimizePlugins = [
        // new UglifyJSPlugin({
        new webpack.optimize.UglifyJsPlugin({
            ie8: false,
            compress: {
                warnings: true,
                // Pure console.log statements
                pure_funcs: ['console.log'],
            },
            sourceMap: false,
            // Eliminate comments
            comments: false,
        }),
        // Compress extracted CSS. We are using this plugin so that possible
        // duplicated CSS from different components can be deduped.
        new OptimizeCSSPlugin({
            cssProcessorOptions: {
                safe: true
            }
        }),
    ];
    module.exports.plugins.push(...optimizePlugins);
}
