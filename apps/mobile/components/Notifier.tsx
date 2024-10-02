import {
  AndroidNotificationVisibility,
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
  getAllScheduledNotificationsAsync,
  cancelAllScheduledNotificationsAsync,
  registerTaskAsync,
  getPresentedNotificationsAsync,
  CalendarTriggerTypes,
  clearLastNotificationResponseAsync,
} from 'expo-notifications';
import Constants from 'expo-constants';
import { isDevice } from 'expo-device';
import { defineTask } from 'expo-task-manager';
import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { View, Text } from './Themed';
import Button from './Button';
import { router } from 'expo-router';

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
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
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
        },
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

const STORAGE_KEY = '@notification_bg_store';

// Background task
// https://github.com/expo/expo/tree/main/packages/expo-notifications#handling-incoming-notifications-when-the-app-is-not-in-the-foreground-not-supported-in-expo-go
const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';
defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data, error }) => {
  console.log(
    `${Platform.OS} BACKGROUND-NOTIFICATION-TASK: App in ${AppState.currentState} state.`,
  );

  if (error) {
    console.log(
      `${Platform.OS} BACKGROUND-NOTIFICATION-TASK: Error! ${JSON.stringify(
        error,
      )}`,
    );

    return;
  }

  AsyncStorage.setItem(
    STORAGE_KEY,
    `Background trigger: ${AppState.isAvailable} ${
      AppState.currentState
    } ${JSON.stringify(data)}`,
  );
});

registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

