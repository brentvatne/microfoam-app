// Side effects
import { LogBox } from "react-native";
import PourStore from "./storage/PourStore";
import "react-native-url-polyfill/auto";
import "react-native-get-random-values";

// Register app entry through Expo Router
import "expo-router/entry";

LogBox.ignoreLogs([
  '@supabase/gotrue-js: Stack guards'
]);

