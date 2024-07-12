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
  setNotificationChannelAsync,
  setNotificationHandler,
  useLastNotificationResponse,
  addPushTokenListener,
  NotificationContentAndroid,
} from 'expo-notifications';
import Constants from 'expo-constants';
import { isDevice } from 'expo-device';
import { defineTask } from 'expo-task-manager';
import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { View, Text } from './Themed';
import Button from './Button';

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

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

  // data.notification.data.data = JSON.parse(data.notification.data.body);
  // data.notification.data.body = data.notification.data.message;
  // setNotification(data.notification);
});

const Notifier = () => {
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notification | undefined>(
    undefined,
  );
  const [response, setResponse] = useState<NotificationResponse | undefined>(
    undefined,
  );

  const [responseFromAsync, setResponseFromAsync] = useState<
    NotificationResponse | undefined
  >(undefined);

  const [backgroundTaskString, setBackgroundTaskString] = useState<string>('');

  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  const lastResponse = useLastNotificationResponse();

  const { expoPushToken, devicePushToken } = usePushToken();

  useEffect(() => {
    if (Platform.OS === 'android') {
      setNotificationChannelAsync('testApp', {
        name: 'testApp',
        importance: AndroidImportance.HIGH,
        enableVibrate: true,
        vibrationPattern: [0, 250, 250, 250],
      })
        .then((value) => {
          console.log(`Set channel ${value.name}`);
          getNotificationChannelsAsync().then((value) =>
            setChannels(value ?? []),
          );
        })
        .catch((error) => {
          console.log(`Error in setting channel: ${error}`);
        });
    }

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
        <Text>Background task data: {backgroundTaskString}</Text>
        <Button
          title="getLastNotificationResponseAsync()"
          onPress={() => {
            getLastNotificationResponseAsync()
              .then((lastResponse) => setResponseFromAsync(lastResponse))
              .catch((error) => setResponseFromAsync(error));
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

async function registerForPushNotificationsAsync() {
  let token: string;

  if (Platform.OS === 'android') {
    await setNotificationChannelAsync('default', {
      name: 'default',
      importance: AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

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

export default Notifier;
