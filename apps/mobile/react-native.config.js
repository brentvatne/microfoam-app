const path = require("path");

const workspaceRoot = path.resolve(__dirname, "../..");

const dependencies = {
  // Help cli find and autolink this library
  "expo-notifications": {
    root: path.join(workspaceRoot, "expo", "packages", "expo-notifications"),
  },
};

module.exports = {
  dependencies,
};
