import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLazyQuery } from "@apollo/client";
import {
  ConnectedWallet,
  usePrivy,
  User as PrivyUser,
  useWallets,
  WalletWithMetadata,
  useLogin,
  useConnectWallet,
} from "@privy-io/react-auth";
import { Box, Button, Flex, Text, useToast } from "@chakra-ui/react";
import { isAddress, isAddressEqual } from "viem";

import { User } from "../../generated/graphql";
import { TransactionModalTemplate } from "../../components/transactions/TransactionModalTemplate";
import { GET_USER_QUERY } from "../../constants/queries";
import centerEllipses from "../../utils/centerEllipses";
import { Tos } from "../../components/general/Tos";
import { TurnOnNotificationsModal } from "../../components/mobile/TurnOnNotificationsModal";
import copy from "copy-to-clipboard";
import { useApolloContext } from "./useApollo";

export const useUser = () => {
  return useContext(UserContext);
};

const UserContext = createContext<{
  privyUser: PrivyUser | null;
  user?: User;
  username?: string;
  userAddress?: `0x${string}`;
  walletIsConnected: boolean;
  loginMethod?: string;
  initialNotificationsGranted: boolean;
  activeWallet?: ConnectedWallet;
  ready: boolean;
  authenticated: boolean;
  fetchUser: () => any;
  login: () => void;
  connectWallet: () => void;
  logout: () => void;
  exportWallet: () => Promise<void>;
}>({
  privyUser: null,
  user: undefined,
  username: undefined,
  userAddress: undefined,
  walletIsConnected: false,
  loginMethod: undefined,
  initialNotificationsGranted: false,
  activeWallet: undefined,
  ready: false,
  authenticated: false,
  fetchUser: () => undefined,
  login: () => undefined,
  connectWallet: () => undefined,
  logout: () => undefined,
  exportWallet: () => Promise.resolve(),
});

export const UserProvider = ({
  children,
}: {
  children: JSX.Element[] | JSX.Element;
}) => {
  const { handleLatestVerifiedAddress } = useApolloContext();
  const [user, setUser] = useState<User | undefined>(undefined);
  const [username, setUsername] = useState<string | undefined>();
  const {
    authenticated,
    user: privyUser,
    ready,
    logout,
    exportWallet,
  } = usePrivy();
  const { wallets } = useWallets();
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
        privyUser,
        user,
        ready
      );
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

  const [differentWallet, setDifferentWallet] = useState(false);
  const [initialNotificationsGranted, setInitialNotificationsGranted] =
    useState(false);

  const handleInitialNotificationsGranted = useCallback((granted: boolean) => {
    setInitialNotificationsGranted(granted);
  }, []);

  const loginMethod = useMemo(() => {
    const wallet = privyUser?.linkedAccounts?.find(
      (account): account is WalletWithMetadata =>
        account.type === "wallet" && "walletClientType" in account
    );
    if (!wallet) return undefined;
    return wallet.walletClientType;
  }, [privyUser]);

  const address = useMemo(() => {
    let foundWalletAddress: string | undefined;

    const filteredAccounts = privyUser?.linkedAccounts.filter(
      (a): a is WalletWithMetadata => a.type === "wallet"
    );

    for (const wallet of wallets) {
      if (
        filteredAccounts?.find((account) =>
          isAddressEqual(
            wallet.address as `0x${string}`,
            account.address as `0x${string}`
          )
        )
      ) {
        foundWalletAddress = wallet.address;
        break;
      }
    }

    return foundWalletAddress;
    // return logged in but no wallet found, meaning privyUser is defined
    // return not logged in at all, meaning privyUser is undefined
  }, [wallets, privyUser?.linkedAccounts]);

  const [fetchUser, { data }] = useLazyQuery(GET_USER_QUERY, {
    variables: { data: { address } },
    fetchPolicy: "network-only",
  });

  console.log("user", data);

  useEffect(() => {
    if (!address) return;
    fetchUser();
    handleLatestVerifiedAddress(address);
  }, [address]);

  const walletIsConnected = useMemo(() => {
    const auth =
      authenticated && wallets[0] !== undefined && user !== undefined;
    const matchingWallet = wallets[0]?.address === address;
    return auth && matchingWallet;
  }, [authenticated, wallets, user, address]);

  useEffect(() => {
    setUser(data?.getUser);
    setUsername(data?.getUser?.username ?? centerEllipses(address, 9));
  }, [data, address]);

  useEffect(() => {
    const f = async () => {
      const isUsingDifferentWallet =
        user?.address !== undefined &&
        isAddress(wallets[0]?.address as `${string}`) &&
        wallets[0]?.address !== user?.address;
      setDifferentWallet(isUsingDifferentWallet);
    };
    f();
  }, [wallets, user]);

  const value = useMemo(
    () => ({
      privyUser,
      user,
      username,
      userAddress: address as `0x${string}`,
      walletIsConnected,
      loginMethod,
      initialNotificationsGranted,
      activeWallet: wallets[0],
      ready,
      authenticated,
      fetchUser,
      login,
      connectWallet,
      logout,
      exportWallet,
    }),
    [
      privyUser,
      user,
      username,
      address,
      walletIsConnected,
      loginMethod,
      initialNotificationsGranted,
      wallets,
      ready,
      authenticated,
      fetchUser,
      login,
      connectWallet,
      logout,
      exportWallet,
    ]
  );

  return (
    <UserContext.Provider value={value}>
      <TurnOnNotificationsModal
        handleInitialNotificationsGranted={handleInitialNotificationsGranted}
      />
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
