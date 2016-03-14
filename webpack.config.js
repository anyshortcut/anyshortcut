module.exports = {
    entry: "./main.js",
    output: {
        path: './js',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.vue$/,
                loader: 'vue'
            }
        ]
    }
}