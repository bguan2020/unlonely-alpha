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
import { Box, Button, Flex, Spinner, Text, useToast } from "@chakra-ui/react";

import { Channel, GetUserQuery, Maybe, Scalars } from "../../generated/graphql";
import { TransactionModalTemplate } from "../../components/transactions/TransactionModalTemplate";
import {
  GET_DOES_USER_ADDRESS_MATCH_QUERY,
  GET_USER_QUERY,
} from "../../constants/queries";
import centerEllipses from "../../utils/centerEllipses";
import { Tos } from "../../components/general/Tos";
import { TurnOnNotificationsModal } from "../../components/mobile/TurnOnNotificationsModal";
import copy from "copy-to-clipboard";
import { useApolloContext } from "./useApollo";
import { useAccount, useSignMessage } from "wagmi";
import { useSetActiveWallet } from "@privy-io/wagmi";

const FETCH_TRIES = 3;

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

  const { authenticated, ready, exportWallet, linkWallet, unlinkWallet } =
    usePrivy();
  const { wallets, ready: walletsReady } = useWallets();

  const toast = useToast();
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
      toast({
        render: () => (
          <Box as="button" borderRadius="md" bg="#b82929" p={4}>
            <Flex direction="column">
              <Text fontFamily={"LoRes15"} fontSize="20px">
                login error
              </Text>
              <Text>please copy error log to help developer diagnose</Text>
              <Button
                color="#b82929"
                width="100%"
                bg="white"
                onClick={() => {
                  copy(error.toString());
                  toast({
                    title: "copied to clipboard",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                  });
                }}
                _focus={{}}
                _active={{}}
                _hover={{ background: "#f44343", color: "white" }}
              >
                copy error
              </Button>
            </Flex>
          </Box>
        ),
        duration: 12000,
        isClosable: true,
        position: "top",
      });
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
      toast({
        render: () => (
          <Box as="button" borderRadius="md" bg="#b82929" p={4}>
            <Flex direction="column">
              <Text fontFamily={"LoRes15"} fontSize="20px">
                connect wallet error
              </Text>
              <Text>please copy error log to help developer diagnose</Text>
              <Button
                color="#b82929"
                width="100%"
                bg="white"
                onClick={() => {
                  copy(err.toString());
                  toast({
                    title: "copied to clipboard",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                  });
                }}
                _focus={{}}
                _active={{}}
                _hover={{ background: "#f44343", color: "white" }}
              >
                copy error
              </Button>
            </Flex>
          </Box>
        ),
        duration: 12000,
        isClosable: true,
        position: "top",
      });
    },
  });

  const { logout } = useLogout({
    onSuccess: () => {
      setUser(undefined);
      setUsername(undefined);
    },
  });

  const [fetchUser] = useLazyQuery<GetUserQuery>(GET_USER_QUERY, {
    fetchPolicy: "network-only",
  });

  const client = useApolloClient();

  // useEffect(() => {
  //   if (wallets.length > 0) {
  //     console.log("ARC setting active wallet", wallets[0]);
  //     setActiveWallet(wallets[0]); // not updating wagmiAddress properly
  //   }
  // }, [wallets[0]?.address]);

  console.log("ARC wagmiAddress", wagmiAddress, wallets);

  useEffect(() => {
    const fetchUserData = async () => {
      setFetchingUser(true);
      if (!wagmiAddress) {
        setFetchingUser(false);
        return;
      }
      handleLatestVerifiedAddress(wagmiAddress);
      setDoesUserAddressMatch(true);
      const data = await fetchUser({
        variables: {
          data: {
            address: wagmiAddress,
          },
        },
      });
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
        for (let i = 0; i < FETCH_TRIES; i++) {
          const { data: getDoesUserAddressMatchData } = await client.query({
            query: GET_DOES_USER_ADDRESS_MATCH_QUERY,
            variables: { data: { address: wagmiAddress } },
          });
          console.log(
            "ARC verified getDoesUserAddressMatchData",
            getDoesUserAddressMatchData,
            i
          );
          if (getDoesUserAddressMatchData?.getDoesUserAddressMatch) {
            setDoesUserAddressMatch(true);
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 2000));
          setDoesUserAddressMatch(false);
        }
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
      wallets,
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
    ]
  );

  return (
    <UserContext.Provider value={value}>
      <TurnOnNotificationsModal
        handleInitialNotificationsGranted={handleInitialNotificationsGranted}
      />
      <TransactionModalTemplate
        title="manage your linked wallets"
        isOpen={isManagingWallets}
        handleClose={() => setIsManagingWallets(false)}
        isModalLoading={false}
        size="sm"
        hideFooter
      >
        <Flex direction={"column"} gap="5px">
          {fetchingUser ? (
            <Flex justifyContent={"center"}>
              <Spinner />
            </Flex>
          ) : (
            <>
              {doesUserAddressMatch ? (
                <Text color="green">user address matches</Text>
              ) : doesUserAddressMatch === false ? (
                <Text color="red">user address does not match</Text>
              ) : (
                <Text>waiting for user address match...</Text>
              )}
              {walletsReady &&
                wallets.map((wallet) => {
                  return (
                    <Flex gap="5px">
                      {wallet.address === wagmiAddress && (
                        <>
                          {isConnecting && <span>🟡</span>}
                          {isConnected && <span>🟢</span>}
                          {isDisconnected && <span>🔴</span>}
                        </>
                      )}
                      <Flex direction={"column"} gap="5px">
                        <Text>{centerEllipses(wallet.address, 10)}</Text>
                        <Text>{wallet.walletClientType}</Text>
                      </Flex>
                      <Button
                        onClick={() => {
                          setActiveWallet(wallet);
                        }}
                        isDisabled={wagmiAddress === wallet.address}
                      >
                        use
                      </Button>
                      <Button
                        onClick={() => {
                          unlinkWallet(wallet.address);
                        }}
                      >
                        unlink
                      </Button>
                    </Flex>
                  );
                })}
              <Button
                onClick={async () => {
                  setDoesUserAddressMatch(undefined);
                  const { data: getDoesUserAddressMatchData } =
                    await client.query({
                      query: GET_DOES_USER_ADDRESS_MATCH_QUERY,
                      variables: { data: { address: wallets[0].address } },
                    });
                  console.log(
                    "getDoesUserAddressMatchData",
                    getDoesUserAddressMatchData,
                    wallets
                  );
                  setDoesUserAddressMatch(
                    getDoesUserAddressMatchData?.getDoesUserAddressMatch
                  );
                }}
              >
                test backend
              </Button>
              <Button onClick={() => signMessage({ message: "hello world" })}>
                test sign message
              </Button>
              <Button onClick={linkWallet}>link wallet</Button>
            </>
          )}
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
