const isProduction = process.env.NODE_ENV === 'production';


const env = {
    production: {
        debug: false,
        schema: 'https://',
        domain: 'anyshortcut.com',
    },
    stage: {
        debug: false,
        schema: 'https://',
        domain: 'stage.anyshortcut.com',
    },
    development: {
        debug: true,
        schema: 'http://',
        domain: 'dev.anyshortcut.com',
    }
};

module.exports = {
    productionSourceMap: isProduction,
    isProduction: isProduction,
    env: env[process.env.NODE_ENV],
};
