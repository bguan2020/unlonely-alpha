import { API_ENDPOINT } from '@env';
import { QueryClient } from '@tanstack/react-query';
import { GraphQLClient } from 'graphql-request';
import { useUserStore } from '../utils/store/userStore';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2 },
  },
});

export const useGqlClient = (): GraphQLClient => {
  const { userData, _hasHydrated } = useUserStore(z => ({
    userData: z.userData,
    _hasHydrated: z._hasHydrated,
  }));

  let headers: { 'x-auth-address'?: string; 'x-auth-signed-message'?: string };

  if (_hasHydrated && userData) {
    if (userData.address) {
      headers = {
        'x-auth-address': userData.address,
      };
    }

    if (userData.address && userData.signature) {
      headers = {
        'x-auth-address': userData.address,
        'x-auth-signed-message': userData.signature,
      };
    }
  }

  const gqlClient = new GraphQLClient(API_ENDPOINT, {
    headers,
  });

  return gqlClient;
};
