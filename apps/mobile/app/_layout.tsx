import * as React from 'react';
import { StatusBar } from "expo-status-bar";
import { Stack, router } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as ReactNavigationThemeProvider,
} from "@react-navigation/native";
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ThemeColors } from "~/constants/colors";
import {
  useTheme,
  useAutoSetAppearanceFromSettingsEffect,
} from "~/components/Themed";
import { useDataIsReady } from "~/storage/PourStore";
import { useQuickActionCallback } from "~/utils/useQuickActionCallback";

import * as Sentry from "@sentry/react-native";

function Root() {
  useAutoSetAppearanceFromSettingsEffect();
  const theme = useTheme();
  const dataIsReady = useDataIsReady();

  if (!dataIsReady) {
    return null;
  }

  useQuickActionCallback((action) => {
    if (action.id === "1") {
      requestAnimationFrame(() => {
        router.push("/new");
      });
    }
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={theme === "light" ? "dark" : "light"} />
      <ReactNavigationThemeProvider
        value={
          theme === "dark"
            ? CustomNavigationDarkTheme
            : CustomNavigationLightTheme
        }
      >
        <Stack screenOptions={{ presentation: "modal" }} />
      </ReactNavigationThemeProvider>
    </GestureHandlerRootView>
  );
}

const CustomNavigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#000",
  },
};

const CustomNavigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: ThemeColors.dark.tint,
    text: "#fff",
    notification: "#fff",
  },
};

// export default Root;
export default Sentry.wrap(Root);
