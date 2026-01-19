const { override, webpack } = require('customize-cra');

module.exports = override(
  webpack((config) => {
    // Fix source-map-loader issues with date-fns and other packages
    const sourceMapLoader = config.module.rules.find(
      (rule) => rule.enforce === 'pre' && rule.loader && rule.loader.includes('source-map-loader')
    );
    
    if (sourceMapLoader) {
      sourceMapLoader.exclude = /node_modules/;
    }
    
    return config;
  })
);
