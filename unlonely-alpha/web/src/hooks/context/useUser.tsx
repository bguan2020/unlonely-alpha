import { gql } from "@apollo/client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useEnsName } from "wagmi";
import { useQuery } from "@apollo/client";
import { usePrivy, useWallets, WalletWithMetadata } from "@privy-io/react-auth";
import { usePrivyWagmi } from "@privy-io/wagmi-connector";
import { Flex, Text } from "@chakra-ui/react";

import { User } from "../../generated/graphql";
import centerEllipses from "../../utils/centerEllipses";
import { TransactionModalTemplate } from "../../components/transactions/TransactionModalTemplate";
import usePostSubscription from "../server/usePostSubscription";
import useUserAgent from "../internal/useUserAgent";
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
  const { isStandalone } = useUserAgent();
  const [user, setUser] = useState<User | undefined>(undefined);
  const [username, setUsername] = useState<string | undefined>();
  const { ready, authenticated, user: privyUser, logout, login } = usePrivy();
  const { wallet: activeWallet } = usePrivyWagmi();
  const { wallets } = useWallets();
  const [differentWallet, setDifferentWallet] = useState(false);
  const [showTurnOnNotifications, setShowTurnOnNotificationsModal] =
    useState(false);
  const [error, setError] = useState<string>("notify");

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

  const address = useMemo(
    () => privyUser?.wallet?.address,
    [privyUser?.wallet?.address]
  );

  // ignore console log build error for now
  //
  const { data } = useQuery(GET_USER_QUERY, {
    variables: { data: { address } },
  });

  const { data: ensData } = useEnsName({
    address: address as `0x${string}`,
  });

  const walletIsConnected = useMemo(() => {
    const auth =
      authenticated && activeWallet !== undefined && user !== undefined;
    const matchingWallet = activeWallet?.address === address;
    return auth && matchingWallet;
  }, [authenticated, activeWallet, user, address]);

  const handleMobileNotifications = async () => {
    setError("notif1");
    if (user && "serviceWorker" in navigator && "Notification" in window) {
      setError("notif2");
      setError(`notif3 ${Notification.permission}`);
      try {
        const registration = await navigator.serviceWorker.register(
          "serviceworker.js",
          {
            scope: "./",
          }
        );

        if (Notification.permission === "default") {
          setError(`notif4`);
          // add 1 second delay to make sure service worker is ready
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const result = await window.Notification.requestPermission();
          setError("notif4-2");
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
            setError("notif4-3 ".concat(subscriptionJSON.endpoint ?? ""));
            console.log("subscription", subscription.toJSON());
            if (subscriptionJSON) {
              postSubscription({
                endpoint: subscriptionJSON.endpoint,
                expirationTime: null,
                p256dh: subscriptionJSON.keys?.p256dh,
                auth: subscriptionJSON.keys?.auth,
              });
            } else {
              console.error("Failed to get subscription from service worker.");
            }
          }
          // if (result === "granted" || result === "denied") {
          //   setShowTurnOnNotificationsModal(false);
          // }
          setError("notif4-4 ".concat(result));
        }
        // If permission is "denied", you can handle it as needed. For example, showing some UI/UX elements guiding the user on how to enable notifications from browser settings.
        // If permission is "granted", it means the user has already enabled notifications.
        if (Notification.permission === "denied") {
          // tslint:disable-next-line:no-console
          console.log("Notification permission denied");
          setError("notif5");
        }
        if (Notification.permission === "granted") {
          // tslint:disable-next-line:no-console
          console.log("Notification permission granted");
          setError("notif6");
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          });
          const subscriptionJSON = subscription.toJSON();
          setError("notif6-2 ".concat(subscriptionJSON.endpoint ?? ""));
          if (subscriptionJSON) {
            postSubscription({
              endpoint: subscriptionJSON.endpoint,
              expirationTime: null,
              p256dh: subscriptionJSON.keys?.p256dh,
              auth: subscriptionJSON.keys?.auth,
            });
          } else {
            console.error("Failed to get subscription from service worker.");
          }
        }
      } catch (error) {
        console.error(
          "Error registering service worker or requesting permission:",
          error
        );
        console.log("error", error);
      }
    }
  };

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
        user?.address &&
        activeWallet?.address &&
        activeWallet?.address !== user?.address
      ) {
        setDifferentWallet(true);
      } else {
        setDifferentWallet(false);
      }
    };
    f();
  }, [activeWallet, user]);

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

  useEffect(() => {
    if (!ready || !isStandalone) return;
    if (!authenticated) login();
  }, [ready, authenticated, isStandalone]);

  useEffect(() => {
    // if (
    //   user &&
    //   "Notification" in window &&
    //   Notification.permission === "default"
    // ) {
    // If notification permission is 'default', show the modal
    console.log("show modal");
    setShowTurnOnNotificationsModal(true);
    // }
  }, [user]);

  return (
    <UserContext.Provider value={value}>
      <TransactionModalTemplate
        title="turn on notifications for livestreams?"
        confirmButton="yes!"
        isOpen={showTurnOnNotifications}
        handleClose={() => setShowTurnOnNotificationsModal(false)}
        canSend={true}
        onSend={handleMobileNotifications}
        isModalLoading={false}
      />
      <TransactionModalTemplate
        confirmButton="logout"
        title="did you change wallet accounts?"
        isOpen={differentWallet}
        handleClose={() => setDifferentWallet(false)}
        canSend={true}
        onSend={logout}
        isModalLoading={false}
      >
        <Flex direction={"column"} gap="16px">
          <Text textAlign={"center"} fontSize="15px" color="#BABABA">
            our app thinks you're using two different wallet addresses, this can
            occur when you change wallet accounts while logged in
          </Text>
          <Text textAlign={"center"} fontSize="20px">
            to resolve, switch back to the original wallet account or logout
          </Text>
        </Flex>
      </TransactionModalTemplate>
      {children}
    </UserContext.Provider>
  );
};
