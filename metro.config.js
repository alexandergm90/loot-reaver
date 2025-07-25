const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
    'require', // forces CommonJS fallback
    'react-native',
    'default',
];

module.exports = config;
