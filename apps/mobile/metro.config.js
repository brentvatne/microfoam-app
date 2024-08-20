const { getDefaultConfig } = require("expo/metro-config");
const { withExpoAtlas } = require("expo-atlas/metro");
const path = require("path");
const exclusionList = require("metro-config/src/defaults/exclusionList");

// Find the project and workspace directories
const projectRoot = __dirname;
// This can be replaced with `find-yarn-workspace-root`
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(__dirname);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// block metro from resolving everything from workspaceRoot/expo except for expo-notifications
const blockListRegex = new RegExp(
  `^${escapeRegExp(workspaceRoot)}/expo/packages/(?!expo-notifications).*`
);

// Utility function to escape special characters in a string for use in a regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const blockList = exclusionList([blockListRegex]);
config.resolver.blockList = blockList;

// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

module.exports = withExpoAtlas(config);
