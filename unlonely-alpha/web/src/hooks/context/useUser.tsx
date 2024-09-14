import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useApolloClient, useLazyQuery } from "@apollo/client";
import {
  usePrivy,
  useWallets,
  useLogin,
  useLogout,
  useConnectWallet,
} from "@privy-io/react-auth";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Text,
  Image,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { RiSubtractFill } from "react-icons/ri";
import { GoUnlink } from "react-icons/go";
import debounce from "lodash/debounce";

import { Channel, GetUserQuery, Maybe, Scalars } from "../../generated/graphql";
import { TransactionModalTemplate } from "../../components/transactions/TransactionModalTemplate";
import {
  // GET_DOES_USER_ADDRESS_MATCH_QUERY,
  GET_USER_QUERY,
} from "../../constants/queries";
import centerEllipses from "../../utils/centerEllipses";
import { Tos } from "../../components/general/Tos";
import { TurnOnNotificationsModal } from "../../components/mobile/TurnOnNotificationsModal";
import { useApolloContext } from "./useApollo";
import { useAccount, useSignMessage } from "wagmi";
import { useSetActiveWallet } from "@privy-io/wagmi";
import usePostStreamInteraction from "../server/usePostStreamInteraction";
// import { FaExclamationTriangle } from "react-icons/fa";

// const FETCH_TRIES = 3;

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
  ready: boolean;
  authenticated: boolean;
  isManagingWallets: boolean;
  fetchingUser: boolean;
  doesUserAddressMatch: boolean | undefined;
  fetchUser: () => any;
  login: () => void;
  connectWallet: () => void;
  logout: () => void;
  exportWallet: () => Promise<void>;
  handleIsManagingWallets: (value: boolean) => void;
}>({
  user: undefined,
  username: undefined,
  initialNotificationsGranted: false,
  wagmiAddress: undefined,
  ready: false,
  authenticated: false,
  isManagingWallets: false,
  fetchingUser: false,
  doesUserAddressMatch: undefined,
  fetchUser: () => undefined,
  login: () => undefined,
  connectWallet: () => undefined,
  logout: () => undefined,
  exportWallet: () => Promise.resolve(),
  handleIsManagingWallets: () => undefined,
});

