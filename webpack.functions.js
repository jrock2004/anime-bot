const Dotenv = require('dotenv-webpack');

// @see https://github.com/netlify/netlify-lambda#webpack-configuration
module.exports = {
  plugins: [new Dotenv()],
  externals: ['canvas'],
  node: {
    canvas: 'empty',
  },
};
