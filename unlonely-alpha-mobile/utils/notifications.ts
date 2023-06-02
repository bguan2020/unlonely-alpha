import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Linking, Platform } from 'react-native';

const projectId = Constants.expoConfig.extra.eas.projectId;

export function initializeNotificationSettings() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function allowsNotificationsAsync() {
  const settings = await Notifications.getPermissionsAsync();
  return settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('Live', {
      name: 'Live',
      importance: Notifications.AndroidImportance.MAX, // maybe this should be MAX?? idk
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#ff0200',
      sound: 'live.wav',
    });

    await Notifications.setNotificationChannelAsync('NFC', {
      name: 'NFC',
      importance: Notifications.AndroidImportance.HIGH, // maybe this should be MAX?? idk
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#e6f88a',
      sound: 'nfc.wav',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    Linking.openSettings();
    return;
  }
  token = (
    await Notifications.getExpoPushTokenAsync({
      projectId,
    })
  ).data;

  return token;
}

export async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'local test notification',
      body: 'hello friend. tapping this notification should open up the channels tab.',
      sound: 'live.wav',
      data: { redirect: 'live' },
    },
    trigger: { seconds: 1, channelId: 'Live' },
  });
}
