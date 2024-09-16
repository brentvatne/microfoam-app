import {
  AndroidImportance,
  Notification,
  NotificationChannel,
  NotificationResponse,
  Subscription,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  getExpoPushTokenAsync,
  getDevicePushTokenAsync,
  getLastNotificationResponseAsync,
  getPermissionsAsync,
  getNotificationChannelsAsync,
  removeNotificationSubscription,
  requestPermissionsAsync,
  scheduleNotificationAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
  useLastNotificationResponse,
  addPushTokenListener,
  NotificationContentAndroid,
  YearlyNotificationTrigger,
  YearlyTriggerInput,
  TimeIntervalTriggerInput,
  getAllScheduledNotificationsAsync,
} from "expo-notifications";
import Constants from "expo-constants";
import { isDevice } from "expo-device";
import { defineTask } from "expo-task-manager";
import { useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { View, Text } from "./Themed";
import Button from "./Button";
import { router } from "expo-router";
import { sub } from "date-fns";

/**
 * Initializes notification handling
 * Should be called at the beginning of the root layout
 * Optionally gets and listens for user taps on notifications to open different
 * routes in the app
 *
 * @param routeOnResponses If true, sets up response routing
 */
export function useNotificationObserverInRootLayout(routeOnResponses: boolean) {
  const responseListener = useRef<Subscription>();
  usePushToken();
  useEffect(() => {
    let isMounted = true;

    setNotificationHandler({
      handleNotification: async (notification) => {
        console.log({
          handleNotification: JSON.stringify(notification),
        });
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        };
      },
      handleSuccess: (id) => {
        console.log(`Notification handled successfully: ${id}`);
      },
    });

    if (routeOnResponses) {
      function redirect(notification: Notification) {
        const url = notification.request.content.data?.url;
        if (url) {
          router.push(url);
        }
      }

      getLastNotificationResponseAsync().then((response) => {
        if (!isMounted || !response?.notification) {
          return;
        }
        redirect(response?.notification);
      });

      const subscription = addNotificationResponseReceivedListener(
        (response) => {
          redirect(response.notification);
        }
      );
      responseListener.current = subscription;
    }

    return () => {
      isMounted = false;
      responseListener.current?.remove();
      responseListener.current = undefined;
    };
  }, []);
}

const STORAGE_KEY = "@notification_bg_store";

