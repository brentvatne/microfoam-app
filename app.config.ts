import { ExpoConfig, ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: process.env.RELEASE ? config.name : `${config.name} (dev)`,
  slug: process.env.RELEASE ? config.slug : `${config.slug}-dev`,
  icon: process.env.RELEASE ? config.icon : "./assets/icon-dev.png",
  ios: {
    ...config.ios,
    bundleIdentifier: process.env.RELEASE
      ? "com.brents.microfoam"
      : "com.brents.microfoam-dev",
  },
  android: {
    ...config.android,
    package: process.env.RELEASE
      ? "com.brents.microfoam"
      : "com.brents.microfoam-dev",
  },
});
