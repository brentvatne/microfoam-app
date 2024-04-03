module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["transform-inline-environment-variables", {
        "include": [
          "VEXO_API_KEY"
        ]
      }],
      ["babel-plugin-module-resolver",
        {
          root: ["./"],
          alias: {
            "~": "./"
          }
        }],
    ],
  };
};
