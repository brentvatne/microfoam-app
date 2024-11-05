import { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { reloadAsync } from "expo-updates";
import { StatusBar } from "expo-status-bar";
import { View } from "../components/Themed";
import {
  useInitialUpdateState,
  UpdateCheckState,
} from "~/utils/useInitialUpdateState";

export default function CheckForLatestUpdateOnceOnLaunch(props: {
  onComplete: (options?: { timedOut?: boolean }) => void;
  timeout?: number;
}) {
  const state = useInitialUpdateState({ timeout: props.timeout });

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
        UpdateCheckState.NativeStateInitialized,
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
      }}
    >
      <ActivityIndicator size="large" color="#ccc" />
      <StatusBar style="auto" />
    </View>
  );
}
