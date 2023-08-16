import { useLazyQuery } from "@apollo/client";
import {
  useToast,
  useDisclosure,
  Tabs,
  Text,
  Flex,
  Box,
  Button,
  Divider,
  Input,
  Tab,
  TabList,
  // AlertDialog,
  // AlertDialogBody,
  // AlertDialogCloseButton,
  // AlertDialogContent,
  // AlertDialogFooter,
  // AlertDialogHeader,
  // AlertDialogOverlay,
  // Progress,
} from "@chakra-ui/react";
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { isAddressEqual } from "viem";

import { GET_ALL_DEVICE_TOKENS } from "../../constants/queries";
import { GetAllDevicesQuery } from "../../generated/graphql";
import { useUser } from "../../hooks/context/useUser";
import { splitArray } from "../../utils/splitArray";
import { WavyText } from "../general/WavyText";
import { PreviewNotification } from "../mobile/PreviewNotification";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";

const inputStyle = {
  borderWidth: "1px",
  borderRadius: "10px",
  borderColor: "#51bfe0",
  bg: "rgba(36, 79, 167, 0.05)",
  variant: "unstyled",
  px: "16px",
  py: "10px",
  boxShadow: "0px 0px 8px #4388b6",
};

const BRIAN = "0x141Edb16C70307Cf2F0f04aF2dDa75423a0E1bEa";

type DeviceNotificationsType = {
  address?: string | null;
  token: string;
  notificationsLive: boolean;
  notificationsNFCs: boolean;
};

export default function NotificationsModal({
  title,
  isOpen,
  callback,
  handleClose,
}: {
  title: string;
  isOpen: boolean;
  callback?: any;
  handleClose: () => void;
}) {
  const [getAllDeviceTokens, { loading, data }] =
    useLazyQuery<GetAllDevicesQuery>(GET_ALL_DEVICE_TOKENS, {
      fetchPolicy: "no-cache",
    });
  const { user } = useUser();
  const [isSending, setIsSending] = useState(false);
  const [selectedType, setSelectedType] = useState("live");
  const toast = useToast();
  const { isOpen: isAlertOpen, onOpen, onClose } = useDisclosure();
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
  const [bodyLive, setBodyLive] = useState("");
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
            handleClose();
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
  }, [
    selectedType,
    devicesWithLive,
    devicesWithNFCs,
    titleLive,
    titleNFCs,
    bodyLive,
    bodyNFCs,
  ]);

  useEffect(() => {
    getAllDeviceTokens();
  }, []);

  return (
    <TransactionModalTemplate
      title={title}
      isOpen={isOpen}
      handleClose={handleClose}
      confirmButton={"confirm"}
      hideFooter
      isModalLoading={isSending}
      loadingText={"sending notifications..."}
    >
      {!loading && data ? (
        <>
          {isBrian && (
            <Tabs
              variant="soft-rounded"
              colorScheme="green"
              defaultIndex={0}
              onChange={(index) => {
                if (index === 0) {
                  setSelectedType("live");
                } else {
                  setSelectedType("nfc");
                }
              }}
            >
              <TabList>
                <Tab>going live</Tab>
                <Tab>new NFCs</Tab>
              </TabList>
            </Tabs>
          )}
          <Box
            borderWidth="1px"
            borderRadius="10px"
            padding="16px"
            borderColor="#dadada"
          >
            <Flex
              direction="row"
              justifyContent="space-between"
              pb="4px"
              gap="12px"
            >
              <Text color="#dadada" fontSize={"15px"}>
                # of users with notifications on
              </Text>
              <Text fontSize={"15px"}>{devices?.length}</Text>
            </Flex>
            <Divider />
            <Flex
              direction="row"
              justifyContent="space-between"
              pb="4px"
              gap="12px"
            >
              <Text color="#dadada" fontSize={"15px"}>
                going live
              </Text>
              <Text fontSize={"15px"}>{devicesWithLive?.length}</Text>
            </Flex>
          </Box>

          <Box
            borderRadius="10px"
            padding="16px"
            bg="#1F2D31"
            width="100%"
            borderColor="#dadada"
          >
            <Flex direction="column" mb="15px">
              {selectedType === "nfc" ? (
                <Flex direction="column" gap="20px">
                  <Flex direction="column" gap="10px">
                    <Text fontSize="15px" color="#bababa">
                      title
                    </Text>
                    <Input
                      {...inputStyle}
                      defaultValue={titleNFCs}
                      onChange={(event) => setTitleNFCs(event.target.value)}
                    />
                  </Flex>
                  <Flex direction="column" gap="10px">
                    <Text fontSize="15px" color="#bababa">
                      description
                    </Text>
                    <Input
                      {...inputStyle}
                      defaultValue={bodyNFCs}
                      onChange={(event) => setBodyNFCs(event.target.value)}
                    />
                  </Flex>
                </Flex>
              ) : (
                <Flex direction="column" gap="10px">
                  <Text fontSize="15px">enter a description</Text>
                  <Input
                    {...inputStyle}
                    placeholder="Ex. cooking stream"
                    _placeholder={{ color: "#bababa" }}
                    defaultValue={bodyLive}
                    onChange={(event) => setBodyLive(event.target.value)}
                  />
                </Flex>
              )}
            </Flex>
            <Flex direction="column" gap="10px">
              <Text fontSize="15px" color="#dadada">
                preview
              </Text>
              <PreviewNotification
                selectedType={selectedType}
                titleLive={titleLive}
                titleNFCs={titleNFCs}
                bodyLive={bodyLive}
                bodyNFCs={bodyNFCs}
              />
            </Flex>
            <Button
              mt={"15px"}
              onClick={() => {
                setIsSending(true);
                sendNotifications();
              }}
              isLoading={loading || isSending}
              loadingText="sending..."
              colorScheme={"blue"}
              py={10}
              _hover={{ transform: "scale(1.05)" }}
              _active={{
                transform: "scale(1)",
                background: "green",
              }}
              borderRadius="10px"
              _focus={{}}
              width="100%"
              disabled={
                !data ||
                loading ||
                isSending ||
                (bodyLive === "" && selectedType === "live")
              }
            >
              <Text fontSize="30px">send</Text>
            </Button>
          </Box>
        </>
      ) : (
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          width="100%"
          fontSize="50px"
        >
          <WavyText text="fetching..." />
        </Flex>
      )}
    </TransactionModalTemplate>
  );
}
