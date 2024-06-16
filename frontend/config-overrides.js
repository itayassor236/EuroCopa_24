const { overrideDevServer } = require('customize-cra');

module.exports = {
  devServer: overrideDevServer(config => {
    config.host = 'EuroCopa24.it';
    config.port = 3000;
    return config;
  })
};
