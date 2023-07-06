// Side effects
import { LogBox } from "react-native";
import PourStore from "./storage/PourStore";
import "react-native-url-polyfill/auto";
import "react-native-get-random-values";

// Register app entry through Expo Router
import "expo-router/entry";
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN
});

import { vexo } from "vexo-analytics";

if (!__DEV__) {
  vexo(process.env.EXPO_PUBLIC_VEXO_API_KEY);
}