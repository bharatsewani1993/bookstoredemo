const local = require('./local');
const development = require('./development');
const production = require('./production');
const stage = require('./stage');

const envSettings = () => {
    switch (process.env.APP_ENV) {
        case 'local':
        return local;
        case 'dev':
        return development;
        case 'production':
        return production;
        case 'stage':
        return stage;
        default:
        return local;
    }
}

module.exports = {
    envSettings
}