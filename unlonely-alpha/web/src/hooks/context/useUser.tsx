import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLazyQuery } from "@apollo/client";
// import {
//   usePrivy,
//   useWallets,
//   useLogin,
//   useLogout,
//   useConnectWallet,
//   // WalletWithMetadata,
//   ConnectedWallet,
//   ConnectedSolanaWallet,
//   WalletWithMetadata,
// } from "@privy-io/react-auth";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useSolanaWallets } from "@privy-io/react-auth/solana";

// import { RiSubtractFill } from "react-icons/ri";
// import { GoUnlink } from "react-icons/go";

import { Channel, GetUserQuery, Maybe, Scalars } from "../../generated/graphql";
// import { TransactionModalTemplate } from "../../components/transactions/TransactionModalTemplate";
import {
  //   GET_DOES_USER_ADDRESS_MATCH_QUERY,
  GET_USER_QUERY,
} from "../../constants/queries";
// import centerEllipses from "../../utils/centerEllipses";
// import { Tos } from "../../components/general/Tos";
// import { TurnOnNotificationsModal } from "../../components/mobile/TurnOnNotificationsModal";
// import { useApolloContext } from "./useApollo";
import { useAccount, useSignMessage } from "wagmi";
import { useSetActiveWallet } from "@privy-io/wagmi";
// import usePostStreamInteraction from "../server/usePostStreamInteraction";
import {
  // areAddressesEqual,
  isValidAddress,
} from "../../utils/validation/wallet";
// import centerEllipses from "../../utils/centerEllipses";
import { Flex, Button, Text } from "@chakra-ui/react";

const FETCH_TRIES = 5;

type WalletListEntry =
  | "metamask"
  | "phantom"
  | "rainbow"
  | "rabby_wallet"
  | "coinbase_wallet"
  | "zerion"
  | "cryptocom"
  | "uniswap"
  | "okx_wallet"
  | "detected_wallets"
  | "wallet_connect"
  | "safe";

const isWalletListEntry = (value: unknown): value is WalletListEntry => {
  return typeof value === "string" && (value as WalletListEntry) === value;
};

export const useUser = () => {
  return useContext(UserContext);
};

type DatabaseUser = {
  address: Scalars["String"];
  channel?: Maybe<Array<Maybe<Partial<Channel>>>>;
  username?: Maybe<Scalars["String"]>;
  FCImageUrl?: Maybe<Scalars["String"]>;
  FCHandle?: Maybe<Scalars["String"]>;
  lensHandle?: Maybe<Scalars["String"]>;
  lensImageUrl?: Maybe<Scalars["String"]>;
  powerUserLvl: Scalars["Int"];
};

const UserContext = createContext<{
  user?: DatabaseUser;
  username?: string;
  initialNotificationsGranted: boolean;
  wagmiAddress?: `0x${string}`;
  solanaAddress?: string;
  ready: boolean;
  authenticated: boolean;
  isManagingWallets: boolean;
  fetchingUser: boolean;
  doesUserAddressMatch: boolean | undefined;
  activeWallet: undefined;
  handleSolanaAddress: (address: string | undefined) => void;
  fetchUser: () => any;
  handleIsManagingWallets: (value: boolean) => void;
  fetchAndSetUserData: (address: string) => void;
  handleUser: (data: DatabaseUser | undefined) => void;
}>({
  user: undefined,
  username: undefined,
  initialNotificationsGranted: false,
  wagmiAddress: undefined,
  solanaAddress: undefined,
  ready: false,
  authenticated: false,
  isManagingWallets: false,
  fetchingUser: false,
  doesUserAddressMatch: undefined,
  activeWallet: undefined,
  handleSolanaAddress: () => undefined,
  fetchUser: () => undefined,
  handleIsManagingWallets: () => undefined,
  fetchAndSetUserData: () => undefined,
  handleUser: () => undefined,
});

