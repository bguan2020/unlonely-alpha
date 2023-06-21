import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../../apiClient/hooks";
import {
  CreateCreatorTokenMutation,
  CreateCreatorTokenMutationVariables,
} from "../../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const CREATE_CREATOR_TOKEN_MUTATION = gql`
  mutation CreateCreatorToken($data: CreateCreatorTokenInput!) {
    createCreatorToken(data: $data) {
      id
    }
  }
`;

const useCreateCreatorToken = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    CreateCreatorTokenMutation,
    CreateCreatorTokenMutationVariables
  >(CREATE_CREATOR_TOKEN_MUTATION);

  const createCreatorToken = useCallback(
    async (data) => {
      setLoading(true);
      const mutationResult = await mutate({
        variables: {
          data: {
            address: data.address,
            symbol: data.symbol,
            name: data.name,
            price: data.price,
            channelId: data.channelId,
          },
        },
      });

      const res = mutationResult?.data?.createCreatorToken;
      /* eslint-disable no-console */
      if (res) {
        console.log("success");
      } else {
        onError && onError();
      }
      setLoading(false);
      return {
        res,
      };
    },
    [mutate, onError]
  );

  return { createCreatorToken, loading };
};

export default useCreateCreatorToken;