export const Notifier = () => {
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notification | undefined>(
    undefined,
  );
  const [response, setResponse] = useState<NotificationResponse | undefined>(
    undefined,
  );
  const [scheduledNotificationIdentifier, setScheduledNotificationIdentifier] =
    useState('');

  const [scheduledNotificationsText, setScheduledNotificationsText] =
    useState('');

  const [presentedNotificationsText, setPresentedNotificationsText] =
    useState('');

  const [responseFromAsync, setResponseFromAsync] = useState<
    NotificationResponse | undefined
  >(undefined);

  const [backgroundTaskString, setBackgroundTaskString] = useState<string>('');

  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  const lastResponse = useLastNotificationResponse();

  const { expoPushToken, devicePushToken } = usePushToken();

  const retrieveBackgroundData = () => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        console.log(`Retrieved value for STORAGE_KEY: ${value}`);
        setBackgroundTaskString(value);
      })
      .catch((reason) => {
        console.log(`Error retrieving value for STORAGE_KEY: ${reason}`);
        setBackgroundTaskString(reason);
      });
  };

  useEffect(() => {
    setNotificationChannel().then((channels) => {
      setChannels(channels);
    });

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

    retrieveBackgroundData();

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
      <Text>Your expo push token: {expoPushToken}</Text>
      <Text>Your device push token: {devicePushToken}</Text>
      <Text>{`Channels: ${JSON.stringify(
        channels.map((c: { id: string }) => c.id),
        null,
        2,
      )}`}</Text>
      <View>
        <Text>
          Title: {notification && notification.request.content.title}{' '}
        </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>
          Vibration:{' '}
          {notification &&
            JSON.stringify(
              (notification.request.content as NotificationContentAndroid)
                .vibrationPattern ?? 'null',
            )}
        </Text>
        <Text>
          Data:{' '}
          {notification && JSON.stringify(notification.request.content.data)}
        </Text>
        <Text>
          Response received for:{' '}
          {response && response.notification.request.content.title}
        </Text>
        <Text>
          Last response:{' '}
          {lastResponse && lastResponse.notification.request.content.title}
        </Text>
        <Text>
          Last response data:{' '}
          {lastResponse &&
            JSON.stringify(
              lastResponse.notification.request.content.data,
              null,
              2,
            )}
        </Text>
        <Text>
          Last response data from getLastNotificationResponseAsync:{' '}
          {responseFromAsync &&
            JSON.stringify(
              responseFromAsync.notification.request.content.data,
              null,
              2,
            )}
        </Text>
        <Text>
          Schedule notification result string: {scheduledNotificationIdentifier}
        </Text>
        <Text>All scheduled notifications: {scheduledNotificationsText}</Text>
        <Text>All presented notifications: {presentedNotificationsText}</Text>
        <Text>Background task data: {backgroundTaskString}</Text>
        <Button
          title="getLastNotificationResponseAsync()"
          onPress={() => {
            getLastNotificationResponseAsync()
              .then((lastResponse) => {
                console.log(
                  `lastResponse = ${JSON.stringify(lastResponse, null, 2)}`,
                );
                setResponseFromAsync(lastResponse);
              })
              .catch((error) => setResponseFromAsync(error));
          }}
        />
        <Button
          title="clearLastNotificationResponseAsync()"
          onPress={() => {
            clearLastNotificationResponseAsync()
              .then(() => {
                setResponseFromAsync(undefined);
                console.log(`Successfully cleared last response`);
              })
              .catch((error) => setResponseFromAsync(error));
          }}
        />
        <Button
          title="retrieveBackgroundData()"
          onPress={() => retrieveBackgroundData()}
        />
        <Button
          title="clearBackgroundData()"
          onPress={() => setBackgroundTaskString('')}
        />
        <Button
          title="getPresentedNotificationsAsync()"
          onPress={() => {
            getPresentedNotificationsAsync()
              .then((presentedNotifications) => {
                const text = JSON.stringify(presentedNotifications, null, 2);
                console.log(`presentedNotifications = ${text}`);
                setPresentedNotificationsText(text);
              })
              .catch((error) => setPresentedNotificationsText(error));
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
          title="cancelAllScheduledNotificationsAsync()"
          onPress={() => {
            cancelAllScheduledNotificationsAsync()
              .then(() => {
                setScheduledNotificationsText(
                  'All scheduled notifications canceled',
                );
              })
              .catch((error) => setScheduledNotificationsText(error));
          }}
        />
        <Button
          title="Schedule time interval notification in 2 seconds"
          onPress={() => {
            schedulePushNotificationIn2Seconds().then((result) =>
              setScheduledNotificationIdentifier(result),
            );
          }}
        />
        <Button
          title="Schedule calendar notification starting in the next minute"
          onPress={() => {
            scheduleCalendarNotification().then((result) =>
              setScheduledNotificationIdentifier(result),
            );
          }}
        />
        <Button
          title="Schedule yearly notification starting in the next minute"
          onPress={() => {
            schedulePushNotificationYearly().then((result) =>
              setScheduledNotificationIdentifier(result),
            );
          }}
        />
        <Button
          title="Schedule weekly notification starting in the next minute"
          onPress={() => {
            schedulePushNotificationWeekly().then((result) =>
              setScheduledNotificationIdentifier(result),
            );
          }}
        />
        <Button
          title="Schedule daily notification starting in the next minute"
          onPress={() => {
            schedulePushNotificationDaily().then((result) =>
              setScheduledNotificationIdentifier(result),
            );
          }}
        />
        <Button
          title="Schedule notification with null trigger"
          onPress={() => {
            schedulePushNotificationWithNullTrigger().then((result) =>
              setScheduledNotificationIdentifier(result),
            );
          }}
        />
        <Button
          title="Clear background data storage"
          onPress={() => {
            AsyncStorage.removeItem(STORAGE_KEY)
              .then(() => setBackgroundTaskString('Async storage removed'))
              .catch((reason) => {
                console.log(`Error removing value for STORAGE_KEY: ${reason}`);
                setBackgroundTaskString(reason);
              });
          }}
        />
      </View>
    </View>
  );
};

function usePushToken() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(
    undefined,
  );
  const [devicePushToken, setDevicePushToken] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!expoPushToken) {
      registerForPushNotificationsAsync()
        .then((token) => {
          setExpoPushToken(token);
        })
        .catch((error) => {
          console.error(error);
          setExpoPushToken('error');
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
      if (Platform.OS === 'android') {
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

async function setNotificationChannel(): Promise<NotificationChannel[]> {
  try {
    if (Platform.OS === 'android') {
      const value = await setNotificationChannelAsync('testApp', {
        name: 'testApp',
        importance: AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        enableLights: true,
        enableVibrate: true,
        lockscreenVisibility: AndroidNotificationVisibility.PUBLIC,
      });
      console.log(`Set channel ${value.name}`);
      return await getNotificationChannelsAsync();
    }
  } catch (e) {
    console.log(`Error in setNotificationChannel(): ${e}`);
  }
  return [];
}

async function registerForPushNotificationsAsync() {
  let token: string;

  if (isDevice) {
    const { status: existingStatus } = await getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
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
        throw new Error('Project ID not found');
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
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

const schedulePushNotificationIn2Seconds: () => Promise<string> = async () => {
  const date = new Date();
  const trigger = {
    type: CalendarTriggerTypes.TIME_INTERVAL,
    seconds: 2,
    repeats: false,
  };
  try {
    return await scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: `Time interval notification scheduled ${date.toLocaleString()}`,
        data: { data: 'goes here', test: { test1: 'more data' } },
      },
      trigger,
    });
  } catch (e) {
    return `Error scheduling notification: ${e}`;
  }
};
const schedulePushNotificationYearly: () => Promise<string> = async () => {
  const date = new Date();
  const trigger = {
    type: CalendarTriggerTypes.YEARLY,
    channelId: 'testApp',
    day: date.getDate(),
    month: date.getMonth(),
    hour: date.getHours(),
    minute: date.getMinutes() + 1,
  };
  try {
    return await scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: `Yearly notification scheduled ${date.toLocaleString()}`,
        data: { data: 'goes here', test: { test1: 'more data' } },
      },
      trigger,
    });
  } catch (e) {
    return `Error scheduling notification: ${e}`;
  }
};
const schedulePushNotificationWeekly: () => Promise<string> = async () => {
  const date = new Date();
  const trigger = {
    type: CalendarTriggerTypes.WEEKLY,
    channelId: 'testApp',
    weekday: date.getDay() + 1,
    hour: date.getHours(),
    minute: date.getMinutes() + 1,
  };
  try {
    return await scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: `Weekly notification scheduled ${date.toLocaleString()}`,
        data: { data: 'goes here', test: { test1: 'more data' } },
      },
      trigger,
    });
  } catch (e) {
    return `Error scheduling notification: ${e}`;
  }
};
const schedulePushNotificationDaily: () => Promise<string> = async () => {
  const date = new Date();
  const trigger = {
    type: CalendarTriggerTypes.DAILY,
    channelId: 'testApp',
    hour: date.getHours(),
    minute: date.getMinutes() + 1,
  };
  try {
    return await scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: `Daily notification scheduled ${date.toLocaleString()}`,
        data: { data: 'goes here', test: { test1: 'more data' } },
      },
      trigger,
    });
  } catch (e) {
    return `Error scheduling notification: ${e}`;
  }
};
const scheduleCalendarNotification: () => Promise<string> = async () => {
  const date = new Date();
  const trigger = {
    type: CalendarTriggerTypes.CALENDAR,
    channelId: 'testApp',
    weekday: date.getDay(),
    hour: date.getHours(),
    minute: date.getMinutes() + 1,
    repeats: false,
  };
  try {
    return await scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: `Calendar notification scheduled ${date.toLocaleString()}`,
        data: { data: 'goes here', test: { test1: 'more data' } },
      },
      trigger,
    });
  } catch (e) {
    return `Error scheduling notification: ${e}`;
  }
};
const schedulePushNotificationWithNullTrigger: () => Promise<string> =
  async () => {
    const date = new Date();
    try {
      return await scheduleNotificationAsync({
        content: {
          title: "You've got mail! 📬",
          body: `Yearly notification scheduled ${date.toLocaleString()}`,
          data: { data: 'goes here', test: { test1: 'more data' } },
        },
        trigger: null,
      });
    } catch (e) {
      return `Error scheduling notification: ${e}`;
    }
  };
