import {
  ApolloCache,
  ApolloError,
  DocumentNode,
  MutationFunctionOptions,
  MutationHookOptions,
  MutationTuple,
  TypedDocumentNode,
  useMutation,
} from "@apollo/client";
import { useState } from "react";

import { Context } from "./client";
import { useAuthData } from "../state/auth";

/**
 * Wrapper hook for mutations that require full authentication.
 *
 * This hook wraps Apollo's normal `useMutation` hook and provides a pretty much 1-1
 * replacement for it, whilst also handling getting the user's signature via their
 * connected wallet.
 *
 * It does this by wrapping the `mutate` function with it's own that first fetches the
 * signed message (via the `getAuthData` function), and then passes that info into the
 * Apollo context so that it can be set in headers.
 */
export const useAuthedMutation = <
  TData,
  TVariables,
  TCache extends ApolloCache<unknown> = ApolloCache<unknown>
>(
  mutation: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: MutationHookOptions<TData, TVariables, Context>
): MutationTuple<TData, TVariables, Context, TCache> => {
  const [_mutate, { error: _error, ...rest }] = useMutation<
    TData,
    TVariables,
    Context,
    TCache
  >(mutation, {
    variables: options?.variables,
    context: { signedMessage: "" },
  });
  const { getAuthData } = useAuthData();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<undefined | ApolloError>();

  const mutate = async (
    options?: MutationFunctionOptions<TData, TVariables, Context, TCache>
  ) => {
    setLoading(true);
    setError(undefined);

    return _mutate({
      ...options,
      context: { signedMessage: "" },
    }).then((x) => {
      setLoading(false);
      return x;
    });
  };

  return [mutate, { ...rest, loading, error: error || _error }];
};
