import { useLazyQuery, useQuery } from "@apollo/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Flex, Text, useDisclosure, useToast } from "@chakra-ui/react";
import { isAddressEqual } from "viem";

import {
  GET_ALL_DEVICE_TOKENS,
  GET_ALL_USERS_WITH_CHANNEL,
} from "../../constants/queries";
import { useUser } from "../../hooks/context/useUser";
import { GetAllDevicesQuery, User } from "../../generated/graphql";
import AppLayout from "../../components/layout/AppLayout";
import NextHead from "../../components/layout/NextHead";
import { WavyText } from "../../components/general/WavyText";
import { splitArray } from "../../utils/splitArray";

const inputStyle = {
  borderWidth: "1px",
  borderRadius: "10px",
  borderColor: "#4d679b",
  bg: "rgba(36, 79, 167, 0.05)",
  variant: "unstyled",
  px: "16px",
  py: "10px",
};

const BRIAN = "0x141Edb16C70307Cf2F0f04aF2dDa75423a0E1bEa";

type DeviceNotificationsType = {
  address?: string | null;
  token: string;
  notificationsLive: boolean;
  notificationsNFCs: boolean;
};

export default function MobileNotifications() {
  const { user } = useUser();
  const { error: authError, data: authData } = useQuery(
    GET_ALL_USERS_WITH_CHANNEL
  );
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    if (authData && user) {
      const authorizedUsers: User[] = authData.getAllUsersWithChannel.filter(
        (u: User) => u.address === user?.address
      );
      const isAuthenticated = authorizedUsers.length > 0;
      setIsAuthed(isAuthenticated);
      setIsAuthLoading(false);
    }
  }, [authData, user]);

  return (
    <AppLayout isCustomHeader={false}>
      <Flex direction="column" alignItems={"center"}>
        <NextHead title="Push Notifications" description="send em" image="" />
        {!isAuthLoading && isAuthed && !authError && user ? (
          <MainContent />
        ) : (
          <Flex
            alignItems={"center"}
            justifyContent={"center"}
            width="100%"
            height="calc(100vh - 64px)"
            fontSize="50px"
          >
            {!user ? (
              <Text fontFamily="Neue Pixel Sans">
                Unauthenticated. Please connect wallet to continue.
              </Text>
            ) : authError ? (
              <Text fontFamily="Neue Pixel Sans">
                server authentication error, please try again later
              </Text>
            ) : (
              <WavyText text="authenticating..." />
            )}
          </Flex>
        )}
      </Flex>
    </AppLayout>
  );
}

function MainContent() {
  const [getAllDeviceTokens, { loading, data }] =
    useLazyQuery<GetAllDevicesQuery>(GET_ALL_DEVICE_TOKENS, {
      fetchPolicy: "no-cache",
    });
  const { user } = useUser();
  const [isSending, setIsSending] = useState(false);
  const [selectedType, setSelectedType] = useState("live");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const isBrian = useMemo(
    () =>
      user?.address
        ? isAddressEqual(user?.address as `0x${string}`, BRIAN)
        : false,
    [user?.address]
  );

  const titleLive = useMemo(() => {
    return `🔴 ${user?.channel?.[0]?.slug} is live on unlonely!`;
  }, [user]);

  const [titleNFCs, setTitleNFCs] = useState("new NFCs just dropped");
  const [bodyLive, setBodyLive] = useState("join the stream and hang out");
  const [bodyNFCs, setBodyNFCs] = useState(
    "watch some highlights from recent streams"
  );

  const devices = useMemo(() => {
    if (!data?.getAllDevices) return [];
    return data?.getAllDevices.filter(
      (device): device is DeviceNotificationsType => device !== null
    );
  }, [data]);

  const devicesWithLive = useMemo(() => {
    return devices?.filter((device) => {
      if (device?.notificationsLive) return device;
    });
  }, [devices]);

  const devicesWithNFCs = useMemo(() => {
    return devices?.filter((device) => {
      if (device?.notificationsNFCs) return device;
    });
  }, [devices]);

  const sendNotifications = useCallback(async () => {
    if (isSending) return;
    const devices = selectedType === "live" ? devicesWithLive : devicesWithNFCs;

    const deviceChunks = splitArray<DeviceNotificationsType>(devices, 20);
    deviceChunks.forEach(async (chunk) => {
      const tokens: string[] = [];
      const templates: {
        to: string;
        title: string;
        body: string;
        sound: string;
        data: any;
        channelId: string;
      }[] = [];

      // looping through each device in the array of 20
      chunk.forEach((d: DeviceNotificationsType) => {
        tokens.push(d.token);
      });

      // preparing notification templates for every token from a single chunk
      // sending requests to all tokens of 20 users at once from a single chunk
      tokens.forEach((token) => {
        templates.push({
          to: token,
          title: selectedType === "live" ? titleLive : titleNFCs,
          body: selectedType === "live" ? bodyLive : bodyNFCs,
          sound: "default",
          data: {
            redirect: selectedType === "live" ? "live" : "nfc",
          },
          channelId: selectedType === "live" ? "Live" : "NFC",
        });
      });

      const chunkedTemplates = splitArray(templates, 100);

      chunkedTemplates.forEach(async (template, index) => {
        const req = await fetch(
          "https://mysterious-stream-82183.herokuapp.com/https://exp.host/--/api/v2/push/send",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(template),
          }
        );

        if (req.ok) {
          toast({
            id: new Date().getMilliseconds(),
            title: `batch notification sent to ${template.length} devices`,
            status: "success",
            duration: 6000,
            isClosable: true,
          });

          if (chunkedTemplates.length === index + 1) {
            setIsSending(false);
            onClose();
          }
        }

        if (!req.ok) {
          toast({
            id: new Date().getMilliseconds(),
            title: `failed to send notifications to ${template.length} devices`,
            status: "error",
            duration: 6000,
            isClosable: true,
          });
        }
      });
    });
  }, [selectedType, devicesWithLive, devicesWithNFCs]);

  useEffect(() => {
    getAllDeviceTokens();
  }, []);

  return (
    <Flex
      alignItems={"center"}
      justifyContent={"center"}
      height="calc(100vh - 64px)"
      fontSize="50px"
      direction="column"
      gap="40px"
    >
      <Flex
        alignItems={"center"}
        justifyContent={"center"}
        width="100%"
        height="calc(100vh - 64px)"
        gap="20px"
        px="1rem"
        direction="column"
      >
        <Text fontFamily={"Neue Pixel Sans"}>Why am I seeing this?</Text>
        <Text fontSize="20px">
          Hi! We've deprecated this page and moved the notification pushing
          feature to your channel page for better streamer experience
        </Text>
      </Flex>
    </Flex>
  );
}
