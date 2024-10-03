import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  // useEffect,
  useMemo,
  useState,
} from "react";
// import { useLazyQuery } from "@apollo/client";
import {
  usePrivy,
  useWallets,
  useLogin,
  useLogout,
  useConnectWallet,
  WalletWithMetadata,
  ConnectedWallet,
  ConnectedSolanaWallet,
} from "@privy-io/react-auth";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useSolanaWallets } from "@privy-io/react-auth/solana";
// import {
//   Box,
//   Button,
//   div,
//   IconButton,
//   Text,
//   Tooltip,
//   useToast,
// } from "@chakra-ui/react";
// import { RiSubtractFill } from "react-icons/ri";

import {
  Channel,
  // GetUserQuery,
  Maybe,
  Scalars,
} from "../../generated/graphql";
// import { TransactionModalTemplate } from "../../components/transactions/TransactionModalTemplate";
// import { GET_USER_QUERY } from "../../constants/queries";
// import centerEllipses from "../../utils/centerEllipses";
// import { Tos } from "../../components/general/Tos";
// import { TurnOnNotificationsModal } from "../../components/mobile/TurnOnNotificationsModal";
// import { useApolloContext } from "./useApollo";
// import { useAccount, useSignMessage } from "wagmi";
import { useSetActiveWallet } from "@privy-io/wagmi";
// import usePostStreamInteraction from "../server/usePostStreamInteraction";
import { areAddressesEqual } from "../../utils/validation/wallet";

