import { API_ENDPOINT } from '@env';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { useEffect, useState } from 'react';
import { USER_QUERY } from '../graphql/user';

export function useUser(key: string, params: { address: string }) {
  const hasAddress = params?.address !== 'user';
  const [shouldRun, setShouldRun] = useState(false);
  const { data, isLoading, error } = useQuery(
    [key],
    async () => {
      if (shouldRun) {
        console.log('[query] useUser grabbing user data right now...', params);
        return request(API_ENDPOINT, USER_QUERY, { data: params });
      }
    },
    { enabled: shouldRun, staleTime: 3000 }
  );

  useEffect(() => {
    setShouldRun(false);
  }, [shouldRun]);

  return {
    data,
    isLoading,
    error,
    run: () => {
      if (hasAddress) {
        setShouldRun(true);
      }
    },
  };
}
