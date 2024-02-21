import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useCallback, useState } from "react";

import { useAuthedMutation } from "../../apiClient/hooks";
import { MigrateChannelToLivepeerMutation, MigrateChannelToLivepeerMutationVariables } from "../../generated/graphql";

type Props = {
  onError?: (errors?: GraphQLErrors) => void;
};

const MIGRATE_CHANNEL_TO_LIVEPEER_MUTATION = gql`
    mutation MigrateChannelToLivepeer($data: MigrateChannelToLivepeerInput!) {
      migrateChannelToLivepeer(data: $data) {
        id
      }
    }
`;

const useMigrateChannelToLivepeerMutation = ({ onError }: Props) => {
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<MigrateChannelToLivepeerMutation, MigrateChannelToLivepeerMutationVariables>(MIGRATE_CHANNEL_TO_LIVEPEER_MUTATION);

  const migrateChannelToLivepeer = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const mutationResult = await mutate({
          variables: {
            data: {
              slug: data.slug,
              ownerAddress: data.ownerAddress,
              canRecord: data.canRecord,
            },
          },
        });

        const res = mutationResult?.data?.migrateChannelToLivepeer;
        /* eslint-disable no-console */
        if (res) {
          console.log("migrateChannelToLivepeer success");
        } else {
          onError && onError();
        }
        setLoading(false);
        return {
          res,
        };
      } catch (e) {
        console.log("migrateChannelToLivepeer", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError]
  );

  return { migrateChannelToLivepeer, loading };
};

export default useMigrateChannelToLivepeerMutation;
