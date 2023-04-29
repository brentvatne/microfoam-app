import { useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as ReactNavigationThemeProvider,
} from "@react-navigation/native";
import { ThemeColors } from "~/constants/colors";
import { ThemeContext } from "~/components/Themed";
import { useDataIsReady } from "~/storage/PourStore";
import * as Settings from "expo-settings";

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#000",
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: ThemeColors.dark.tint,
    text: "#fff",
    notification: "#fff",
  },
};

export default function Root() {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState<Settings.Theme>(Settings.getTheme());
  const dataIsReady = useDataIsReady();

  useEffect(() => {
    const subscription = Settings.addThemeListener(({ theme: newTheme }) => {
      setTheme(newTheme);
    });

    return () => subscription.remove();
  }, [setTheme]);

  let resolvedColorScheme = colorScheme;
  if (theme !== Settings.Theme.System) {
    resolvedColorScheme = theme === Settings.Theme.Dark ? "dark" : "light";
  }

  if (!dataIsReady) {
    return null;
  }

  return (
    <>
      <StatusBar style={resolvedColorScheme === "light" ? "dark" : "light"} />
      <ReactNavigationThemeProvider
        value={
          resolvedColorScheme === "dark" ? CustomDarkTheme : CustomLightTheme
        }
      >
        <ThemeContext.Provider value={resolvedColorScheme}>
          <Stack screenOptions={{ presentation: "modal" }} />
        </ThemeContext.Provider>
      </ReactNavigationThemeProvider>
    </>
  );
}
