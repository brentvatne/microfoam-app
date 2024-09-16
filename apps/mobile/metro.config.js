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
  // path.resolve(workspaceRoot, "expo/node_modules"),
];
config.resolver.extraNodeModules = {
  "expo-modules-core": path.resolve(
    workspaceRoot,
    "expo/packages/expo-modules-core"
  ),
  "expo-notifications": path.resolve(
    workspaceRoot,
    "expo/packages/expo-notifications"
  ),
  "expo-updates": path.resolve(workspaceRoot, "expo/packages/expo-updates"),
  expo: path.resolve(workspaceRoot, "expo/packages/expo"),
};

const modulesToLoadFromExpoMonorepo = [
  "expo-modules-core",
  "expo-notifications",
  "expo-updates",
  "expo/",
];
const regexString = modulesToLoadFromExpoMonorepo.join("|");
const blockListRegex = [
  // block metro from resolving everything from workspaceRoot/expo except for selected modules
  // while it doesn't seem needed it doesn't hurt and makes stuff more predictable
  new RegExp(
    `^${escapeRegExp(workspaceRoot)}/expo/packages/(?!(${regexString})).*`
  ),
  // block metro from resolving the same modules from workspaceRoot/node_modules
  // because they are need to be resolved from workspaceRoot/expo
  new RegExp(
    `^${escapeRegExp(workspaceRoot)}/node_modules/(?=(${regexString})).*`
  ),
];
// Utility function to escape special characters in a string for use in a regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
config.resolver.blockList = exclusionList(blockListRegex);

// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

module.exports = withExpoAtlas(config);
