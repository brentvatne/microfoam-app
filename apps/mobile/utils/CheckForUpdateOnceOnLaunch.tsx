import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useUpdates, reloadAsync, UseUpdatesReturnType } from "expo-updates";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const useSingleTimeout = (
  onExpire: () => void,
  timeout?: number,
  dependencies = [],
) => {
  const [executed, setExecuted] = useState(false);

  useEffect(() => {
    if (typeof timeout === "number" && !executed) {
      const timeoutId = setTimeout(onExpire, timeout);
      return () => {
        setExecuted(true);
        clearTimeout(timeoutId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, executed]);
};

export default function CheckForLatestUpdateOnceOnLaunch(props: {
  onComplete: (options?: { timedOut?: boolean; errored?: boolean }) => void;
  renderLoadingScreen?: () => React.ReactNode;
  manifestTimeout?: number;
  timeout?: number;
}) {
  const { onComplete } = props;
  const updatesState = useUpdates();
  const {
    isChecking,
    isDownloading,
    isUpdatePending,
    isUpdateAvailable,
    downloadError,
    downloadedUpdate,
    checkError,
  } = updatesState;
  const [initialDelayComplete, setInitialDelayComplete] = useState<
    boolean | undefined
  >(false);

  // Add a very short initial delay where we keep the splash open, which could
  // be useful in case the update finishes very quickly, so we won't need to show
  // any other UI. It also ensures that expo-updates has had a chance to fire the
  // check request.
  useSingleTimeout(() => setInitialDelayComplete(true), 150);
  useEffect(() => {
    if (initialDelayComplete) {
      // Hide the splash screen here so we give the app a chance to render some
      // initial UI before we show the loading screen
      requestAnimationFrame(() => {
        SplashScreen.hideAsync();
      });
    }
  }, [initialDelayComplete]);

  // Bail out if the manifest check is taking too long
  const isManifestCheckComplete = _isManifestCheckComplete(updatesState);
  useSingleTimeout(
    () => onComplete({ timedOut: true }),
    props.manifestTimeout,
    [isManifestCheckComplete],
  );

  // Bail out if this is taking too long overall
  useSingleTimeout(() => onComplete({ timedOut: true }), props.timeout);

  useEffect(() => {
    const isInErrorState = checkError || downloadError;
    const isInProgressState = isChecking || isDownloading;
    const isReadyToUpdate = isUpdatePending || downloadedUpdate;

    if (isReadyToUpdate) {
      reloadAsync();
    }

    // Let's make sure we have a chance for expo-updates to initialize and fire the check request
    // before we start evaluating its state
    if (!initialDelayComplete) {
      return;
    }

    if (isInErrorState) {
      props.onComplete({ errored: true });
    } else if (!isInProgressState && !isReadyToUpdate) {
      props.onComplete();
    }
  }, [
    initialDelayComplete,
    isChecking,
    isDownloading,
    isUpdatePending,
    isUpdateAvailable,
    checkError,
    downloadError,
    downloadedUpdate,
    props,
  ]);

  if (props.renderLoadingScreen) {
    return props.renderLoadingScreen();
  } else {
    // Put your beautiful loading UI here
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <>
          <ActivityIndicator size="large" color="#ccc" />
          <Text style={{ fontSize: 20, marginTop: 10 }}>Preparing the app</Text>
          <Text>
            Current state:{" "}
            {JSON.stringify(
              { isChecking, isDownloading, isUpdatePending, isUpdateAvailable },
              null,
              2,
            )}
          </Text>
        </>
        <StatusBar style="auto" />
      </View>
    );
  }
}

function _isManifestCheckComplete({
  isDownloading,
  isUpdatePending,
  isUpdateAvailable,
  downloadError,
  checkError,
  downloadedUpdate,
}: UseUpdatesReturnType) {
  return (
    isDownloading ||
    isUpdatePending ||
    isUpdateAvailable ||
    downloadError ||
    checkError ||
    downloadedUpdate
  );
}
