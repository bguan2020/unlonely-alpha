import { gql, useLazyQuery } from "@apollo/client";
import { useAccount, useSignMessage } from "wagmi";
import { useCallback } from "react";

import {
  FetchAuthMessageQuery,
  FetchCurrentUserQuery,
} from "../generated/graphql";

const FETCH_AUTH_MESSAGE_QUERY = gql`
  query FetchAuthMessage {
    currentUserAuthMessage
  }
`;

const FETCH_CURRENT_USER_QUERY = gql`
  query FetchCurrentUser {
    currentUser {
      signature
      sigTimestamp
    }
  }
`;

export const useAuthData = (): {
  getAuthData: () => Promise<
    | { signedMessage: string; error: undefined }
    | { signedMessage: undefined; error: any }
  >;
} => {
  const [{ data }] = useAccount();
  const address = data?.address;
  const [getUser] = useLazyQuery<FetchCurrentUserQuery>(
    FETCH_CURRENT_USER_QUERY
  );
  const [getAuthMessage] = useLazyQuery<FetchAuthMessageQuery>(
    FETCH_AUTH_MESSAGE_QUERY
  );
  const [_, signMessage] = useSignMessage();

  const getAuthData = useCallback(() => {
    const fetchAndSignMessage = async () => {
      if (!address) {
        throw new Error(
          "Tried to use an authenticated action before an address was available"
        );
      }

      const userResponse = await getUser();
      const signature = userResponse.data?.currentUser?.signature;
 
      if (signature) {
        return { signedMessage: signature };
      }

      // 1. Fetch the message with timestamp
      const gqlResponse = await getAuthMessage();

      if (gqlResponse.error) {
        return { error: gqlResponse.error };
      }
      if (!gqlResponse.data || !gqlResponse.data.currentUserAuthMessage) {
        return { error: { message: "No data returned for user" } };
      }

      const message = gqlResponse.data.currentUserAuthMessage;

      // // 2. Sign the message
      const signerResponse = await signMessage({ message });

      if (signerResponse.error) {
        return { error: { message: "Failed to sign message" } };
      }

      const signedMessage = signerResponse.data;

      // 3. Return the data needed
      return {
        signedMessage,
      };
    };

    return fetchAndSignMessage();
  }, [address, getAuthMessage, signMessage]);

  return { getAuthData };
};
