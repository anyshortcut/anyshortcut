const isProduction = process.env.NODE_ENV === 'production';
console.log('NODE_ENV', process.env.NODE_ENV);

// NOTE: stripeKey is stripe publishable key
const env = {
    production: {
        debug: false,
        schema: 'https://',
        domain: 'anyshortcut.com',
        stripeKey: 'pk_live_vbcxpb3yDyRpkvSLaJYmL1T4',
        extensionId: 'ginilcdjefkbpeelgekodpmmabppcfao',
    },
    stage: {
        debug: false,
        schema: 'https://',
        domain: 'stage.anyshortcut.com',
        stripeKey: 'pk_test_THOKo3pPiJob3LBHC86GKVbx',
        extensionId: 'bombllbobpdmocjdggjphjblfdbdjbdb',
    },
    development: {
        debug: true,
        schema: 'http://',
        domain: 'dev.anyshortcut.com',
        stripeKey: 'pk_test_THOKo3pPiJob3LBHC86GKVbx',
        extensionId: 'bombllbobpdmocjdggjphjblfdbdjbdb',
    }
};

module.exports = {
    productionSourceMap: isProduction,
    isProduction: isProduction,
    env: env[process.env.NODE_ENV],
};
