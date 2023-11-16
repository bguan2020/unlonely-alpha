import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import {
  CreateClipMutation,
  CreateClipMutationVariables,
  CreateLivepeerClipMutation,
  CreateLivepeerClipMutationVariables,
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

const CREATE_LIVEPEER_CLIP = gql`
  mutation CreateLivepeerClip($data: CreateLivepeerClipInput!) {
    createLivepeerClip(data: $data) {
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

  const [mutateLivepeer] = useAuthedMutation<
    CreateLivepeerClipMutation,
    CreateLivepeerClipMutationVariables
  >(CREATE_LIVEPEER_CLIP);

  const createClip = useCallback(
    async (data) => {
      let res = null;
      if ((data.livepeerPlaybackId as string).length > 0) {
        const mutationResult = await mutateLivepeer({
          variables: {
            data: {
              title: data.title,
              livepeerPlaybackId: data.livepeerPlaybackId,
            },
          },
        });
        res = mutationResult?.data?.createLivepeerClip;
      } else {
        const mutationResult = await mutate({
          variables: {
            data: {
              title: data.title,
              channelArn: data.channelArn,
            },
          },
        });
        res = mutationResult?.data?.createClip;
      }
      if (res?.id) {
        console.log("useCreateClip createClip success", res);
      } else {
        onError && onError();
      }
      return {
        res,
      };
    },
    [mutate, mutateLivepeer, onError]
  );

  return { createClip };
};

export default useCreateClip;
