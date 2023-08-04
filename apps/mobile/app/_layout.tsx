import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as ReactNavigationThemeProvider,
} from "@react-navigation/native";
import { ThemeColors } from "~/constants/colors";
import {
  useTheme,
  useAutoSetAppearanceFromSettingsEffect,
} from "~/components/Themed";
import { useDataIsReady } from "~/storage/PourStore";
// import * as Sentry from "@sentry/react-native";

function Root() {
  useAutoSetAppearanceFromSettingsEffect();

  const theme = useTheme();
  const dataIsReady = useDataIsReady();

  if (!dataIsReady) {
    return null;
  }

  return (
    <>
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
    </>
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

export default Root;
// export default Sentry.wrap(Root);
