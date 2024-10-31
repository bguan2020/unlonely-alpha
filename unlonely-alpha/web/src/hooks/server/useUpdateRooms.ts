import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useAuthedMutation } from "../../apiClient/hooks";
import {
  UpdateRoomsInput,
  UpdateRoomsMutation,
  UpdateRoomsMutationVariables,
} from "../../generated/graphql";

const MUTATION = gql`
  mutation UpdateRooms($data: UpdateRoomsInput!) {
    updateRooms(data: $data) {
      availablePackages
      inUse
      roomName
    }
  }
`;

export const useUpdateRooms = ({
  onError,
}: {
  onError?: (errors?: GraphQLErrors) => void;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateRoomsMutation,
    UpdateRoomsMutationVariables
  >(MUTATION);

  const updateRooms = useCallback(
    async (data: UpdateRoomsInput) => {
      try {
        setLoading(true);

        const mutationResult = await mutate({ variables: { data } });

        const res = mutationResult?.data?.updateRooms;

        if (res) {
          console.log("success");
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("updateRooms", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError, router]
  );

  return { updateRooms, loading };
};
