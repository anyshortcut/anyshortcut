const path = require('path');
let config = require('./config');
const utils = require('./utils');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
    context: path.resolve('./'),
    entry: {
        index: ['./css/index.scss'],
        pricing: ['./js/pricing.js', './css/pricing.scss'],
        faq: ['./css/faq.scss'],
        account: ['./js/account.js', './css/account.scss'],
    },
    output: {
        path: path.join(__dirname,'..', 'static'),
        filename: 'js/[name].js',
        publicPath: '/',
    },
    resolve: {
        extensions: ['.js', '.vue', '.json', '.css'],
        alias: {
            '@': path.join(__dirname,'..', '.'),
            '%': path.join(__dirname,'..', 'templates'),
            'popper$': 'popper.js',
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
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
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'img/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'fonts/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
                options: {
                    attrs: ['img:src', 'img:data-src']
                }
            },
            ...utils.styleLoaders({
                sourceMap: false,
                extract: true
            })
        ]
    },
    plugins: [
        // http://vuejs.github.io/vue-loader/en/workflow/production.html
        new webpack.DefinePlugin({
            'BUILD_DEBUG': JSON.stringify(config.env.debug),
            'BUILD_SCHEMA': JSON.stringify(config.env.schema),
            'BUILD_DOMAIN': JSON.stringify(config.env.domain),
            'BUILD_STRIPE_KEY': JSON.stringify(config.env.stripeKey),
            'BUILD_EXTENSION_ID': JSON.stringify(config.env.extensionId),
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
            }
        }),
        // extract css into its own file
        new ExtractTextPlugin({
            filename: 'css/[name].css'
        }),
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
