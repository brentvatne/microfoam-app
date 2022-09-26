// NOTE: `expo-router/metro-config` is a temporary version of `expo/metro-config`.
const { getDefaultConfig } = require("expo-router/metro-config");
module.exports = require("expo-router/metro-config").getDefaultConfig(
	__dirname
);

