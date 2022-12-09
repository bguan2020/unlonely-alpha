import { API_ENDPOINT } from '@env';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import { HOSTEVENT_FEED_QUERY } from '../graphql/hostEvent';

export function useStreamingSchedule(params) {
  return useQuery(['HostEventFeed'], async () =>
    request(API_ENDPOINT, HOSTEVENT_FEED_QUERY, {
      data: params,
    })
  );
}
