import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLazyQuery } from "@apollo/client";
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

import { useSolanaWallets } from "@privy-io/react-auth/solana";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Text,
  Image,
  Tooltip,
} from "@chakra-ui/react";
import { RiSubtractFill } from "react-icons/ri";
import { GoUnlink } from "react-icons/go";

import { Channel, GetUserQuery, Maybe, Scalars } from "../../generated/graphql";
import { TransactionModalTemplate } from "../../components/transactions/TransactionModalTemplate";
import { GET_USER_QUERY } from "../../constants/queries";
import centerEllipses from "../../utils/centerEllipses";
// import { Tos } from "../../components/general/Tos";
import { TurnOnNotificationsModal } from "../../components/mobile/TurnOnNotificationsModal";
import { useApolloContext } from "./useApollo";
import { useAccount } from "wagmi";
import { useSetActiveWallet } from "@privy-io/wagmi";
import {
  areAddressesEqual,
  isValidAddress,
} from "../../utils/validation/wallet";

const FETCH_TRIES = 5;

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
  login: () => undefined,
  connectWallet: () => undefined,
  logout: () => undefined,
  exportWallet: () => Promise.resolve(),
  handleIsManagingWallets: () => undefined,
  fetchAndSetUserData: () => undefined,
  handleUser: () => undefined,
});

