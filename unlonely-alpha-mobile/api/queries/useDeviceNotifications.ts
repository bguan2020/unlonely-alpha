import { API_ENDPOINT } from '@env';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { GET_NOTIFICATION_SETTINGS } from '../graphql/notifications';
import { useEffect, useState } from 'react';

export function useDeviceNotifications(key: string, params: { token: string }) {
  const hasToken = params?.token && params?.token?.includes('Token');
  const [shouldRun, setShouldRun] = useState(false);
  const { data, isLoading, error } = useQuery(
    [key],
    async () => {
      if (shouldRun) {
        console.log('[query] loading notifications for device...', params?.token);
        return request(API_ENDPOINT, GET_NOTIFICATION_SETTINGS, { data: params });
      }
    },
    { enabled: shouldRun }
  );

  useEffect(() => {
    setShouldRun(false);
  }, [shouldRun]);

  return {
    data,
    isLoading,
    error,
    run: () => {
      if (hasToken) {
        setShouldRun(true);
      }
    },
  };
}
