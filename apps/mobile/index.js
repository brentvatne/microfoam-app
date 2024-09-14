// Side effects
import { LogBox } from "react-native";
import "./storage/PourStore";
import "react-native-url-polyfill/auto";
// import { vexo } from "vexo-analytics";
import "react-native-get-random-values";

// Register app entry through Expo Router
import "expo-router/entry";

import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://b337eed59a5f49b4ac16368fdad425f1@o261932.ingest.sentry.io/4505416115093504",
  // dsn: process.env.EXPO_PUBLIC_SENTRY_DSN
});

LogBox.ignoreLogs(["@supabase/gotrue-js: Stack guards"]);

if (!__DEV__) {
  // vexo(process.env.EXPO_PUBLIC_VEXO_API_KEY);
}
