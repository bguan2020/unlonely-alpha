import { API_ENDPOINT } from '@env';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { CHANNEL_FEED_QUERY } from '../graphql/channels';

export function useChannels(params) {
  return useQuery(['getChannelFeed'], async () =>
    request(API_ENDPOINT, CHANNEL_FEED_QUERY, {
      data: params,
    })
  );
}
