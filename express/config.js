const path = require('path'),
  rootPath = path.normalize(__dirname + '/..'),
  env = process.env.NODE_ENV || 'development';

let config = {
  development: {
    root: rootPath,
    app: {
      name: 'anime-bot',
    },
    port: process.env.PORT || 3000,
    token: process.env.TOKEN || ['token'],
  },

  test: {
    root: rootPath,
    app: {
      name: 'anime-bot',
    },
    port: process.env.PORT || 3000,
    token: process.env.TOKEN || ['token'],
  },

  production: {
    root: rootPath,
    app: {
      name: 'anime-bot',
    },
    port: process.env.PORT || 3000,
    token: process.env.TOKEN || ['token'],
  },
};

module.exports = config[env];
