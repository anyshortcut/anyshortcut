const isProduction = process.env.NODE_ENV === 'production';


const env = {
    production: {
        debug: false,
        schema: 'https://',
        domain: 'anyshortcut.com',
        name: 'Anyshortcut',
        manifestKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtsU34L7ro2a1etZPGPg4rRD5gVP4I7Px1mZuJqafP5Bqoh+wtVmOZgGNS3nlyGBfLCYphC3mmtYrZ8OvXLb+fRIe0sk/k/F+cIEZPmExin0epDN4jtA8ptT+FMDf6bFxRfwMrJCHMpjsfNWqhfrVEIBsOHQiDGQyy/05fYfwWl/XocFfEmKWayYiwdijSLa5io/dS71qp0VeDwudbQo9El9cf0CZdbTbYziVORXf7BQQNW56o/51Tg4X6kdNqs0Ck9c1rnZIqf92sNRmsfHKdhBFpWN1d3hD9rJ7ROriq69f3HjbOX3pAAJHJX7JqwapvGbk7A1loyAwbDgo8VQICwIDAQAB',
    },
    stage: {
        debug: false,
        schema: 'https://',
        domain: 'stage.anyshortcut.com',
        name: 'Anyshortcut-Stage',
        manifestKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtsU34L7ro2a1etZPGPg4rRD5gVP4I7Px1mZuJqafP5Bqoh+wtVmOZgGNS3nlyGBfLCYphC3mmtYrZ8OvXLb+fRIe0sk/k/F+cIEZPmExin0epDN4jtA8ptT+FMDf6bFxRfwMrJCHMpjsfNWqhfrVEIBsOHQiDGQyy/05fYfwWl/XocFfEmKWayYiwdijSLa5io/dS71qp0VeDwudbQo9El9cf0CZdbTbYziVORXf7BQQNW56o/51Tg4X6kdNqs0Ck9c1rnZIqf92sNRmsfHKdhBFpWN1d3hD9rJ7ROriq69f3HjbOX3pAAJHJX7JqwapvGbk7A1loyAwbDgo8VQICwIDAQAB',
    },
    development: {
        debug: true,
        schema: 'http://',
        domain: 'dev.anyshortcut.com',
        name: 'Anyshortcut-Dev',
        manifestKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtsU34L7ro2a1etZPGPg4rRD5gVP4I7Px1mZuJqafP5Bqoh+wtVmOZgGNS3nlyGBfLCYphC3mmtYrZ8OvXLb+fRIe0sk/k/F+cIEZPmExin0epDN4jtA8ptT+FMDf6bFxRfwMrJCHMpjsfNWqhfrVEIBsOHQiDGQyy/05fYfwWl/XocFfEmKWayYiwdijSLa5io/dS71qp0VeDwudbQo9El9cf0CZdbTbYziVORXf7BQQNW56o/51Tg4X6kdNqs0Ck9c1rnZIqf92sNRmsfHKdhBFpWN1d3hD9rJ7ROriq69f3HjbOX3pAAJHJX7JqwapvGbk7A1loyAwbDgo8VQICwIDAQAB',
    }
};

module.exports = {
    productionSourceMap: isProduction,
    isProduction: isProduction,
    env: env[process.env.NODE_ENV],
};
