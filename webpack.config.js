const path = require('path');
let webpack = require('webpack');

module.exports = {
    entry: {
        content_script: './js/script/key-event-monitor.js',
        background: [
            './js/background/message-handler.js',
            './js/background/commands.js',
            './js/background/injector.js',
            './js/background/app.js',
        ],
        popup: './js/popup.js',
        index: './js/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'extension/build'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                // use vue-loader for *.vue files
                test: /\.vue$/,
                loader: 'vue-loader',
                include: [
                    path.resolve(__dirname, "component")
                ],
                exclude: [
                    path.resolve(__dirname, "node_modules")
                ],
                options: {
                    presets: ["es2015"]
                },
            },
            {
                // use babel-loader for *.js files
                test: /\.js$/,
                loader: 'babel-loader',
                include: [
                    path.resolve(__dirname, "js")
                ],
                exclude: [
                    path.resolve(__dirname, "node_modules")
                ],
            },
            {
                // use less-loader for *.less files
                test: /\.less$/,
                loader: [
                    'style-loader',
                    'css-loader',
                    'less-loader'
                ],
                include: [
                    path.resolve(__dirname, "less")
                ],
                exclude: [
                    path.resolve(__dirname, "node_modules")
                ],
            }
        ],
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.common.js'
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'BUILD_DEBUG': JSON.stringify(process.env.BUILD_DEBUG),
            'BUILD_BASE_URL': JSON.stringify(process.env.BUILD_BASE_URL),
        })
    ]
};