import { useMutation } from '@tanstack/react-query';
import { useGqlClient } from '../client';
import { UPDATE_NOTIFICATION_SETTINGS } from '../graphql/notifications';

type DeviceNotifications = {
  token: string;
  notificationsLive?: boolean;
  notificationsNFCs?: boolean;
  address?: string;
};

export const useUpdateNotificationSettings = () => {
  const gqlClient = useGqlClient();

  const mutate = useMutation((params: DeviceNotifications) => {
    console.log('🥕 ----- updating notifications -----');
    return gqlClient.request(UPDATE_NOTIFICATION_SETTINGS, {
      data: params,
    });
  });

  return mutate;
};
