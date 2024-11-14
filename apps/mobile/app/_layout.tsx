import { useState, useEffect, useCallback } from "react";
import { SystemBars } from "react-native-edge-to-edge";
import { Stack, router } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as ReactNavigationThemeProvider,
} from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeColors } from "~/constants/colors";
import {
  useTheme,
  useAutoSetAppearanceFromSettingsEffect,
} from "~/components/Themed";
import { useDataIsReady } from "~/storage/PourStore";
import { useQuickActionCallback } from "~/utils/useQuickActionCallback";
import CheckForLatestUpdateOnceOnLaunch from "~/utils/CheckForUpdateOnceOnLaunch";

import * as Sentry from "@sentry/react-native";

function Root() {
  useAutoSetAppearanceFromSettingsEffect();
  const theme = useTheme();
  const dataIsReady = useDataIsReady();
  const [initialUpdateCheckCompleted, setInitialUpdateCheckCompleted] =
    useState(false);
  const [delayedQuickAction, setDelayedQuickAction] = useState(undefined);

  const handleQuickAction = useCallback(
    (action: { id: string }) => {
      if (dataIsReady && initialUpdateCheckCompleted) {
        if (action.id === "1") {
          requestAnimationFrame(() => {
            router.navigate("/new");
          });
        }
      } else {
        setDelayedQuickAction(action);
      }
    },
    [dataIsReady, initialUpdateCheckCompleted],
  );

  // Deal with the app not being ready to fire a quick action on launch
  useEffect(() => {
    if (delayedQuickAction) {
      handleQuickAction(delayedQuickAction);
      setDelayedQuickAction(undefined);
    }
  }, [handleQuickAction, delayedQuickAction]);

  useQuickActionCallback(handleQuickAction);

  if (!initialUpdateCheckCompleted) {
    return (
      <CheckForLatestUpdateOnceOnLaunch
        onComplete={() => setInitialUpdateCheckCompleted(true)}
        timeout={10000}
      />
    );
  }

  if (!dataIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SystemBars style={theme === "light" ? "dark" : "light"} />
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
