require('./check-versions')();

const ora = require('ora');
const chalk = require('chalk');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const merge = require('webpack-merge');
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

    console.log(chalk.cyan('  Build complete.\n'));
});

// Generate manifest.json for different environment
const manifest = merge(
    require('../manifest/common.json'),
    require(process.env.PLATFORM === 'firefox' ? '../manifest/firefox.json' : '../manifest/chrome.json')
);

manifest['name'] = config.env.name;
manifest['version'] = config.env.version;
if (process.env.PLATFORM !== 'firefox') {
    manifest['key'] = config.env.manifestKey;
}

fs.writeFile('./extension/manifest.json', JSON.stringify(manifest), error => {
    if (error) console.log(error);
});