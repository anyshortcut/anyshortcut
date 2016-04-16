module.exports = {
    entry: {
        options: './main.js',
        contentScript: './js/keyeventmonitor.js',
        background: './js/background.js',
        popup: './js/popup.js',
        user: './js/user.js'
    },
    output: {
        path: 'build',
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