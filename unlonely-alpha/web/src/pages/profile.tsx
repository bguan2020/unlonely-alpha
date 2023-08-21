import { Spinner, Flex, Text, Avatar, Switch } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";

import AppLayout from "../components/layout/AppLayout";
import { useUser } from "../hooks/context/useUser";
import useUserAgent from "../hooks/internal/useUserAgent";
import { anonUrl } from "../components/presence/AnonUrl";
import centerEllipses from "../utils/centerEllipses";
import ConnectWallet from "../components/navigation/ConnectWallet";
import useToggleSubscription from "../hooks/server/useToggleSubscription";
import { CHECK_SUBSCRIPTION } from "../constants/queries";
import usePostSubscription from "../hooks/server/usePostSubscription";

const Profile = () => {
  const { user } = useUser();
  const { ready } = useUserAgent();
  const [endpoint, setEndpoint] = useState<string>("");
  const [systemNotifLoading, setSystemNotifLoading] = useState<boolean>(false);

  const [getSubscription, { loading, data }] = useLazyQuery(
    CHECK_SUBSCRIPTION,
    { fetchPolicy: "network-only" }
  );

  const { toggleSubscription } = useToggleSubscription({
    onError: () => {
      console.log("Failed to toggle subscription to server.");
    },
  });

  const { postSubscription } = usePostSubscription({
    onError: () => {
      console.error("Failed to save subscription to server.");
    },
  });

  const imageUrl = user?.FCImageUrl
    ? user.FCImageUrl
    : user?.lensImageUrl
    ? user.lensImageUrl
    : anonUrl;
  // if imageUrl begins with  ipfs://, convert to https://ipfs.io/ipfs/
  const ipfsUrl = imageUrl.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${imageUrl.slice(7)}`
    : imageUrl;

  // This function toggles the subscription
  const handleSwitchChange = useCallback(async () => {
    try {
      if (!endpoint) {
        setSystemNotifLoading(true);
        const registration = await navigator.serviceWorker.register(
          "/serviceworker.js",
          {
            scope: "/",
          }
        );
        await registration.showNotification("Welcome to Unlonely", {
          body: "Excited to have you here!",
        });
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });
        const subscriptionJSON = subscription.toJSON();
        if (subscriptionJSON) {
          postSubscription({
            endpoint: subscriptionJSON.endpoint,
            expirationTime: null,
            p256dh: subscriptionJSON.keys?.p256dh,
            auth: subscriptionJSON.keys?.auth,
          });
          setEndpoint(subscriptionJSON.endpoint ?? "");
        } else {
          console.error("Failed to get subscription from service worker.");
        }
        setSystemNotifLoading(false);
      } else {
        await toggleSubscription({ endpoint });
        handleGetSubscription();
      }
    } catch (err) {
      console.error("Error toggling subscription:", err);
    }
  }, [endpoint]);

  const handleGetSubscription = useCallback(() => {
    getSubscription({
      variables: { data: { endpoint } },
      fetchPolicy: "network-only",
    });
  }, [endpoint]);

  useEffect(() => {
    const init = async () => {
      if ("serviceWorker" in navigator) {
        const registrationExists =
          await navigator.serviceWorker.getRegistration("/");
        if (registrationExists) {
          const subscription =
            await registrationExists.pushManager.getSubscription();
          if (subscription) {
            const endpoint = subscription.endpoint;
            setEndpoint(endpoint);
          }
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (endpoint) {
      handleGetSubscription();
    }
  }, [endpoint]);

  return (
    <AppLayout isCustomHeader={false}>
      {ready ? (
        <Flex
          direction="column"
          width="100vw"
          position="relative"
          height="100%"
          p="15px"
        >
          <Text color="#e2f979" fontFamily="Neue Pixel Sans" fontSize={"25px"}>
            connected as
          </Text>
          <Flex justifyContent={"space-between"} alignItems="center" gap="10px">
            <Flex gap="10px">
              <Avatar
                name={user?.username ?? user?.address}
                src={ipfsUrl}
                size="md"
              />
              {user?.username ? (
                <Flex direction="column">
                  <Text>{user?.username}</Text>
                  <Text color="#9d9d9d">
                    {centerEllipses(user?.address, 13)}
                  </Text>
                </Flex>
              ) : (
                <Flex direction="column" justifyContent="center">
                  <Text color="#9d9d9d">
                    {centerEllipses(user?.address, 13)}
                  </Text>
                </Flex>
              )}
            </Flex>
            <ConnectWallet shouldSayDisconnect />
          </Flex>
          <Flex
            justifyContent={"space-between"}
            alignItems="center"
            mt="2rem"
            gap="10px"
          >
            <Text fontFamily="Neue Pixel Sans" fontSize={"25px"}>
              notifications
            </Text>
            {loading ? (
              <Spinner size="lg" />
            ) : (
              <Switch
                size="lg"
                isChecked={data?.checkSubscriptionByEndpoint ?? false}
                onChange={handleSwitchChange}
                isDisabled={
                  loading ||
                  systemNotifLoading ||
                  ("Notification" in window &&
                    Notification.permission === "denied")
                }
              />
            )}
          </Flex>
          {"Notification" in window && Notification.permission === "denied" && (
            <Text color="#f6ee04">
              please reset your device's settings on Unlonely's notifications
              first, then restart the app
            </Text>
          )}
        </Flex>
      ) : (
        <Spinner />
      )}
    </AppLayout>
  );
};

export default Profile;
