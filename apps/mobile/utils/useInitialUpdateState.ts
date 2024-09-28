import { useEffect, useState } from "react";
import { useUpdates } from "expo-updates";

export enum UpdateCheckState {
  Unknown = "Unknown",
  NativeStateInitialized = "NativeStateInitialized",
  NoEventsAfterInitialized = "NoEventsAfterInitialized",
  InProgress = "InProgress",
  UpdateReady = "UpdateReady",
  NoUpdateAvailable = "NoUpdateAvailable",
  Error = "Error",
  Timeout = "Timeout",
}

const DEFAULT_TIMEOUT = 10_000;

export function useInitialUpdateState(options?: { timeout?: number }) {
  const {
    isChecking,
    isDownloading,
    isUpdatePending,
    isUpdateAvailable,
    downloadError,
    downloadedUpdate,
    checkError,
    lastCheckForUpdateTimeSinceRestart,
  } = useUpdates();
  const [updateCheckState, setUpdateCheckState] = useState<UpdateCheckState>(
    UpdateCheckState.Unknown,
  );

  useEffect(() => {
    // Don't go backwards from these states
    if (
      [
        UpdateCheckState.UpdateReady,
        UpdateCheckState.NoUpdateAvailable,
        UpdateCheckState.Error,
        UpdateCheckState.Timeout,
      ].includes(updateCheckState)
    ) {
      return;
    }

    if (isUpdatePending || downloadedUpdate) {
      setUpdateCheckState(UpdateCheckState.UpdateReady);
    } else if (checkError || downloadError) {
      setUpdateCheckState(UpdateCheckState.Error);
    } else if (
      (isChecking || isDownloading || (!isDownloading && isUpdateAvailable)) &&
      updateCheckState !== UpdateCheckState.InProgress
    ) {
      setUpdateCheckState(UpdateCheckState.InProgress);
    } else if (
      !isChecking &&
      !isDownloading &&
      !isUpdateAvailable &&
      updateCheckState === UpdateCheckState.InProgress
    ) {
      setUpdateCheckState(UpdateCheckState.NoUpdateAvailable);
    } else if (
      lastCheckForUpdateTimeSinceRestart !== undefined &&
      updateCheckState === UpdateCheckState.Unknown
    ) {
      setUpdateCheckState(UpdateCheckState.NativeStateInitialized);
      return delayedStateUpdate(() => {
        // I have never entered this state but this is a good fallback in case we initialize state but somehow never end up
        // without any subsequent events firing. If nothing happens within 100ms of the original native event firing, then
        // we assume something is wrong and bail out
        setUpdateCheckState(UpdateCheckState.NoEventsAfterInitialized);
      }, 100);
    } else if (updateCheckState === UpdateCheckState.Unknown) {
      return delayedStateUpdate(() => {
        // This handles the case where we don't actually check for updates on launch, eg: after reloadAsync(), or if you
        // end up using this hook in an app that doesn't automatically check for updates on launch.
        setUpdateCheckState(UpdateCheckState.NoEventsAfterInitialized);
      }, 16);
    }
  }, [
    lastCheckForUpdateTimeSinceRestart,
    isChecking,
    isDownloading,
    isUpdatePending,
    isUpdateAvailable,
    updateCheckState,
    checkError,
    downloadError,
    downloadedUpdate,
  ]);

  useEffect(() => {
    return delayedStateUpdate(() => {
      setUpdateCheckState(UpdateCheckState.Timeout);
    }, options?.timeout ?? DEFAULT_TIMEOUT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return updateCheckState;
}

function delayedStateUpdate(fn: () => void, timeoutMs: number) {
  const timeoutId = setTimeout(fn, timeoutMs);

  return () => {
    clearTimeout(timeoutId);
  };
}
