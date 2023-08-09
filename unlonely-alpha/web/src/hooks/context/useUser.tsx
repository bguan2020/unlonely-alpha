import { gql } from "@apollo/client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useEnsName } from "wagmi";
import { useQuery } from "@apollo/client";
import { usePrivy, useWallets, WalletWithMetadata } from "@privy-io/react-auth";
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
  loginMethod?: string;
}>({
  user: undefined,
  username: undefined,
  userAddress: undefined,
  walletIsConnected: false,
  loginMethod: undefined,
});

export const UserProvider = ({
  children,
}: {
  children: JSX.Element[] | JSX.Element;
}) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [username, setUsername] = useState<string | undefined>();
  const { ready, authenticated, user: privyUser, logout } = usePrivy();
  const { wallet: activeWallet } = usePrivyWagmi();
  const { wallets } = useWallets();

  const loginMethod = useMemo(() => {
    const wallet = privyUser?.linkedAccounts?.find(
      (account): account is WalletWithMetadata =>
        account.type === "wallet" && "walletClientType" in account
    );
    if (!wallet) return undefined;
    return wallet.walletClientType;
  }, [privyUser]);

  const address = useMemo(
    () => privyUser?.wallet?.address,
    [privyUser?.wallet?.address]
  );

  // ignore console log build error for now
  //
  const { data } = useQuery(GET_USER_QUERY, {
    variables: { data: { address } },
  });

  console.log(
    "unlonelyUser",
    data,
    "\nprivyAddress",
    address,
    "\nprivyUser",
    privyUser,
    "\nauthenticated",
    authenticated,
    "\nactiveWallet",
    activeWallet,
    "\nwallets",
    wallets
  );

  const { data: ensData } = useEnsName({
    address: address as `0x${string}`,
  });

  const walletIsConnected = useMemo(() => {
    const auth =
      authenticated && activeWallet !== undefined && user !== undefined;
    const matchingWallet = activeWallet?.address === address;
    return auth && matchingWallet;
  }, [authenticated, activeWallet, user, address]);

  const linkingWallet = useRef(false);

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

  useEffect(() => {
    const f = async () => {
      if (
        privyUser?.wallet?.address &&
        activeWallet?.address &&
        activeWallet?.address !== privyUser?.wallet?.address &&
        privyUser?.wallet?.walletClientType !== "privy" &&
        !linkingWallet.current
      ) {
        linkingWallet.current = true;
        console.log(
          "relinking",
          activeWallet?.address,
          privyUser?.wallet?.address
        );
        await logout();
        if (wallets[0].connectorType !== "embedded")
          await wallets[0]?.loginOrLink();
        linkingWallet.current = false;
      }
    };
    f();
  }, [activeWallet, privyUser]);

  const value = useMemo(
    () => ({
      user,
      username,
      userAddress: address as `0x${string}`,
      walletIsConnected,
      loginMethod,
    }),
    [user, username, address, walletIsConnected, loginMethod]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
