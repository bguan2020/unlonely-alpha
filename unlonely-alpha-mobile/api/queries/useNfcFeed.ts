import { API_ENDPOINT } from '@env';
import { NFC_FEED_QUERY } from './../graphql/nfc';
import { useQuery } from '@tanstack/react-query';
import request from 'graphql-request';

export function useNfcFeed(key, params) {
  return useQuery([key], async () =>
    request(API_ENDPOINT, NFC_FEED_QUERY, {
      data: params,
    })
  );
}
