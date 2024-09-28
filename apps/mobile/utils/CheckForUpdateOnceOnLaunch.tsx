import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useUpdates, reloadAsync } from "expo-updates";
import { StatusBar } from "expo-status-bar";
import {
  useInitialUpdateState,
  UpdateCheckState,
} from "~/utils/useInitialUpdateState";

export default function CheckForLatestUpdateOnceOnLaunch(props: {
  onComplete: (options?: { timedOut?: boolean }) => void;
  timeout?: number;
}) {
  const state = useInitialUpdateState({ timeout: props.timeout });
  const {
    isChecking,
    isDownloading,
    isUpdatePending,
    isUpdateAvailable,
    downloadError,
    checkError,
    lastCheckForUpdateTimeSinceRestart,
  } = useUpdates();

  useEffect(() => {
    if (state === UpdateCheckState.UpdateReady) {
      // the holy grail of conditional branches
      requestAnimationFrame(() => reloadAsync());
    } else if (state === UpdateCheckState.Timeout) {
      props.onComplete({ timedOut: true });
    } else if (
      [
        UpdateCheckState.NoUpdateAvailable,
        UpdateCheckState.Error,
        UpdateCheckState.NoEventsAfterInitialized,
      ].includes(state)
    ) {
      props.onComplete();
    } else {
    } // In any other state we're just waiting
  }, [props, state]);

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
            {
              isChecking,
              isDownloading,
              isUpdatePending,
              isUpdateAvailable,
              downloadError,
              checkError,
              lastCheckForUpdateTimeSinceRestart,
            },
            null,
            2,
          )}
        </Text>
      </>
      <StatusBar style="auto" />
    </View>
  );
}
