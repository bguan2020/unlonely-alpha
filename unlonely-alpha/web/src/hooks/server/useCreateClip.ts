import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  CreateClipMutation,
  CreateClipMutationVariables,
} from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const CREATE_CLIP = gql`
  mutation CreateClip($data: CreateClipInput!) {
    createClip(data: $data) {
      url
      thumbnail
      errorMessage
      id
    }
  }
`;

const useCreateClip = ({ onError }: Props) => {
  const [mutate] = useAuthedMutation<
    CreateClipMutation,
    CreateClipMutationVariables
  >(CREATE_CLIP);

  const createClip = useCallback(
    async (data) => {
      const mutationResult = await mutate({
        variables: {
          data: {
            title: data.title,
            channelArn: data.channelArn,
          },
        },
      });
      const res = mutationResult?.data?.createClip;
      if (res?.id) {
        console.log("useCreateClip createClip success", res);
      } else {
        onError && onError();
      }
      return {
        res,
      };
    },
    [mutate, onError]
  );

  return { createClip };
};

export default useCreateClip;
