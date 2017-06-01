const isProduction = process.env.NODE_ENV === 'production';

const productionEnv = {
    debug: false,
    schema: 'http://',
    domain: 'anyshortcut.com',
};

const developmentEnv = {
    debug: true,
    schema: 'http://',
    domain: 'dev.anyshortcut.com',
};

module.exports = {
    productionSourceMap: isProduction,
    isProduction: isProduction,
    env: isProduction ? productionEnv : developmentEnv,
};
