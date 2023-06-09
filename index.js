// Side effect
import { LogBox } from "react-native";
import PourStore from "./storage/PourStore";
import "react-native-url-polyfill/auto";
import "react-native-get-random-values";

// Register app entry through Expo Router
import "expo-router/entry";

import { vexo } from "vexo-analytics";

if (!__DEV__) {
  vexo(process.env.VEXO_API_KEY);
}

LogBox.ignoreLogs(["Constants.platform.ios.model"]);