export const UserProvider = ({
  children,
}: {
  children: JSX.Element[] | JSX.Element;
}) => {
  const { handleLatestVerifiedAddress } = useApolloContext();
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

  const calledConnectWalletOnMount = useRef(false);

  const { address: wagmiAddress } = useAccount();

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

  const latestVerifiedPrivyAccount = useMemo(() => {
    if (privyUser?.linkedAccounts.length === 0) return undefined;
    if (privyUser?.linkedAccounts.length === 1)
      return privyUser?.linkedAccounts[0];
    const accountWithLatestVerifiedAt = privyUser?.linkedAccounts
      ?.filter((account) => account.latestVerifiedAt instanceof Date) // Filter accounts with a valid Date
      ?.reduce((latest: any, current) => {
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
        ready,
        wallets
      );
    },
    onError: (error) => {
      console.error("login error", error);
    },
  });

  const { connectWallet } = useConnectWallet({
    onSuccess: (wallet) => {
      fetchAndSetUserData(wallet.address);
    },
    onError: (err) => {
      console.error("connect wallet error", err);
    },
  });

  const { logout } = useLogout({
    onSuccess: () => {
      setUser(undefined);
      setSolanaAddress(undefined);
      setLocalAddress(undefined);
      handleLatestVerifiedAddress(null);
    },
  });

  const [fetchUser] = useLazyQuery<GetUserQuery>(GET_USER_QUERY, {
    fetchPolicy: "network-only",
  });

  const fetchAndSetUserData = useCallback(async (_address: string) => {
    setFetchingUser(true);
    handleLatestVerifiedAddress(_address);
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
        console.error("user not found in database for address", _address, data); // todo: create error toast just in case
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    setFetchingUser(false);
  }, []);

  const handleUser = useCallback((data: DatabaseUser | undefined) => {
    setUser(data);
  }, []);

  useEffect(() => {
    if (latestVerifiedPrivyAccount?.address)
      fetchAndSetUserData(latestVerifiedPrivyAccount?.address);
  }, [latestVerifiedPrivyAccount?.address]);

  useEffect(() => {
    if (!localAddress || evmWallets.length === 0) return;
    const foundEvmWallet = evmWallets.find((w) =>
      areAddressesEqual(w.address, localAddress)
    );
    console.log("foundEvmWallet", foundEvmWallet, evmWallets, localAddress);
    if (foundEvmWallet) setActiveWallet(foundEvmWallet);
  }, [localAddress, evmWallets]);

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
      ready,
      authenticated,
      isManagingWallets,
      fetchingUser,
      doesUserAddressMatch,
      activeWallet: wallets.find((w) =>
        areAddressesEqual(localAddress ?? "", w.address)
      ),
      solanaAddress,
      fetchUser,
      login,
      connectWallet,
      logout,
      exportWallet,
      handleIsManagingWallets,
      handleSolanaAddress,
      fetchAndSetUserData,
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
      wagmiAddress,
      solanaAddress,
      fetchUser,
      login,
      connectWallet,
      logout,
      exportWallet,
      handleIsManagingWallets,
      handleSolanaAddress,
      fetchAndSetUserData,
      handleUser,
    ]
  );

  console.log("privyUser?.linkedAccounts", privyUser?.linkedAccounts);
  console.log(
    "latestVerifiedPrivyAccount",
    latestVerifiedPrivyAccount?.address,
    "wagmiAddress",
    wagmiAddress
  );
  console.log("wallets", wallets, evmWallets, solanaWallets);

  return (
    <UserContext.Provider value={value}>
      <TurnOnNotificationsModal
        handleInitialNotificationsGranted={handleInitialNotificationsGranted}
      />
      <TransactionModalTemplate
        title="manage your wallets"
        isOpen={isManagingWallets}
        handleClose={() => setIsManagingWallets(false)}
        isModalLoading={false}
        size="md"
        hideFooter
      >
        <Flex direction={"column"} gap="5px">
          {privyUser?.linkedAccounts
            ?.filter((account) => account.type === "wallet")
            .map((account, i) => {
              const foundWallet = wallets.find(
                (w) => w.address === (account as WalletWithMetadata).address
              );
              return (
                <Flex
                  key={i}
                  gap="5px"
                  background="rgba(0, 0, 0, 0.5)"
                  borderRadius="5px"
                  p="5px"
                  justifyContent={"space-between"}
                  alignItems={"center"}
                >
                  <Flex gap="5px" alignItems={"center"}>
                    {foundWallet?.meta.icon ? (
                      <Image
                        src={
                          wallets.find(
                            (w) =>
                              w.address ===
                              (account as WalletWithMetadata).address
                          )?.meta.icon
                        }
                        alt="wallet image"
                        width="20px"
                        height="20px"
                      />
                    ) : (
                      <GoUnlink />
                    )}
                    {(foundWallet as any)?.type && (
                      <>
                        {(foundWallet as any)?.type === "ethereum" && (
                          <Image
                            src={"/images/eth-logo.png"}
                            alt="chain image"
                            width="20px"
                            height="20px"
                          />
                        )}
                        {(foundWallet as any)?.type === "solana" && (
                          <Image
                            src={"/images/sol-logo.png"}
                            alt="chain image"
                            width="20px"
                            height="20px"
                          />
                        )}
                      </>
                    )}
                    <Text fontFamily={"LoRes15"}>
                      {centerEllipses(
                        (account as WalletWithMetadata).address,
                        13
                      )}
                    </Text>
                  </Flex>
                  <Flex gap="5px" alignItems={"end"}>
                    {areAddressesEqual(
                      localAddress ?? "",
                      (account as WalletWithMetadata).address
                    ) &&
                    (areAddressesEqual(
                      wagmiAddress ?? "",
                      localAddress ?? ""
                    ) ||
                      areAddressesEqual(
                        solanaAddress ?? "",
                        localAddress ?? ""
                      )) &&
                    (foundWallet as any)?.type ? (
                      <Flex gap="5px">
                        <Flex
                          background="#22b66e"
                          alignItems="center"
                          borderRadius="5px"
                          px="5px"
                          height={"20px"}
                          fontSize="15px"
                        >
                          <Text>Active</Text>
                        </Flex>
                      </Flex>
                    ) : (
                      <Button
                        border="1px white solid"
                        height={"20px"}
                        fontSize="15px"
                        bg="transparent"
                        color="white"
                        _hover={{
                          bg: "rgba(255, 255, 255, 0.2)",
                        }}
                        onClick={() => {
                          if (foundWallet) {
                            fetchAndSetUserData(foundWallet.address);
                          } else {
                            connectWallet({
                              suggestedAddress: (account as WalletWithMetadata)
                                .address,
                            });
                          }
                        }}
                      >
                        {foundWallet ? "set active" : "connect"}
                      </Button>
                    )}
                    {privyUser?.linkedAccounts?.filter(
                      (account) => account.type === "wallet"
                    ).length > 1 && (
                      <Tooltip label="unlink wallet" shouldWrapChildren>
                        <IconButton
                          border="1px white solid"
                          color="white"
                          bg="transparent"
                          _hover={{
                            bg: "rgba(255, 255, 255, 0.2)",
                          }}
                          height={"20px"}
                          icon={<RiSubtractFill />}
                          aria-label="unlink wallet"
                          onClick={async () => {
                            const newPrivyUser = await unlinkWallet(
                              (account as WalletWithMetadata).address
                            );
                            console.log("newPrivyUser", newPrivyUser);
                          }}
                        />
                      </Tooltip>
                    )}
                  </Flex>
                </Flex>
              );
            })}
          <Button onClick={linkWallet}>link new wallet</Button>
          <Flex justifyContent={"space-between"}>
            <Text fontSize="10px">privy user id</Text>
            <Text fontSize="10px" color="#acacac">
              {privyUser?.id}
            </Text>
          </Flex>
          <Button
            color="white"
            bg="#E09025"
            _hover={{}}
            _focus={{}}
            _active={{}}
            onClick={() => {
              logout();
              setIsManagingWallets(false);
            }}
            borderRadius="25px"
          >
            logout
          </Button>
        </Flex>
      </TransactionModalTemplate>
      <TransactionModalTemplate
        confirmButton="logout"
        title="did you change wallet accounts?"
        isOpen={differentWallet}
        handleClose={() => setDifferentWallet(false)}
        canSend={true}
        onSend={logout}
        isModalLoading={false}
        size="sm"
        blur
      >
        <Flex direction={"column"} gap="5px">
          <Text textAlign={"center"} fontSize="13px" color="#BABABA">
            our app thinks you're using two different wallet addresses, this can
            occur when you change wallet accounts while logged in
          </Text>
          <Box
            borderColor="#909090"
            borderWidth="1px"
            borderStyle="solid"
            p="5px"
            borderRadius="5px"
          >
            <Text textAlign={"center"} fontSize={"12px"} color="#22b66e">
              logged in as {user?.address}
            </Text>
            <Text textAlign={"center"} fontSize={"12px"} color="#85c71b">
              connected {wallets[0]?.address}
            </Text>
          </Box>
          <Text textAlign={"center"} fontSize="15px">
            to resolve, switch back to the original wallet account or logout
          </Text>
        </Flex>
      </TransactionModalTemplate>
      {/* <Tos /> */}
      {children}
    </UserContext.Provider>
  );
};
