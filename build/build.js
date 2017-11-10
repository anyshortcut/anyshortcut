require('./check-versions')();

const utils = require('./utils');
const ora = require('ora');
const chalk = require('chalk');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const config = require('./config');
const fs = require('fs');

const spinner = ora('building for production...');
spinner.start();

webpack(webpackConfig, function(err, stats) {
    spinner.stop();
    if (err) throw err;
    process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    }) + '\n\n');

    utils.execute("terminal-notifier -title 'Spruce' -message 'build complete' -sound default");
    console.log(chalk.cyan('  Build complete.\n'));
});

// Generate manifest.json for different environment
fs.readFile('./build/manifest.json', (error, data) => {
    if (error) console.log(error);
    const manifest = JSON.parse(data);

    manifest['name'] = config.env.name;
    manifest['key'] = config.env.manifestKey;

    fs.writeFile('./extension/manifest.json', JSON.stringify(manifest), error => {
        if (error) console.log(error);
    })

});