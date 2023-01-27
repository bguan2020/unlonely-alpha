import { focusManager } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

export function useAppState() {
  const subscription = AppState.addEventListener('change', appState => {
    if (appState !== 'active') {
      return;
    }
    if (Platform.OS !== 'web') {
      focusManager.setFocused(appState === 'active');
    }

    subscription.remove();
  });
}
