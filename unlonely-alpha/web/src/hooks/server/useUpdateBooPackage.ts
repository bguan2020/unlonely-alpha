import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useAuthedMutation } from "../../apiClient/hooks";
import { UpdateBooPackageInput, UpdateBooPackageMutation, UpdateBooPackageMutationVariables } from "../../generated/graphql";


const MUTATION = gql`
mutation UpdateBooPackage($data: UpdateBooPackageInput!) {
  updateBooPackage(data: $data) {
    cooldownInSeconds
    priceMultiplier
    packageName
    id
  }
}
`

export const useUpdateBooPackage = ({
  onError,
}: {
  onError?: (errors?: GraphQLErrors) => void;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdateBooPackageMutation,
    UpdateBooPackageMutationVariables
  >(MUTATION);

  const updateBooPackage = useCallback(
    async (data: UpdateBooPackageInput) => {
      setLoading(true);

      const mutationResult = await mutate({ variables: { data } });

      if (
        mutationResult.errors ||
        !mutationResult.data ||
        !mutationResult.data.updateBooPackage
      ) {
        onError && onError(mutationResult.errors);
        setLoading(false);
        return;
      }

      setLoading(false);
    },
    [mutate, onError, router]
  );

  return { updateBooPackage, loading };
};