// const FETCH_TRIES = 5;

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
  activeWallet: ConnectedWallet | ConnectedSolanaWallet | undefined;
  handleSolanaAddress: (address: string | undefined) => void;
  fetchUser: () => any;
  login: () => void;
  connectWallet: () => void;
  logout: () => void;
  exportWallet: () => Promise<void>;
  handleIsManagingWallets: (value: boolean) => void;
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
  login: () => undefined,
  connectWallet: () => undefined,
  logout: () => undefined,
  exportWallet: () => Promise.resolve(),
  handleIsManagingWallets: () => undefined,
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

  const [differentWallet, setDifferentWallet] = useState(false);
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

  //   const { address: wagmiAddress } = useAccount();

  //   const { signMessage } = useSignMessage();
  const handleInitialNotificationsGranted = useCallback((granted: boolean) => {
    setInitialNotificationsGranted(granted);
  }, []);

  const {
    authenticated,
    ready,
    exportWallet,
    linkWallet,
    unlinkWallet,
    user: privyUser,
  } = usePrivy();
  const { wallets: evmWallets } = useWallets();
  const { wallets: solanaWallets } = useSolanaWallets();

  const wallets = useMemo(
    () => [...evmWallets, ...(solanaWallets as ConnectedSolanaWallet[])],
    [evmWallets, solanaWallets]
  );

  console.log("wallets", wallets, evmWallets, solanaWallets);

  const latestVerifiedPrivyAccount = useMemo(() => {
    if (privyUser?.linkedAccounts.length === 0) return undefined;
    if (privyUser?.linkedAccounts.length === 1)
      return privyUser?.linkedAccounts[0];
    const accountWithLatestVerifiedAt = privyUser?.linkedAccounts
      .filter((account) => account.latestVerifiedAt instanceof Date) // Filter accounts with a valid Date
      .reduce((latest: any, current) => {
        if (
          !latest ||
          (current.latestVerifiedAt &&
            current.latestVerifiedAt > latest.latestVerifiedAt)
        ) {
          return current; // Return the account with the later date
        }
        return latest;
      }, undefined); // Changed initial value to undefined
    return accountWithLatestVerifiedAt;
  }, [privyUser?.linkedAccounts]);

  console.log(
    "latestVerifiedPrivyAccount",
    latestVerifiedPrivyAccount?.address
    // wagmiAddress
  );

  //   const toast = useToast();
  //   const { postStreamInteraction } = usePostStreamInteraction({});
  const { login } = useLogin({
    onComplete: (
      _user,
      isNewUser,
      wasAlreadyAuthenticated,
      loginMethod,
      loginAccount
    ) => {
      console.log(
        "login complete",
        _user,
        isNewUser,
        wasAlreadyAuthenticated,
        loginMethod,
        loginAccount,
        authenticated,
        user,
        ready
        // wallets
      );
    },
    onError: (error) => {
      console.error("login error", error);
    },
  });

  const { connectWallet } = useConnectWallet({
    onError: (err) => {
      console.error("connect wallet error", err);
    },
  });

  const { logout } = useLogout({
    onSuccess: () => {
      setUser(undefined);
      setSolanaAddress(undefined);
      setLocalAddress(undefined);
      //   handleLatestVerifiedAddress(null);
    },
  });

  //   const [fetchUser] = useLazyQuery<GetUserQuery>(GET_USER_QUERY, {
  //     fetchPolicy: "network-only",
  //   });

  const handleUser = useCallback((data: DatabaseUser | undefined) => {
    setUser(data);
  }, []);

  useEffect(() => {
    if (!localAddress || evmWallets.length === 0) return;
    const foundEvmWallet = evmWallets.find((w) =>
      areAddressesEqual(w.address, localAddress)
    );
    console.log("foundEvmWallet", foundEvmWallet, evmWallets, localAddress);
    if (foundEvmWallet) setActiveWallet(foundEvmWallet);
  }, [localAddress, evmWallets, setActiveWallet]);

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
      wagmiAddress: undefined,
      ready,
      authenticated,
      isManagingWallets,
      fetchingUser,
      doesUserAddressMatch,
      activeWallet: undefined,
      solanaAddress,
      fetchUser: () => undefined,
      login,
      connectWallet,
      logout,
      exportWallet,
      handleIsManagingWallets,
      handleSolanaAddress,
      handleUser,
    }),
    [
      user,
      initialNotificationsGranted,
      ready,
      authenticated,
      isManagingWallets,
      fetchingUser,
      doesUserAddressMatch,
      //   wagmiAddress,
      solanaAddress,
      //   fetchUser,
      login,
      connectWallet,
      logout,
      exportWallet,
      handleIsManagingWallets,
      handleSolanaAddress,
      handleUser,
    ]
  );

  return (
    <UserContext.Provider value={value}>
      <div>
        {privyUser?.linkedAccounts
          .filter((account) => account.type === "wallet")
          .map((account) => {
            const foundWallet = undefined;
            return (
              <div>
                <div>
                  {areAddressesEqual(
                    localAddress ?? "",
                    (account as WalletWithMetadata).address
                  ) &&
                  (areAddressesEqual("", localAddress ?? "") ||
                    areAddressesEqual(
                      solanaAddress ?? "",
                      localAddress ?? ""
                    )) ? (
                    <div>
                      <div>Active</div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (foundWallet) {
                          connectWallet({
                            suggestedAddress: (account as WalletWithMetadata)
                              .address,
                          });
                        }
                      }}
                    >
                      {foundWallet ? "set active" : "connect"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        <button onClick={linkWallet}>link new wallet</button>
        <button onClick={login}>login</button>
        <button onClick={exportWallet}>export wallet</button>
        <div>
          <p>privy user id</p>
          <p color="#acacac">{privyUser?.id}</p>
        </div>
        <button
          onClick={() => {
            logout();
            setIsManagingWallets(false);
          }}
        >
          logout
        </button>
      </div>
      <div>
        <p>
          our app thinks you're using two different wallet addresses, this can
          occur when you change wallet accounts while logged in
        </p>
        <div>
          <p>logged in as {user?.address}</p>
        </div>
        <p>to resolve, switch back to the original wallet account or logout</p>
      </div>
      {/* </TransactionModalTemplate>
      <Tos /> */}
      {children}
    </UserContext.Provider>
  );
};
