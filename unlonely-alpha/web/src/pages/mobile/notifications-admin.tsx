import {
  Box,
  Flex,
  Image,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import { gql, useLazyQuery } from "@apollo/client";

import { splitArray } from "../../utils/splitArray";
import AppLayout from "../../components/layout/AppLayout";

type DeviceNotificationsType = {
  address: string | null;
  token: string;
  notificationsLive: boolean;
  notificationsNFCs: boolean;
};

const GET_ALL_DEVICE_TOKENS = gql`
  query GetAllDevices {
    getAllDevices {
      token
      notificationsLive
      notificationsNFCs
      address
    }
  }
`;

export default function MobileNotifications() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const [isSending, setIsSending] = useState(false);
  const [selectedType, setSelectedType] = useState("live");
  const placeholderTitleLive = "🔴 brian is live on unlonely!";
  const placeholderBodyLive = "join the stream and hang out";
  const placeholderTitleNFCs = "new NFCs just dropped";
  const placeholderBodyNFCs = "watch some highlights from recent streams";
  const [titleLive, setTitleLive] = useState(placeholderTitleLive);
  const [titleNFCs, setTitleNFCs] = useState(placeholderTitleNFCs);
  const [bodyLive, setBodyLive] = useState(placeholderBodyLive);
  const [bodyNFCs, setBodyNFCs] = useState(placeholderBodyNFCs);
  const [getAllDeviceTokens, { loading, data }] = useLazyQuery(
    GET_ALL_DEVICE_TOKENS,
    {
      fetchPolicy: "no-cache",
    }
  );
  const devices = data?.getAllDevices;

  const devicesWithLive = devices?.filter((device: DeviceNotificationsType) => {
    if (device.notificationsLive) return device;
  });
  const devicesWithNFCs = devices?.filter((device: DeviceNotificationsType) => {
    if (device.notificationsNFCs) return device;
  });

  const sendNotifications = async () => {
    if (isSending) return;
    let devices: any;

    if (selectedType === "live") {
      devices = devicesWithLive;
    }

    if (selectedType === "nfc") {
      devices = devicesWithNFCs;
    }

    // all users are split into arrays of 20
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const deviceChunks = splitArray([devices], 20);

    // each array of 20 users is being looped over
    deviceChunks.forEach(async (chunk) => {
      const tokens: any[] = [];
      const templates: any[] = [];

      // looping through each user in the array of 20
      chunk.forEach((deviceChunk: any, index: number) => {
        // looping through each token in the user
        deviceChunk.forEach(
          (device: DeviceNotificationsType, deviceIndex: number) => {
            const deviceToken = device.token;
            tokens.push(deviceToken);
          }
        );
      });

      // preparing notification templates for every token from a single chunk
      // sending requests to all tokens of 20 users at once from a single chunk
      tokens.forEach((device) => {
        templates.push({
          to: device,
          title: selectedType === "live" ? titleLive : titleNFCs,
          body: selectedType === "live" ? bodyLive : bodyNFCs,
          sound: "default",
          data: {
            redirect: selectedType === "live" ? "live" : "nfc",
          },
          channelId: selectedType === "live" ? "Live" : "NFC",
        });
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
  };

  return (
    <AppLayout isCustomHeader={false}>
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
    </AppLayout>
  );
}

const PreviewNotification = ({
  selectedType,
  titleLive,
  titleNFCs,
  bodyLive,
  bodyNFCs,
}: {
  selectedType: string;
  titleLive: string;
  titleNFCs: string;
  bodyLive: string;
  bodyNFCs: string;
}) => (
  <Box
    backdropBlur={"6px"}
    backgroundColor="rgba(0,0,0,0.8)"
    padding="16px"
    borderRadius={"26px"}
    width={["100%", "390px"]}
  >
    <Flex alignItems={"center"}>
      <Image
        src="https://imgur.com/RiQqM30.png"
        w="40px"
        borderRadius={"10px"}
      ></Image>
      <Box pl={3} w="100%">
        <Flex justifyContent={"space-between"} w="100%">
          <Text
            fontSize="md"
            color="gray.500"
            fontWeight={"bold"}
            fontFamily="system-ui"
            lineHeight={1.2}
            noOfLines={1}
          >
            {selectedType === "live" ? titleLive : titleNFCs}
          </Text>
          <Text
            fontSize="md"
            color="gray.700"
            fontFamily="system-ui"
            lineHeight={1.2}
            textAlign={"right"}
            pl="30px"
          >
            now
          </Text>
        </Flex>
        <Text
          fontSize="md"
          color="gray.500"
          fontFamily="system-ui"
          lineHeight={1.2}
          noOfLines={4}
          pt={"2px"}
          pr={
            bodyLive.length > 75
              ? "56px"
              : "0px" || bodyNFCs.length > 75
              ? "56px"
              : "0px"
          }
        >
          {selectedType === "live" ? bodyLive : bodyNFCs}
        </Text>
      </Box>
    </Flex>
  </Box>
);
