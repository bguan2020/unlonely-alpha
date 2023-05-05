import { useMutation } from '@tanstack/react-query';
import { useGqlClient } from '../client';
import { CREATE_NOTIFICATION_SETTINGS } from '../graphql/notifications';

type DeviceNotifications = {
  token: string;
  notificationsLive?: boolean;
  notificationsNFCs?: boolean;
  address?: string;
};

export const useCreateNotificationSettings = () => {
  const gqlClient = useGqlClient();

  const mutate = useMutation((params: DeviceNotifications) => {
    console.log('🥕 ----- creating notifications -----');
    return gqlClient.request(CREATE_NOTIFICATION_SETTINGS, {
      data: params,
    });
  });

  return mutate;
};
