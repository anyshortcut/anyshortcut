const isProduction = process.env.NODE_ENV === 'production';


const env = {
    production: {
        debug: false,
        schema: 'https://',
        domain: 'anyshortcut.com',
        name: 'Anyshortcut',
        version: '1.8.0',
        manifestKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtsU34L7ro2a1etZPGPg4rRD5gVP4I7Px1mZuJqafP5Bqoh+wtVmOZgGNS3nlyGBfLCYphC3mmtYrZ8OvXLb+fRIe0sk/k/F+cIEZPmExin0epDN4jtA8ptT+FMDf6bFxRfwMrJCHMpjsfNWqhfrVEIBsOHQiDGQyy/05fYfwWl/XocFfEmKWayYiwdijSLa5io/dS71qp0VeDwudbQo9El9cf0CZdbTbYziVORXf7BQQNW56o/51Tg4X6kdNqs0Ck9c1rnZIqf92sNRmsfHKdhBFpWN1d3hD9rJ7ROriq69f3HjbOX3pAAJHJX7JqwapvGbk7A1loyAwbDgo8VQICwIDAQAB',
    },
    stage: {
        debug: false,
        schema: 'https://',
        domain: 'stage.anyshortcut.com',
        name: 'Anyshortcut-Stage',
        version: '1.8.0',
        manifestKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3QF573d7o5O8RuZrOj+NpelxBENcKZX0dcVfUBgOn/PlxD3UWpqYYmTWsJKukun32cZwLHJMbF6ytg1Fs2HCsgPS6gAzWiyOFIj/xIOvjX31rSIR+Q/inTL5XG0EBJzwSa8jUa4RYGArqIR5GW6PeKdkhUsi1BnWQZI9jMr3/a3MBJHdzUKWSEV6dzmodIt9QELRIVhko1kFo0rI8ay02qGm+JYZtizyrdueA6FQ67xjZXJjUsObxl+0awmn7sRsPZNi+TAnvQY+xRHO8a1pBzGk9rcuvWZBGp2bQy8rb7AQ2YNzK/NuUWtHn1UMjfQC7qJHXS7cu4ouqQC7VRFILwIDAQAB',
    },
    development: {
        debug: true,
        schema: 'http://',
        domain: 'dev.anyshortcut.com',
        name: 'Anyshortcut-Dev',
        version: '1.8.0',
        manifestKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3QF573d7o5O8RuZrOj+NpelxBENcKZX0dcVfUBgOn/PlxD3UWpqYYmTWsJKukun32cZwLHJMbF6ytg1Fs2HCsgPS6gAzWiyOFIj/xIOvjX31rSIR+Q/inTL5XG0EBJzwSa8jUa4RYGArqIR5GW6PeKdkhUsi1BnWQZI9jMr3/a3MBJHdzUKWSEV6dzmodIt9QELRIVhko1kFo0rI8ay02qGm+JYZtizyrdueA6FQ67xjZXJjUsObxl+0awmn7sRsPZNi+TAnvQY+xRHO8a1pBzGk9rcuvWZBGp2bQy8rb7AQ2YNzK/NuUWtHn1UMjfQC7qJHXS7cu4ouqQC7VRFILwIDAQAB',
    }
};

module.exports = {
    productionSourceMap: isProduction,
    isProduction: isProduction,
    env: env[process.env.NODE_ENV],
};
