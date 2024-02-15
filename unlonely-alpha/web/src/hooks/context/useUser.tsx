import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import {
  ConnectedWallet,
  usePrivy,
  useWallets,
  WalletWithMetadata,
} from "@privy-io/react-auth";
import { usePrivyWagmi } from "@privy-io/wagmi-connector";
import { Box, Button, Flex, Text, IconButton, Image } from "@chakra-ui/react";
import Link from "next/link";
import { isAddress } from "viem";

import { User } from "../../generated/graphql";
import { TransactionModalTemplate } from "../../components/transactions/TransactionModalTemplate";
import usePostSubscription from "../server/usePostSubscription";
import useUserAgent from "../internal/useUserAgent";
import { GET_USER_QUERY } from "../../constants/queries";
import centerEllipses from "../../utils/centerEllipses";

export const useUser = () => {
  return useContext(UserContext);
};

const UserContext = createContext<{
  user?: User;
  username?: string;
  userAddress?: `0x${string}`;
  walletIsConnected: boolean;
  loginMethod?: string;
  initialNotificationsGranted: boolean;
  activeWallet?: ConnectedWallet;
  fetchUser: () => void;
}>({
  user: undefined,
  username: undefined,
  userAddress: undefined,
  walletIsConnected: false,
  loginMethod: undefined,
  initialNotificationsGranted: false,
  activeWallet: undefined,
  fetchUser: () => undefined,
});

