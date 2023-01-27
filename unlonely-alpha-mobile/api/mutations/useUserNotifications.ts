import { NOTIFICATIONS_UPDATE } from '../graphql/notifications';
import { useMutation } from '@tanstack/react-query';
import { useUserStore } from '../../utils/store/userStore';
import { useGqlClient } from '../client';

type UserNotificationSettingsType = {
  notificationsTokens?: string;
  notificationsLive?: boolean;
  notificationsNFCs?: boolean;
};

export const useUserNotifications = () => {
  const gqlClient = useGqlClient();
  const { userData, _hasHydrated } = useUserStore(z => ({
    userData: z.userData,
    _hasHydrated: z._hasHydrated,
  }));

  const mutate = useMutation((params: UserNotificationSettingsType) => {
    if (params && userData && _hasHydrated) {
      console.log('🥕 ----- mutating notifications -----');
      return gqlClient.request(NOTIFICATIONS_UPDATE, {
        data: params,
      });
    }
  });

  return mutate;
};
