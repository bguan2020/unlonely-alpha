import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const projectId = Constants.expoConfig.extra.eas.projectId;

export function initializeNotificationSettings() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
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

  // if (Platform.OS === 'android') {
  //   await Notifications.setNotificationChannelAsync('default', {
  //     name: 'default',
  //     importance: Notifications.AndroidImportance.MAX,
  //     vibrationPattern: [0, 250, 250, 250],
  //     lightColor: '#FF231F7C',
  //   });
  // }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
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
      body: 'hello friend. welcome to unlonely developer settings.',
      data: { data: '$BRIAN' },
    },
    trigger: { seconds: 1 },
  });
}
