import { useState, useEffect } from 'react';
import * as Device from 'expo-device';

export const useDeviceInfo = () => {
  const [deviceiOS, setiOS] = useState(false);
  const [deviceAndroid, setAndroid] = useState(false);

  useEffect(() => {
    if (Device.osName === 'iOS') {
      setiOS(true);
    } else if (Device.osName === 'Android') {
      setAndroid(true);
    }
  }, []);

  return { deviceiOS, deviceAndroid };
};
