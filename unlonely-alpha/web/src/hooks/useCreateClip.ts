import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback } from "react";

import { useAuthedMutation } from "../apiClient/hooks";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const CREATE_CLIP = gql`
  mutation Mutation {
    createClip {
      url
      thumbnail
      errorMessage
    }
  }
`;

const useCreateClip = ({ onError }: Props) => {
  const [mutate] = useAuthedMutation<any, any>(CREATE_CLIP);

  const createClip = useCallback(async () => {
    const mutationResult = await mutate();

    const res = mutationResult?.data?.createClip;
    /* eslint-disable no-console */
    if (res) {
      console.log("success");
    } else {
      onError && onError();
    }

    return {
      res,
    };
  }, [mutate, onError]);

  return { createClip };
};

export default useCreateClip;