// Background task
// https://github.com/expo/expo/tree/main/packages/expo-notifications#handling-incoming-notifications-when-the-app-is-not-in-the-foreground-not-supported-in-expo-go
const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";
defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data, error }) => {
  console.log(
    `${Platform.OS} BACKGROUND-NOTIFICATION-TASK: App in ${AppState.currentState} state.`
  );

  if (error) {
    console.log(
      `${Platform.OS} BACKGROUND-NOTIFICATION-TASK: Error! ${JSON.stringify(
        error
      )}`
    );

    return;
  }

  AsyncStorage.setItem(
    STORAGE_KEY,
    `Background trigger: ${AppState.isAvailable} ${
      AppState.currentState
    } ${JSON.stringify(data)}`
  );

  // data.notification.data.data = JSON.parse(data.notification.data.body);
  // data.notification.data.body = data.notification.data.message;
  // setNotification(data.notification);
});
import { Image } from "expo-image";
export const Notifier = () => {
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notification | undefined>(
    undefined
  );
  const [response, setResponse] = useState<NotificationResponse | undefined>(
    undefined
  );
  const [scheduledNotificationIdentifier, setScheduledNotificationIdentifier] =
    useState("");

  const [scheduledNotificationsText, setScheduledNotificationsText] =
    useState("");

  const [responseFromAsync, setResponseFromAsync] = useState<
    NotificationResponse | undefined
  >(undefined);

  const [backgroundTaskString, setBackgroundTaskString] = useState<string>("");

  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  const lastResponse = useLastNotificationResponse();

  const { expoPushToken, devicePushToken } = usePushToken();

  useEffect(() => {
    if (Platform.OS === "android") {
      setNotificationChannelAsync("testAppWithSound2", {
        name: "testAppWithSound",
        importance: AndroidImportance.HIGH,
        sound: "pop_sound.wav",
        enableVibrate: true,
        vibrationPattern: [0, 3000, 250, 250],
      })
        .then((value) => {
          console.log(`Set channel ${JSON.stringify(value, null, 2)}`);
          getNotificationChannelsAsync().then((value) =>
            setChannels(value ?? [])
          );
        })
        .catch((error) => {
          console.log(`Error in setting channel: ${error}`);
        });
    }

    /*
    notificationListener.current = addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
        console.log(
          `${Platform.OS} saw notification ${JSON.stringify(
            notification,
            null,
            2,
          )}`,
        );
      },
    );

    responseListener.current = addNotificationResponseReceivedListener(
      (response) => {
        setResponse(response);
        console.log(
          `${Platform.OS} saw response for ${JSON.stringify(
            response,
            null,
            2,
          )}`,
        );
      },
    );

    console.log(`${Platform.OS} added listeners`);
     */

    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        console.log(`Retrieved value for STORAGE_KEY: ${value}`);
        setBackgroundTaskString(value);
      })
      .catch((reason) => {
        console.log(`Error retrieving value for STORAGE_KEY: ${reason}`);
        setBackgroundTaskString(reason);
      });

    return () => {
      console.log(`${Platform.OS} removed listeners`);
      notificationListener.current &&
        removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View>
      <Text>Your expo push token:</Text>
      <Text selectable style={{ color: "blue" }}>
        {expoPushToken}
      </Text>

      <Text>Your device push token</Text>
      <Text selectable style={{ color: "blue" }}>
        {devicePushToken}
      </Text>
      <Text>{`Channels: ${JSON.stringify(
        channels.map((c: { id: string }) => c.id),
        null,
        2
      )}`}</Text>
      <View>
        <Text>
          Title: {notification && notification.request.content.title}{" "}
        </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>
          Vibration:{" "}
          {notification &&
            JSON.stringify(
              (notification.request.content as NotificationContentAndroid)
                .vibrationPattern ?? "null"
            )}
        </Text>
        <Text>
          Data:{" "}
          {notification && JSON.stringify(notification.request.content.data)}
        </Text>
        <Text>
          Response received for:{" "}
          {response && response.notification.request.content.title}
        </Text>
        <Text>
          Last response:{" "}
          {lastResponse && lastResponse.notification.request.content.title}
        </Text>
        <Text>
          Last response data:{" "}
          {lastResponse &&
            JSON.stringify(
              lastResponse.notification.request.content.data,
              null,
              2
            )}
        </Text>
        <Text>
          Last response data from getLastNotificationResponseAsync:{" "}
          {responseFromAsync &&
            JSON.stringify(
              responseFromAsync.notification.request.content.data,
              null,
              2
            )}
        </Text>
        <Text>
          Schedule notification result string: {scheduledNotificationIdentifier}
        </Text>
        <Text>All scheduled notifications: {scheduledNotificationsText}</Text>
        <Text>Background task data: {backgroundTaskString}</Text>
        <Button
          title="getLastNotificationResponseAsync()"
          onPress={() => {
            getLastNotificationResponseAsync()
              .then((lastResponse) => {
                console.log(
                  `lastResponse = ${JSON.stringify(lastResponse, null, 2)}`
                );
                setResponseFromAsync(lastResponse);
              })
              .catch((error) => setResponseFromAsync(error));
          }}
        />
        <Button
          title="getAllScheduledNotificationsAsync()"
          onPress={() => {
            getAllScheduledNotificationsAsync()
              .then((notificationRequests) => {
                const text = JSON.stringify(notificationRequests, null, 2);
                console.log(`scheduledNotificationRequests = ${text}`);
                setScheduledNotificationsText(text);
              })
              .catch((error) => setScheduledNotificationsText(error));
          }}
        />
        <Button
          title="Schedule time interval notification in 2 seconds"
          onPress={() => {
            schedulePushNotificationIn2Seconds().then((result) =>
              setScheduledNotificationIdentifier(result)
            );
          }}
        />
        <Button
          title="Schedule yearly notification starting in the next minute"
          onPress={() => {
            schedulePushNotificationYearly().then((result) =>
              setScheduledNotificationIdentifier(result)
            );
          }}
        />
      </View>
    </View>
  );
};

function usePushToken() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(
    undefined
  );
  const [devicePushToken, setDevicePushToken] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (!expoPushToken) {
      registerForPushNotificationsAsync()
        .then((token) => {
          setExpoPushToken(token);
        })
        .catch((error) => {
          console.error(error);
          setExpoPushToken("error");
        });
    }
    if (expoPushToken) {
      if (!devicePushToken) {
        getDevicePushTokenAsync().then((token) => {
          const tokenString = JSON.stringify(token);
          console.log(tokenString);
          setDevicePushToken(tokenString);
        });
      }
      if (Platform.OS === "android") {
        const subscription = addPushTokenListener((token) => {
          setExpoPushToken(token as unknown as string);
        });
        return () => {
          subscription.remove();
        };
      }
    }
  }, [expoPushToken, devicePushToken]);

  return {
    expoPushToken,
    devicePushToken,
  };
}

async function registerForPushNotificationsAsync() {
  let token: string;

  if (Platform.OS === "android") {
    await setNotificationChannelAsync("default", {
      name: "default",
      importance: AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (isDevice) {
    const { status: existingStatus } = await getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // Here we use EAS projectId
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error("Project ID not found");
      }
      token = (
        await getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}

const schedulePushNotificationIn2Seconds: () => Promise<string> = async () => {
  const date = new Date();
  const trigger: TimeIntervalTriggerInput = {
    seconds: 2,
    repeats: false,
  };
  try {
    return await scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: `Time interval notification scheduled ${date.toLocaleString()}`,
        data: { data: "goes here", test: { test1: "more data" } },
        // channelId: "testAppWithSound",
      },
      trigger,
    });
  } catch (e) {
    return `Error scheduling notification: ${e}`;
  }
};
const schedulePushNotificationYearly: () => Promise<string> = async () => {
  const date = new Date();
  const trigger: YearlyTriggerInput = {
    day: date.getDate(),
    month: date.getMonth(),
    hour: date.getHours(),
    minute: date.getMinutes() + 1,
    repeats: true,
  };
  try {
    return await scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: `Yearly notification scheduled ${date.toLocaleString()}`,
        data: { data: "goes here", test: { test1: "more data" } },
      },
      trigger,
    });
  } catch (e) {
    return `Error scheduling notification: ${e}`;
  }
};
