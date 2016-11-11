module.exports = {
    entry: {
        contentScript: './extension/js/keyeventmonitor.js',
        background: ['./extension/js/background/message-handler.js',
            './extension/js/background/commands.js'],
        popup: './extension/js/popup.js',
        authentication: './extension/js/authentication.js'
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
    }
};