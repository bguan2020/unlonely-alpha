import { API_ENDPOINT } from '@env';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { CHANNEL_FEED_QUERY } from '../graphql/channels';
import { useIsFocused } from '@react-navigation/native';

export function useChannels() {
  const isFocused = useIsFocused();
  const refetchInterval = isFocused ? 2000 : false;

  return useQuery(
    ['getChannelFeed'],
    async () => {
      return request(API_ENDPOINT, CHANNEL_FEED_QUERY);
    },
    {
      refetchInterval,
    }
  );
}
