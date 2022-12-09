import { Platform } from 'react-native';
import type { AppStateStatus } from 'react-native';
import { QueryClient, focusManager } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2 },
  },
});
