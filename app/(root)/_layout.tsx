import { useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack, RootContainer } from "expo-router";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { ThemeColors } from "~/constants/colors";
import { ThemeContext } from "~/components/Themed";
import * as Settings from "expo-settings";

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

  return (
    <>
      <StatusBar style={resolvedColorScheme === "light" ? "dark" : "light"} />
      <RootContainer
        theme={resolvedColorScheme === "dark" ? CustomDarkTheme : DefaultTheme}
      />
      <ThemeContext.Provider value={resolvedColorScheme}>
        <Stack screenOptions={{ presentation: "modal" }} />
      </ThemeContext.Provider>
    </>
  );
}