export const UserProvider = ({
  children,
}: {
  children: JSX.Element[] | JSX.Element;
}) => {
  const { isStandalone } = useUserAgent();
  const [user, setUser] = useState<User | undefined>(undefined);
  const [username, setUsername] = useState<string | undefined>();
  const { ready, authenticated, user: privyUser, logout, login } = usePrivy();
  const { wallet: activeWallet } = usePrivyWagmi();
  const { wallets } = useWallets();
  const [differentWallet, setDifferentWallet] = useState(false);
  const [showTurnOnNotifications, setShowTurnOnNotificationsModal] = useState<
    "off" | "start" | "loading" | "granted" | "denied"
  >("off");
  const [initialNotificationsGranted, setInitialNotificationsGranted] =
    useState(false);

  const [tosPopupCookie, setTosPopupCookie] = useState(null);
  const [tosPopup, setTosPopup] = useState(false);

  const { postSubscription } = usePostSubscription({
    onError: () => {
      console.error("Failed to save subscription to server.");
    },
  });

  const loginMethod = useMemo(() => {
    const wallet = privyUser?.linkedAccounts?.find(
      (account): account is WalletWithMetadata =>
        account.type === "wallet" && "walletClientType" in account
    );
    if (!wallet) return undefined;
    return wallet.walletClientType;
  }, [privyUser]);

  const address = useMemo(() => {
    const filteredWallets = wallets?.filter(
      (wallet) => wallet.walletClientType !== "privy"
    );
    const firstWallet = filteredWallets?.[0];
    const isInLinkedAccounts = privyUser?.linkedAccounts?.find(
      (account) =>
        account.type === "wallet" && account.address === firstWallet?.address
    );
    if (isInLinkedAccounts) return firstWallet?.address;

    const firstWalletFromFullArray = wallets?.[0];
    const isInLinkedAccountsFromFullArray = privyUser?.linkedAccounts?.find(
      (account) =>
        account.type === "wallet" &&
        account.address === firstWalletFromFullArray?.address
    );
    if (isInLinkedAccountsFromFullArray)
      return firstWalletFromFullArray?.address;

    return wallets?.[0]?.address;
  }, [wallets, privyUser?.linkedAccounts]);

  const [fetchUser, { data }] = useLazyQuery(GET_USER_QUERY, {
    variables: { data: { address } },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!address) return;
    fetchUser();
  }, [address]);

  const walletIsConnected = useMemo(() => {
    const auth =
      authenticated && activeWallet !== undefined && user !== undefined;
    const matchingWallet = activeWallet?.address === address;
    return auth && matchingWallet;
  }, [authenticated, activeWallet, user, address]);

  const handleMobileNotifications = async () => {
    if ("serviceWorker" in navigator && "Notification" in window) {
      try {
        setShowTurnOnNotificationsModal("loading");
        const registration = await navigator.serviceWorker.register(
          "/serviceworker.js",
          {
            scope: "/",
          }
        );

        if (Notification.permission === "default") {
          // add 1 second delay to make sure service worker is ready
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const result = await window.Notification.requestPermission();
          if (result === "granted") {
            console.log("Notification permission granted");
            await registration.showNotification("Welcome to Unlonely", {
              body: "Excited to have you here!",
            });

            // Here's where you send the subscription to your server
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            });
            const subscriptionJSON = subscription.toJSON();
            if (subscriptionJSON) {
              await postSubscription({
                endpoint: subscriptionJSON.endpoint,
                expirationTime: null,
                p256dh: subscriptionJSON.keys?.p256dh,
                auth: subscriptionJSON.keys?.auth,
              });
            } else {
              console.error("Failed to get subscription from service worker.");
            }
          }
          if (result === "granted" || result === "denied") {
            setShowTurnOnNotificationsModal(result);
            if (result === "granted") setInitialNotificationsGranted(true);
          }
        }
        // If permission is "denied", you can handle it as needed. For example, showing some UI/UX elements guiding the user on how to enable notifications from browser settings.
        // If permission is "granted", it means the user has already enabled notifications.
        else if (Notification.permission === "denied") {
          // tslint:disable-next-line:no-console
          console.log("Notification permission denied");
          setShowTurnOnNotificationsModal("denied");
        } else if (Notification.permission === "granted") {
          // tslint:disable-next-line:no-console
          console.log("Notification permission granted");
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          });
          const subscriptionJSON = subscription.toJSON();
          if (subscriptionJSON) {
            await postSubscription({
              endpoint: subscriptionJSON.endpoint,
              expirationTime: null,
              p256dh: subscriptionJSON.keys?.p256dh,
              auth: subscriptionJSON.keys?.auth,
            });
          } else {
            console.error("Failed to get subscription from service worker.");
          }
          setShowTurnOnNotificationsModal("granted");
        }
      } catch (error) {
        console.error(
          "Error registering service worker or requesting permission:",
          error
        );
        console.log("error", error);
        setShowTurnOnNotificationsModal("off");
      } finally {
        setTimeout(() => {
          setShowTurnOnNotificationsModal("off");
          login();
        }, 2000);
      }
    }
  };

  useEffect(() => {
    setUser(data?.getUser);
    setUsername(data?.getUser?.username ?? centerEllipses(address, 9));
  }, [data, address]);

  useEffect(() => {
    const f = async () => {
      const isUsingDifferentWallet =
        user?.address !== undefined &&
        isAddress(activeWallet?.address as `${string}`) &&
        activeWallet?.address !== user?.address;
      setDifferentWallet(isUsingDifferentWallet);
    };
    f();
  }, [activeWallet, user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const value = localStorage.getItem("unlonely-tos-popup");
      setTosPopupCookie(value ? JSON.parse(value) : null);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setTosPopup(true);
    }, 2000);
  }, []);

  useEffect(() => {
    if (!ready || !isStandalone) return;
    if ("Notification" in window && Notification.permission === "default") {
      setShowTurnOnNotificationsModal("start");
    } else {
      if (!authenticated) login();
    }
  }, [isStandalone, ready, authenticated]);

  const value = useMemo(
    () => ({
      user,
      username,
      userAddress: address as `0x${string}`,
      walletIsConnected,
      loginMethod,
      initialNotificationsGranted,
      activeWallet,
      fetchUser,
    }),
    [
      user,
      username,
      address,
      walletIsConnected,
      loginMethod,
      showTurnOnNotifications,
      initialNotificationsGranted,
      activeWallet,
      fetchUser,
    ]
  );

  return (
    <UserContext.Provider value={value}>
      <TransactionModalTemplate
        title={
          showTurnOnNotifications === "start" ||
          showTurnOnNotifications === "loading"
            ? "turning on notifications"
            : ""
        }
        confirmButton=""
        isOpen={showTurnOnNotifications !== "off"}
        handleClose={() => setShowTurnOnNotificationsModal("off")}
        canSend={true}
        onSend={handleMobileNotifications}
        isModalLoading={showTurnOnNotifications === "loading"}
        hideFooter
        cannotClose
        loadingText="setting up notifications on your device"
        size="sm"
        blur
      >
        {showTurnOnNotifications === "start" && (
          <Flex direction="column" gap="16px">
            <Text textAlign={"center"} fontSize="15px" color="#BABABA">
              We recommend turning on notifications so you know when livestreams
              start!
            </Text>
            <Button
              color="white"
              bg="#257ce0"
              _hover={{}}
              _focus={{}}
              _active={{}}
              width="100%"
              onClick={handleMobileNotifications}
            >
              get started
            </Button>
          </Flex>
        )}
        {showTurnOnNotifications === "granted" && (
          <Flex direction="column" gap="16px">
            <Text textAlign={"center"} fontSize="15px">
              You're all set up to receive notifications!
            </Text>
          </Flex>
        )}
        {showTurnOnNotifications === "denied" && (
          <Flex direction="column" gap="16px">
            <Text textAlign={"center"} fontSize="15px">
              Ok! You can enable notifications in your profile later!
            </Text>
          </Flex>
        )}
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
              connected {activeWallet?.address}
            </Text>
          </Box>
          <Text textAlign={"center"} fontSize="15px">
            to resolve, switch back to the original wallet account or logout
          </Text>
        </Flex>
      </TransactionModalTemplate>
      {tosPopup && !isStandalone && !tosPopupCookie && (
        <Flex
          position="fixed"
          bottom="0"
          bg="black"
          zIndex="20"
          width="100%"
          justifyContent={"center"}
        >
          <Text textAlign={"center"} my="auto">
            By using Unlonely, you agree to our{" "}
            <span
              style={{
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              <Link
                href={"https://www.unlonely.app/privacy"}
                target="_blank"
                passHref
              >
                Privacy Policy
              </Link>
            </span>{" "}
            and{" "}
            <span
              style={{
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              <Link
                href={
                  "https://super-okra-6ad.notion.site/Unlonely-Terms-of-Service-b3c0ea0272c943e98e3120243955cd75"
                }
                target="_blank"
                passHref
              >
                Terms of Service
              </Link>
            </span>
            .
          </Text>
          <IconButton
            aria-label="close"
            _hover={{}}
            _active={{}}
            _focus={{}}
            bg="transparent"
            icon={<Image alt="close" src="/svg/close.svg" width="20px" />}
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.setItem(
                  "unlonely-tos-popup",
                  JSON.stringify(true)
                );
              }
              setTosPopup(false);
            }}
            height="30px"
          />
        </Flex>
      )}
      {children}
    </UserContext.Provider>
  );
};
