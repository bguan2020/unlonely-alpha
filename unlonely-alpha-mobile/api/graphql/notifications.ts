import { gql } from 'graphql-request';

export const NOTIFICATIONS_UPDATE = gql`
  mutation updateUserNotifications($data: UpdateUserNotificationsInput!) {
    updateUserNotifications(data: $data) {
      notificationsTokens
      notificationsLive
      notificationsNFCs
    }
  }
`;
