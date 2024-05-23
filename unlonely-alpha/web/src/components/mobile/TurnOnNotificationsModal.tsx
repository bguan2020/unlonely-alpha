import { Button, Flex, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import usePostSubscription from "../../hooks/server/usePostSubscription";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { useUser } from "../../hooks/context/useUser";

export const TurnOnNotificationsModal = ({
  handleInitialNotificationsGranted,
}: {
  handleInitialNotificationsGranted: (granted: boolean) => void;
}) => {
  const { isStandalone } = useUserAgent();

  const { ready, authenticated, login } = useUser();

  const [showTurnOnNotifications, setShowTurnOnNotificationsModal] = useState<
    "off" | "start" | "loading" | "granted" | "denied"
  >("off");

  const { postSubscription } = usePostSubscription({
    onError: () => {
      console.error("Failed to save subscription to server.");
    },
  });

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
            if (result === "granted") handleInitialNotificationsGranted(true);
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
    if (!ready || !isStandalone) return;
    if ("Notification" in window && Notification.permission === "default") {
      setShowTurnOnNotificationsModal("start");
    } else {
      if (!authenticated) login();
    }
  }, [isStandalone, ready, authenticated]);

  return (
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
  );
};
