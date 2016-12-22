let dev = {
    baseURL: 'http://localhost:5000',
};

let staging = {
    baseURL: 'https://shurlly.herokuapp.com'
};

let config;

if (BUILD_ENV === 'staging') {
    config = staging;
} else {
    config = dev;
}

export default config;