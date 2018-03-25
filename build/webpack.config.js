const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');

const utils = require('./utils');
const config = require('./config');
const extractCss = new ExtractTextPlugin({
    filename: "css/[name].css",
});

module.exports = {
    context: path.resolve('./src'),
    entry: {
        content_script: ['./js/script/content-script.js', './scss/content-script.scss'],
        firefox_auth_helper: './js/script/firefox-auth-helper.js',
        background: [
            './js/background/extension.js',
            './js/background/shortcut.js',
            './js/background/message.js',
            './js/background/app.js',
        ],
        popup: ['./js/popup.js'],
        tour: ['./js/tour.js', './scss/tour.scss'],
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
            {
                test: /\.scss$/,
                use: extractCss.extract({
                    use: [{
                        loader: "css-loader",
                        options: {
                            sourceMap: true
                        }
                    }, {
                        loader: 'sass-loader',
                        options: {
                            strictMath: true,
                            noIeCompat: true
                        }
                    }],
                })
            }
        ],
    },
    resolve: {
        alias: {
            '@': path.join(__dirname, '..', 'src'),
            'lodash$': path.join(__dirname, '..', 'src/js/vendor/lodash.includes.min.js'),
            'vue$': 'vue/dist/vue.runtime.esm.js',
            'popper$': 'popper.js',
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'BUILD_DEBUG': JSON.stringify(config.env.debug),
            'BUILD_SCHEMA': JSON.stringify(config.env.schema),
            'BUILD_DOMAIN': JSON.stringify(config.env.domain),
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
            }
        }),
        // Compress extracted CSS. We are using this plugin so that possible
        // duplicated CSS from different components can be deduped.
        new OptimizeCSSPlugin({
            cssProcessorOptions: {
                safe: true
            }
        }),
        extractCss,
    ]
};

if (!config.env.debug) {
    const optimizePlugins = [
        new webpack.optimize.UglifyJsPlugin({
            ie8: false,
            compress: {
                warnings: true,
                // Pure console.log statements
                pure_funcs: ['console.log'],
            },
            sourceMap: true,
            // Eliminate comments
            comments: false,
        }),
    ];
    module.exports.plugins.push(...optimizePlugins);
}
