/* eslint-env node */
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

/** @type {import('expo/metro-config').MetroConfig} */
module.exports = getSentryExpoConfig(__dirname);
