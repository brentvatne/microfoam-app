module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      require.resolve("react-native-reanimated/plugin"),
      // NOTE: `expo-router/babel` is a temporary extension to `babel-preset-expo`.
      require.resolve("expo-router/babel"),
      [require.resolve("babel-plugin-module-resolver"),
      {
        root: ["./"],
        alias: {
          "~": "./"
        }
      }]
    ],
  };
};
