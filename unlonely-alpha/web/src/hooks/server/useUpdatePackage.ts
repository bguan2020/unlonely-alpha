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
    tokenHoldingPrice
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
      try {

        setLoading(true);
        
        const mutationResult = await mutate({ variables: { data } });
        
        const res = mutationResult?.data?.updatePackage;
        
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
        console.log("updatePackage", JSON.stringify(e, null, 2));
      }
    },
    [mutate, onError, router]
  );

  return { updatePackage, loading };
};