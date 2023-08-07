import { gql } from "@apollo/client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAccount, useEnsName } from "wagmi";
import { useQuery } from "@apollo/client";

import { User } from "../../generated/graphql";
import centerEllipses from "../../utils/centerEllipses";
/* eslint-disable */
const GET_USER_QUERY = gql`
  query getUser($data: GetUserInput!) {
    getUser(data: $data) {
      address
      username
      signature
      bio
      powerUserLvl
      videoSavantLvl
      nfcRank
      FCImageUrl
      isFCUser
      isLensUser
      lensHandle
      lensImageUrl
      channel {
        slug
      }
    }
  }
`;

export const useUser = () => {
  return useContext(UserContext);
};

const UserContext = createContext<{
  user: User | undefined;
  username?: string;
  userAddress?: `0x${string}`;
  walletIsConnected: boolean;
}>({
  user: undefined,
  username: undefined,
  userAddress: undefined,
  walletIsConnected: false,
});

export const UserProvider = ({
  children,
}: {
  children: JSX.Element[] | JSX.Element;
}) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [username, setUsername] = useState<string | undefined>();
  const { address, isConnected } = useAccount();
  // ignore console log build error for now
  //
  const { data, loading, error } = useQuery(GET_USER_QUERY, {
    variables: { data: { address } },
  });

  const { data: ensData } = useEnsName({
    address,
  });

  console.log(address, isConnected);

  useEffect(() => {
    const fetchEns = async () => {
      if (address) {
        const username = ensData ?? centerEllipses(address, 9);
        setUsername(username);
      }
    };

    fetchEns();
  }, [address, ensData]);

  useEffect(() => {
    setUser(data?.getUser);
  }, [data]);

  const value = useMemo(
    () => ({
      user,
      username,
      userAddress: address,
      walletIsConnected: isConnected,
    }),
    [user, username, address, isConnected]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
