import {
  AndroidImportance,
  Notification,
  NotificationChannel,
  NotificationResponse,
  Subscription,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  getExpoPushTokenAsync,
  getPermissionsAsync,
  getNotificationChannelsAsync,
  removeNotificationSubscription,
  requestPermissionsAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
  useLastNotificationResponse,
} from 'expo-notifications';
import Constants from 'expo-constants';
import { isDevice } from 'expo-device';
import { defineTask } from 'expo-task-manager';
import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { View, Text } from './Themed';

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

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

  if (AppState.currentState.match(/inactive|background/) === null) {
    console.log(
      `${Platform.OS} BACKGROUND-NOTIFICATION-TASK: App not in background state, skipping task.`,
    );

    return;
  }

  console.log(
    `${
      Platform.OS
    } BACKGROUND-NOTIFICATION-TASK: Received a notification in the background! ${JSON.stringify(
      data,
      null,
      2,
    )}`,
  );

  // data.notification.data.data = JSON.parse(data.notification.data.body);
  // data.notification.data.body = data.notification.data.message;
  // setNotification(data.notification);
});

const Notifier = () => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notification | undefined>(
    undefined,
  );
  const [response, setResponse] = useState<NotificationResponse | undefined>(
    undefined,
  );

  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  const lastResponse = useLastNotificationResponse();

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => token && setExpoPushToken(token),
    );

    if (Platform.OS === 'android') {
      setNotificationChannelAsync('Miscellaneous', {
        name: 'Miscellaneous',
        importance: AndroidImportance.HIGH,
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
          `${Platform.OS} saw notification ${notification.request.content.title}`,
        );
      },
    );

    responseListener.current = addNotificationResponseReceivedListener(
      (response) => {
        setResponse(response);
        console.log(
          `${Platform.OS} saw response for ${response.notification.request.content.title}`,
        );
      },
    );

    console.log(`${Platform.OS} added listeners`);

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
      </View>
    </View>
  );
};

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