export const UserProvider = ({
  children,
}: {
  children: JSX.Element[] | JSX.Element;
}) => {
  const { handleLatestVerifiedAddress } = useApolloContext();
  const { setActiveWallet } = useSetActiveWallet();
  const [user, setUser] = useState<DatabaseUser | undefined>(undefined);
  const [username, setUsername] = useState<string | undefined>();
  const [isManagingWallets, setIsManagingWallets] = useState(false);

  const [differentWallet, setDifferentWallet] = useState(false);
  const [initialNotificationsGranted, setInitialNotificationsGranted] =
    useState(false);
  const [fetchingUser, setFetchingUser] = useState(false);
  const [doesUserAddressMatch, setDoesUserAddressMatch] = useState<
    boolean | undefined
  >(undefined);

  const {
    address: wagmiAddress,
    isConnected,
    isConnecting,
    isDisconnected,
  } = useAccount();

  const { signMessage } = useSignMessage();
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
  const { wallets } = useWallets();

  const toast = useToast();
  const { postStreamInteraction } = usePostStreamInteraction({});
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
      // const foundWallet = wallets.find(
      //   (w) => w.address === (loginAccount as WalletWithMetadata)?.address
      // );
      // if (foundWallet) {
      //   setActiveWallet(foundWallet);
      // }
    },
    onError: (error) => {
      console.error("login error", error);
      // toast({
      //   render: () => (
      //     <Box as="button" borderRadius="md" bg="#b82929" p={4}>
      //       <Flex direction="column">
      //         <Text fontFamily={"LoRes15"} fontSize="20px">
      //           login error
      //         </Text>
      //         <Text>please copy error log to help developer diagnose</Text>
      //         <Button
      //           color="#b82929"
      //           width="100%"
      //           bg="white"
      //           onClick={() => {
      //             copy(error.toString());
      //             toast({
      //               title: "copied to clipboard",
      //               status: "success",
      //               duration: 2000,
      //               isClosable: true,
      //             });
      //           }}
      //           _focus={{}}
      //           _active={{}}
      //           _hover={{ background: "#f44343", color: "white" }}
      //         >
      //           copy error
      //         </Button>
      //       </Flex>
      //     </Box>
      //   ),
      //   duration: 12000,
      //   isClosable: true,
      //   position: "top",
      // });
    },
  });

  const { connectWallet } = useConnectWallet({
    onSuccess: (wallet) => {
      // const foundWallet = wallets.find((w) => w.address === wallet.address);
      // if (foundWallet) {
      //   console.log("ARC wallet connected", wallet, wallets);
      //   setActiveWallet(foundWallet);
      // }
    },
    onError: (err) => {
      console.error("connect wallet error", err);
      // toast({
      //   render: () => (
      //     <Box as="button" borderRadius="md" bg="#b82929" p={4}>
      //       <Flex direction="column">
      //         <Text fontFamily={"LoRes15"} fontSize="20px">
      //           connect wallet error
      //         </Text>
      //         <Text>please copy error log to help developer diagnose</Text>
      //         <Button
      //           color="#b82929"
      //           width="100%"
      //           bg="white"
      //           onClick={() => {
      //             copy(err.toString());
      //             toast({
      //               title: "copied to clipboard",
      //               status: "success",
      //               duration: 2000,
      //               isClosable: true,
      //             });
      //           }}
      //           _focus={{}}
      //           _active={{}}
      //           _hover={{ background: "#f44343", color: "white" }}
      //         >
      //           copy error
      //         </Button>
      //       </Flex>
      //     </Box>
      //   ),
      //   duration: 12000,
      //   isClosable: true,
      //   position: "top",
      // });
    },
  });

  const { logout } = useLogout();

  const [fetchUser] = useLazyQuery<GetUserQuery>(GET_USER_QUERY, {
    fetchPolicy: "network-only",
  });

  const client = useApolloClient();

  console.log(
    "ARC wagmiAddress",
    wagmiAddress,
    wallets,
    privyUser?.linkedAccounts
  );

  const debouncedSetActiveWallet = useMemo(
    () =>
      debounce((wallet: any) => {
        console.log("ARC setting active wallet", wallet);
        setActiveWallet(wallet);
      }, 500),
    [setActiveWallet]
  );

  useEffect(() => {
    if (wallets.length > 0) {
      debouncedSetActiveWallet(wallets[0]);
    }

    return () => {
      debouncedSetActiveWallet.cancel();
    };
  }, [wallets[0]?.address, debouncedSetActiveWallet]);

  useEffect(() => {
    const fetchUserData = async () => {
      setFetchingUser(true);
      if (!wagmiAddress) {
        setFetchingUser(false);
        return;
      }
      handleLatestVerifiedAddress(wagmiAddress);
      setDoesUserAddressMatch(undefined);
      let data;
      try {
        data = await fetchUser({
          variables: {
            data: {
              address: wagmiAddress,
            },
          },
        });
      } catch (e) {
        console.error("ARC fetching user data error", e);
      }
      console.log("ARC fetching user data...", wagmiAddress, data);
      if (data?.data?.getUser) {
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
        setUsername(
          data?.data?.getUser?.username ?? centerEllipses(wagmiAddress, 9)
        );
        // for (let i = 0; i < FETCH_TRIES; i++) {
        //   const { data: getDoesUserAddressMatchData } = await client.query({
        //     query: GET_DOES_USER_ADDRESS_MATCH_QUERY,
        //     variables: { data: { address: wagmiAddress } },
        //   });
        //   console.log(
        //     "ARC verified getDoesUserAddressMatchData",
        //     getDoesUserAddressMatchData,
        //     wagmiAddress,
        //     i
        //   );
        //   if (getDoesUserAddressMatchData?.getDoesUserAddressMatch) {
        //     setDoesUserAddressMatch(true);
        //     break;
        //   }
        //   await new Promise((resolve) => setTimeout(resolve, 2000));
        //   setDoesUserAddressMatch(false);
        // }
        console.log("ARC fetching finished");
      } else {
        console.error("user not found in database", data);
      }
      console.log("ARC fetching user done");
      setFetchingUser(false);
    };
    fetchUserData();
  }, [wagmiAddress]);

  const handleIsManagingWallets = useCallback((value: boolean) => {
    setIsManagingWallets(value);
  }, []);

  const value = useMemo(
    () => ({
      user,
      username,
      initialNotificationsGranted,
      wagmiAddress,
      ready,
      authenticated,
      isManagingWallets,
      fetchingUser,
      doesUserAddressMatch,
      fetchUser,
      login,
      connectWallet,
      logout,
      exportWallet,
      handleIsManagingWallets,
    }),
    [
      user,
      username,
      initialNotificationsGranted,
      ready,
      authenticated,
      isManagingWallets,
      fetchingUser,
      doesUserAddressMatch,
      wagmiAddress,
      fetchUser,
      login,
      connectWallet,
      logout,
      exportWallet,
      handleIsManagingWallets,
    ]
  );

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
        size="sm"
        hideFooter
      >
        <Flex direction={"column"} gap="5px">
          <Flex justifyContent={"space-between"}>
            <Text fontSize="10px">privy user id</Text>
            <Text fontSize="10px" color="#acacac">
              {privyUser?.id}
            </Text>
          </Flex>
          {privyUser?.linkedAccounts
            .filter((account) => account.type === "wallet")
            .map((account) => {
              return (
                <Flex
                  gap="5px"
                  background="rgba(0, 0, 0, 0.5)"
                  borderRadius="5px"
                  p="5px"
                  justifyContent={"space-between"}
                  alignItems={"center"}
                >
                  <Flex gap="5px" alignItems={"center"}>
                    {wallets.find((w) => w.address === account.address)?.meta
                      .icon ? (
                      <Image
                        src={
                          wallets.find((w) => w.address === account.address)
                            ?.meta.icon
                        }
                        alt="wallet image"
                        width="20px"
                        height="20px"
                      />
                    ) : (
                      <GoUnlink />
                    )}
                    <Text fontFamily={"LoRes15"}>
                      {centerEllipses(account.address, 13)}
                    </Text>
                  </Flex>
                  <Flex gap="5px" alignItems={"end"}>
                    {wagmiAddress === account.address ? (
                      <Flex gap="5px">
                        {/* {doesUserAddressMatch === false && (
                          <Tooltip
                            shouldWrapChildren
                            label="not synced with unlonely server"
                          >
                            <Flex
                              background="#ce3b1a"
                              alignItems="center"
                              borderRadius="5px"
                              px="5px"
                              height={"20px"}
                            >
                              <FaExclamationTriangle />
                            </Flex>
                          </Tooltip>
                        )} */}
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
                          const foundWallet = wallets.find(
                            (w) => w.address === account.address
                          );
                          if (foundWallet) {
                            setActiveWallet(foundWallet);
                          } else {
                            connectWallet({
                              suggestedAddress: account.address,
                              walletList:
                                account.walletClientType &&
                                isWalletListEntry(account.walletClientType)
                                  ? [account.walletClientType]
                                  : undefined,
                            });
                          }
                        }}
                      >
                        {wallets.find((w) => w.address === account.address)
                          ? "set active"
                          : "connect"}
                      </Button>
                    )}
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
                            account.address
                          );
                          console.log("newPrivyUser", newPrivyUser);
                        }}
                      />
                    </Tooltip>
                  </Flex>
                </Flex>
              );
            })}
          <Button onClick={() => signMessage({ message: "hello world" })}>
            test sign message
          </Button>
          {/* <Button
            onClick={async () => {
              // const { data: getDoesUserAddressMatchData } = await client.query({
              //   query: GET_DOES_USER_ADDRESS_MATCH_QUERY,
              //   variables: { data: { address: wagmiAddress } },
              // });
              // console.log(
              //   "ARC verified manual getDoesUserAddressMatchData",
              //   getDoesUserAddressMatchData
              // );
              // setDoesUserAddressMatch(
              //   getDoesUserAddressMatchData?.getDoesUserAddressMatch
              // );
              postStreamInteraction({
                interactionType: "test",
                channelId: "1",
              });
            }}
          >
            test backend
          </Button> */}
          <Button onClick={linkWallet}>link new wallet</Button>
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
      <Tos />
      {children}
    </UserContext.Provider>
  );
};
