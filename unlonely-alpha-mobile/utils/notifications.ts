import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { useAppSettingsStore } from './store';

export const useNotificationPermissions = async () => {
  const savePermissionsGrantedToStorage = useAppSettingsStore(state => state.grantNotificationPermissions);
  const [token, setToken] = useState(null);

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  const { status } = await Notifications.requestPermissionsAsync();
  const notificationsToken = await Notifications.getExpoPushTokenAsync();

  useEffect(() => {
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    setToken(notificationsToken.data);
    savePermissionsGrantedToStorage();
  }, [token]);

  return token;
};
