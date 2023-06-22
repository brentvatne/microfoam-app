import { ExpoConfig, ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  slug: config.slug, // Keep the slug the same to track under one project
  name: getName(config),
  icon: process.env.RELEASE ? config.icon : "./assets/icon-dev.png",
  ios: {
    ...config.ios,
    bundleIdentifier: getBundleIdentifier(config),
  },
  android: {
    ...config.android,
    package: getPackage(config),
  },
  updates: {
    fallbackToCacheTimeout: 0,
    url: getUpdatesUrl(),
  },
  extra: {
    eas: {
      projectId: process.env.EAS_BUILD_PROJECT_ID,
    },
  },
  plugins: [
    [
      "expo-document-picker",
      {
        iCloudContainerEnvironment: process.env.RELEASE
          ? "Production"
          : "Development",
      },
    ]
  ],
});

function getUpdatesUrl() {
  if (process.env.EXPO_STAGING) {
    return "https://staging-u.expo.dev/6122a374-f53d-4d9e-ac78-1fef59eeb937";
  } else {
    return "https://u.expo.dev/f19296df-44bd-482a-90bb-2af254c6ac42";
  }
}

function getName(config: Partial<ExpoConfig>) {
  const name = config.name;
  if (process.env.RELEASE) {
    return name;
  } else if (process.env.PREVIEW) {
    return `${name} (preview)`;
  } else {
    return `${name} (dev)`;
  }
}

function getBundleIdentifier(config: Partial<ExpoConfig>) {
  const bundleIdentifier = config.ios?.bundleIdentifier;
  if (process.env.RELEASE) {
    return bundleIdentifier;
  } else if (process.env.PREVIEW) {
    return `${bundleIdentifier}.preview`;
  } else {
    return `${bundleIdentifier}.dev`;
  }
}

function getPackage(config: Partial<ExpoConfig>) {
  const packageName = config.android?.package;
  if (process.env.RELEASE) {
    return packageName;
  } else if (process.env.PREVIEW) {
    return `${packageName}.preview`;
  } else {
    return `${packageName}.dev`;
  }
}
