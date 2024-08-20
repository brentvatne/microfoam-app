import { useEffect } from 'react';
import { Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { Stack, router } from 'expo-router';
import {
  useUpdates,
  fetchUpdateAsync,
  checkForUpdateAsync,
  reloadAsync,
} from 'expo-updates';
import { useAppState } from '@react-native-community/hooks';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as ReactNavigationThemeProvider,
} from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeColors } from '~/constants/colors';
import {
  useTheme,
  useAutoSetAppearanceFromSettingsEffect,
} from '~/components/Themed';
import { useDataIsReady } from '~/storage/PourStore';
import { useQuickActionCallback } from '~/utils/useQuickActionCallback';

import { useNotificationObserverInRootLayout } from '~/components/Notifier';

function Root() {
  useAutoSetAppearanceFromSettingsEffect();
  useNotificationObserverInRootLayout(true); // true -> notifications can use data.url to navigate to specific routes
  const theme = useTheme();
  const dataIsReady = useDataIsReady();
  const { isChecking, isUpdateAvailable, isUpdatePending, downloadedUpdate } =
    useUpdates();

  const appState = useAppState();

  if (!dataIsReady) {
    return null;
  }

  useQuickActionCallback((action) => {
    if (action.id === '1') {
      requestAnimationFrame(() => {
        router.navigate('/new');
      });
    }
  });

  // Check for updates when app state changes to foreground
  useEffect(() => {
    if (appState === 'active' && !isUpdatePending && !isChecking && !__DEV__) {
      checkForUpdateAsync();
    }
  }, [appState]);

  // Prompt to install when an update is available
  useEffect(() => {
    if (isUpdateAvailable) {
      Alert.alert(`An update is available`, `Download and install it now?`, [
        {
          text: 'Yes',
          onPress: () => {
            fetchUpdateAsync();
          },
        },
        {
          text: "I'll do it later",
          onPress: () => {},
        },
      ]);
    }
  }, [isUpdateAvailable]);

  // Prompt to install when an update is downloaded
  useEffect(() => {
    if (downloadedUpdate) {
      Alert.alert(
        `An update is ready to install`,
        `Would you like to restart and install it now?`,
        [
          {
            text: 'Yes',
            onPress: () => {
              // @ts-ignore
              reloadAsync();
            },
          },
          {
            text: "I'll do it later",
            onPress: () => {},
          },
        ],
      );
    }
  }, [downloadedUpdate]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
      <ReactNavigationThemeProvider
        value={
          theme === 'dark'
            ? CustomNavigationDarkTheme
            : CustomNavigationLightTheme
        }
      >
        <Stack screenOptions={{ presentation: 'modal' }} />
      </ReactNavigationThemeProvider>
    </GestureHandlerRootView>
  );
}

const CustomNavigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#000',
  },
};

const CustomNavigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: ThemeColors.dark.tint,
    text: '#fff',
    notification: '#fff',
  },
};

export default Root;