export const UserProvider = ({
  children,
}: {
  children: JSX.Element[] | JSX.Element;
}) => {
  //   const { handleLatestVerifiedAddress } = useApolloContext();
  const { setActiveWallet } = useSetActiveWallet();
  const [user, setUser] = useState<DatabaseUser | undefined>(undefined);
  const [isManagingWallets, setIsManagingWallets] = useState(false);

  // const [differentWallet, setDifferentWallet] = useState(false);
  const [initialNotificationsGranted, setInitialNotificationsGranted] =
    useState(false);
  const [fetchingUser, setFetchingUser] = useState(false);
  const [doesUserAddressMatch, setDoesUserAddressMatch] = useState<
    boolean | undefined
  >(undefined);

  const [solanaAddress, setSolanaAddress] = useState<string | undefined>(
    undefined
  );
  const [localAddress, setLocalAddress] = useState<string | undefined>(
    undefined
  );

  const { address: wagmiAddress } = useAccount();

  const { signMessage } = useSignMessage();
  const handleInitialNotificationsGranted = useCallback((granted: boolean) => {
    setInitialNotificationsGranted(granted);
  }, []);

  // const {
  //   authenticated,
  //   ready,
  //   exportWallet,
  //   linkWallet,
  //   unlinkWallet,
  //   user: privyUser,
  // } = usePrivy();
  // const { wallets: evmWallets } = useWallets();
  const { wallets: solanaWallets } = useSolanaWallets();

  // const wallets = useMemo(
  //   () => [...evmWallets, ...(solanaWallets as ConnectedSolanaWallet[])],
  //   [evmWallets, solanaWallets]
  // );

  // console.log("wallets", wallets, evmWallets, solanaWallets);

  // const latestVerifiedPrivyAccount = useMemo(() => {
  //   if (privyUser?.linkedAccounts.length === 0) return undefined;
  //   if (privyUser?.linkedAccounts.length === 1)
  //     return privyUser?.linkedAccounts[0];
  //   const accountWithLatestVerifiedAt = privyUser?.linkedAccounts
  //     .filter((account) => account.latestVerifiedAt instanceof Date) // Filter accounts with a valid Date
  //     .reduce((latest: any, current) => {
  //       if (
  //         !latest ||
  //         (current.latestVerifiedAt &&
  //           current.latestVerifiedAt > latest.latestVerifiedAt)
  //       ) {
  //         return current; // Return the account with the later date
  //       }
  //       return latest;
  //     }, undefined); // Changed initial value to undefined
  //   return accountWithLatestVerifiedAt;
  // }, [privyUser?.linkedAccounts]);

  // console.log(
  //   "latestVerifiedPrivyAccount",
  //   latestVerifiedPrivyAccount?.address,
  //   wagmiAddress
  // );

  //   const toast = useToast();
  //   const { postStreamInteraction } = usePostStreamInteraction({});
  // const { login } = useLogin({
  //   onComplete: (
  //     _user,
  //     isNewUser,
  //     wasAlreadyAuthenticated,
  //     loginMethod,
  //     loginAccount
  //   ) => {
  //     console.log(
  //       "login complete",
  //       _user,
  //       isNewUser,
  //       wasAlreadyAuthenticated,
  //       loginMethod,
  //       loginAccount,
  //       authenticated,
  //       user,
  //       ready
  //       // wallets: []
  //     );
  //   },
  //   onError: (error) => {
  //     console.error("login error", error);
  //   },
  // });

  // const { connectWallet } = useConnectWallet({
  //   onSuccess: (wallet) => {
  //     fetchAndSetUserData(wallet.address);
  //   },
  //   onError: (err) => {
  //     console.error("connect wallet error", err);
  //   },
  // });

  // const { logout } = useLogout({
  //   onSuccess: () => {
  //     setUser(undefined);
  //     setSolanaAddress(undefined);
  //     setLocalAddress(undefined);
  //     //   handleLatestVerifiedAddress(null);
  //   },
  // });

  const [fetchUser] = useLazyQuery<GetUserQuery>(GET_USER_QUERY, {
    fetchPolicy: "network-only",
  });

  const fetchAndSetUserData = useCallback(async (_address: string) => {
    setFetchingUser(true);
    // handleLatestVerifiedAddress(_address);
    setDoesUserAddressMatch(undefined);
    const addressType = isValidAddress(_address);
    console.log("addressType", addressType, _address);
    handleSolanaAddress(addressType === "solana" ? _address : undefined);
    setLocalAddress(_address);
    for (let i = 0; i < FETCH_TRIES; i++) {
      let data;
      try {
        data = await fetchUser({
          variables: {
            data: {
              address: _address,
            },
          },
        });
      } catch (e) {
        console.error("fetching user data error", e);
      }
      if (data?.data?.getUser) {
        console.log("user found in database", data);
        setUser({
          address: data?.data?.getUser?.address,
          channel: data?.data?.getUser?.channel as DatabaseUser["channel"],
          username: data?.data?.getUser?.username,
          FCImageUrl: data?.data?.getUser?.FCImageUrl,
          FCHandle: data?.data?.getUser?.FCHandle,
          lensHandle: data?.data?.getUser?.lensHandle,
          lensImageUrl: data?.data?.getUser?.lensImageUrl,
          powerUserLvl: data?.data?.getUser?.powerUserLvl,
        });
        break;
      } else {
        console.error("user not found in database", data); // todo: create error toast just in case
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    setFetchingUser(false);
  }, []);

  const handleUser = useCallback((data: DatabaseUser | undefined) => {
    setUser(data);
  }, []);

  // useEffect(() => {
  //   if (latestVerifiedPrivyAccount?.address)
  //     fetchAndSetUserData(latestVerifiedPrivyAccount?.address);
  // }, [latestVerifiedPrivyAccount?.address]);

  useEffect(() => {
    setActiveWallet(solanaWallets[0]);
  }, [solanaWallets, setActiveWallet]);

  const handleIsManagingWallets = useCallback((value: boolean) => {
    setIsManagingWallets(value);
  }, []);

  const handleSolanaAddress = useCallback((address: string | undefined) => {
    setSolanaAddress(address);
  }, []);

  // todo: make sure that setActiveWallet should update wagmiAddress to the latest address, not sure why it didn't change that one time

  const value = useMemo(
    () => ({
      user,
      initialNotificationsGranted,
      wagmiAddress,
      ready: false,
      authenticated: false,
      isManagingWallets,
      fetchingUser,
      doesUserAddressMatch,
      activeWallet: undefined,
      solanaAddress,
      fetchUser,
      handleIsManagingWallets,
      handleSolanaAddress,
      fetchAndSetUserData,
      handleUser,
    }),
    [
      user,
      initialNotificationsGranted,

      isManagingWallets,
      fetchingUser,
      doesUserAddressMatch,
      // wagmiAddress,
      solanaAddress,
      fetchUser,
      handleIsManagingWallets,
      handleSolanaAddress,
      fetchAndSetUserData,
      handleUser,
    ]
  );

  return (
    <UserContext.Provider value={value}>
      <Flex direction={"column"} style={{ gap: "5px" }}>
        <Button>link new wallet</Button>
        <Flex justifyContent={"space-between"}>
          <Text fontSize="10px">privy user id</Text>
          <Text fontSize="10px" color="#acacac">
            sss
          </Text>
        </Flex>
        <Button
          color="white"
          bg="#E09025"
          _hover={{}}
          _focus={{}}
          _active={{}}
          borderRadius="25px"
          onClick={() => {
            signMessage({
              message: "hello",
              //   chainId: 1,
              //   from: "0x",
              //   to: "0x",
              //   value: "0x",
              //   data: "0x",
              //   nonce: "0x",
              //   gasPrice: "0x",
              //   gasLimit: "0x",
              //   accessList: [],
            });
          }}
        >
          logout
        </Button>
      </Flex>
      {children}
    </UserContext.Provider>
  );
};
