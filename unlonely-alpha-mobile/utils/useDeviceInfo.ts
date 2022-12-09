import { useState, useEffect } from 'react';
import * as Device from 'expo-device';

export const useDeviceInfo = () => {
  const [iOS, setiOS] = useState(false);
  const [Android, setAndroid] = useState(false);

  useEffect(() => {
    if (Device.osName === 'iOS') {
      setiOS(true);
    } else if (Device.osName === 'Android') {
      setAndroid(true);
    }
  }, []);

  return { iOS, Android };
};
