import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export const useUserCredentials = () => {
  const [userCredentials, setUserCredentials] = useState(null);

  const storeCredentials = async value => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('unlonely-mobile-user', jsonValue);
      setUserCredentials(value);
    } catch (e) {
      // saving error
      console.error('Error saving user credentials to storage', e);
    }
  };

  const readCredentials = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('unlonely-mobile-user');
      setUserCredentials(jsonValue != null ? JSON.parse(jsonValue) : null);
    } catch (e) {
      // error reading value
      console.error('Error reading user credentials from storage', e);
    }
  };

  useEffect(() => {
    readCredentials();
  }, []);

  useEffect(() => {
    if (userCredentials === 'wallet_disconnected') {
      storeCredentials(null);
    }
  }, [userCredentials]);

  return { userCredentials, storeCredentials };
};
