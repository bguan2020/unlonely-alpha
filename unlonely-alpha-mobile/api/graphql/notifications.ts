import { gql } from 'graphql-request';

export const GET_NOTIFICATION_SETTINGS = gql`
  query GetDeviceByToken($data: GetDeviceByTokenInput!) {
    getDeviceByToken(data: $data) {
      token
      notificationsLive
      notificationsNFCs
    }
  }
`;

export const CREATE_NOTIFICATION_SETTINGS = gql`
  mutation createNotificationSettings($data: PostDeviceTokenInput!) {
    postDeviceToken(data: $data) {
      token
      notificationsLive
      notificationsNFCs
      address
    }
  }
`;

export const UPDATE_NOTIFICATION_SETTINGS = gql`
  mutation updateNotificationSettings($data: UpdateDeviceInput!) {
    updateDeviceToken(data: $data) {
      token
      notificationsLive
      notificationsNFCs
    }
  }
`;
