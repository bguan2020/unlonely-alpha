import { gql } from "@apollo/client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useEnsName } from "wagmi";
import { useQuery } from "@apollo/client";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { usePrivyWagmi } from "@privy-io/wagmi-connector";

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
  const { ready, authenticated, user: privyUser } = usePrivy();
  const { wallet: activeWallet } = usePrivyWagmi();
  const { wallets } = useWallets();

  const address = useMemo(
    () => privyUser?.wallet?.address,
    [privyUser?.wallet?.address]
  );
  
  // console.log(
  //   "ready",
  //   ready,
  //   "\nprivyUser",
  //   privyUser,
  //   "\nauthenticated",
  //   authenticated,
  //   "\nactiveWallet",
  //   activeWallet,
  //   "\nwallets",
  //   wallets
  // );

  // ignore console log build error for now
  //
  const { data } = useQuery(GET_USER_QUERY, {
    variables: { data: { address } },
  });

  console.log(data, "useUser");

  const { data: ensData } = useEnsName({
    address: address as `0x${string}`,
  });

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
      userAddress: address as `0x${string}`,
      walletIsConnected: authenticated,
    }),
    [user, username, address, authenticated]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
