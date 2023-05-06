import { NFC_FEED_QUERY } from './../graphql/nfc';
import { useQuery } from '@tanstack/react-query';
import { useGqlClient } from '../client';

export function useNfcFeed(key, params) {
  const gqlClient = useGqlClient();

  return useQuery([key], async () =>
    gqlClient.request(NFC_FEED_QUERY, {
      data: params,
    })
  );
}
