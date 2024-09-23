import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { gql } from "@apollo/client";
import { GraphQLErrors } from "@apollo/client/errors";
import { useAuthedMutation } from "../../apiClient/hooks";
import { UpdatePackageInput, UpdatePackageMutation, UpdatePackageMutationVariables } from "../../generated/graphql";


const MUTATION = gql`
mutation UpdatePackage($data: UpdatePackageInput!) {
  updatePackage(data: $data) {
    cooldownInSeconds
    priceMultiplier
    packageName
    id
  }
}
`

export const useUpdatePackage = ({
  onError,
}: {
  onError?: (errors?: GraphQLErrors) => void;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mutate] = useAuthedMutation<
    UpdatePackageMutation,
    UpdatePackageMutationVariables
  >(MUTATION);

  const updatePackage = useCallback(
    async (data: UpdatePackageInput) => {
      setLoading(true);

      const mutationResult = await mutate({ variables: { data } });

      if (
        mutationResult.errors ||
        !mutationResult.data ||
        !mutationResult.data.updatePackage
      ) {
        onError && onError(mutationResult.errors);
        setLoading(false);
        return;
      }

      setLoading(false);
    },
    [mutate, onError, router]
  );

  return { updatePackage, loading };
};