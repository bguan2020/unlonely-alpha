import { AppStateStatus, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider, focusManager } from 'react-query';

export const queryClient = new QueryClient();

export function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}
