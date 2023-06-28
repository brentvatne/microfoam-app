// Side effect
import { LogBox } from "react-native";
import PourStore from "./storage/PourStore";
import "react-native-url-polyfill/auto";
import "react-native-get-random-values";

// Register app entry through Expo Router
import "expo-router/entry";
// import * as Sentry from 'sentry-expo';

// Sentry.init({
//   dsn: "https://b337eed59a5f49b4ac16368fdad425f1@o261932.ingest.sentry.io/4505416115093504",
// });

import { vexo } from "vexo-analytics";

if (!__DEV__) {
  vexo(process.env.EXPO_PUBLIC_VEXO_API_KEY);
}

LogBox.ignoreLogs(["Constants.platform.ios.model"]);
