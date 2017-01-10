var webpack = require('webpack');

module.exports = {
    entry: {
        content_script: './extension/js/script/key-event-monitor.js',
        background: [
            './extension/js/background/message-handler.js',
            './extension/js/background/commands.js',
            './extension/js/background/injector.js',
            './extension/js/background/app.js',
        ],
        popup: './extension/js/popup.js',
        index: './extension/js/index.js',
    },
    output: {
        path: 'extension/build',
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                // use vue-loader for *.vue files
                test: /\.vue$/,
                loader: 'vue',
                exclude: /node_modules/
            },
            {
                // use babel-loader for *.js files
                test: /\.js$/,
                loader: 'babel',
                // important: exclude files in node_modules
                // otherwise it's going to be really slow!
                exclude: /node_modules/
            }
        ]
    },
    babel: {
        presets: ['es2015'],
        plugins: ['transform-runtime']
    },
    plugins: [
        new webpack.DefinePlugin({
            'BUILD_ENV': JSON.stringify(process.env.BUILD_ENV)
        })
    ]


};