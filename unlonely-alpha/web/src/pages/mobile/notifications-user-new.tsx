import {
  GET_ALL_DEVICE_TOKENS,
  GET_ALL_USERS_WITH_CHANNEL,
} from "../../constants/queries";
import { useUser } from "../../hooks/context/useUser";
import { useLazyQuery, useQuery } from "@apollo/client";
import { User } from "../../generated/graphql";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Divider,
  Flex,
  Input,
  Progress,
  Tab,
  TabList,
  Tabs,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import NextHead from "../../components/layout/NextHead";
import { WavyText } from "../../components/general/WavyText";
import { splitArray } from "../../utils/splitArray";
import { isAddressEqual } from "viem";
import { PreviewNotification } from "../../components/mobile/PreviewNotification";

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
  address: string | null;
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
        {!isAuthLoading && isAuthed && !authError ? (
          <MainContent />
        ) : (
          <Flex
            alignItems={"center"}
            justifyContent={"center"}
            width="100%"
            height="calc(100vh - 64px)"
            fontSize="50px"
          >
            {isAuthLoading ? (
              <WavyText text="authenticating..." />
            ) : authError ? (
              <Text fontFamily="Neue Pixel Sans">
                server authentication error, please try again later
              </Text>
            ) : (
              <Text fontFamily="Neue Pixel Sans">
                Unauthenticated. Please connect wallet to continue.
              </Text>
            )}
          </Flex>
        )}
      </Flex>
    </AppLayout>
  );
}

function MainContent() {
  const [getAllDeviceTokens, { loading, data }] = useLazyQuery(
    GET_ALL_DEVICE_TOKENS,
    {
      fetchPolicy: "no-cache",
    }
  );
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
  // const isBrian = true;

  const titleLive = useMemo(() => {
    return `🔴 ${user?.username} is live on unlonely!`;
  }, [user]);

  const [titleNFCs, setTitleNFCs] = useState("new NFCs just dropped");
  const [bodyLive, setBodyLive] = useState("join the stream and hang out");
  const [bodyNFCs, setBodyNFCs] = useState(
    "watch some highlights from recent streams"
  );

  const devices = data?.getAllDevices;

  const devicesWithLive = useMemo(() => {
    if (data) {
      return devices.filter((device: DeviceNotificationsType) => {
        if (device.notificationsLive) return device;
      });
    }
    return [];
  }, [data]);

  const devicesWithNFCs = useMemo(() => {
    if (data) {
      return devices.filter((device: DeviceNotificationsType) => {
        if (device.notificationsNFCs) return device;
      });
    }
    return [];
  }, [data]);

  const sendNotifications = useCallback(async () => {
    if (isSending) return;
    const devices = selectedType === "live" ? devicesWithLive : devicesWithNFCs;

    const deviceChunks = splitArray(devices as [], 20);
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
      <AlertDialog
        motionPreset="slideInBottom"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>preview notification send</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            are you sure you wanna blast all these{" "}
            {selectedType === "live"
              ? devicesWithLive?.length
              : devicesWithNFCs?.length}{" "}
            users with a push notification?
            <Box h={4}></Box>
            <PreviewNotification
              selectedType={selectedType}
              titleLive={titleLive}
              titleNFCs={titleNFCs}
              bodyLive={bodyLive}
              bodyNFCs={bodyNFCs}
            />
            {isSending && (
              <Box pt={5}>
                <Progress
                  size="sm"
                  isIndeterminate
                  width="100%"
                  height="6px"
                  borderRadius="32px"
                />
                <Text fontSize="sm" color="red">
                  sending. do not close this window!
                </Text>
              </Box>
            )}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ref={cancelRef}
              onClick={onClose}
              disabled={isSending}
              colorScheme="blue"
            >
              not yet
            </Button>
            <Button
              colorScheme="red"
              ml={3}
              onClick={() => {
                setIsSending(true);
                // sendNotifications();
              }}
              disabled={isSending}
              isLoading={isSending}
              loadingText="sending..."
            >
              fully send it
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
          <Box borderRadius="10px" padding="16px" bg="#1F2D31" width="100%">
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
                  <Text fontSize="15px" color="#dadada">
                    description
                  </Text>
                  <Input
                    {...inputStyle}
                    defaultValue={bodyLive}
                    onChange={(event) => setBodyLive(event.target.value)}
                  />
                </Flex>
              )}
            </Flex>
            <Button
              onClick={onOpen}
              isLoading={loading}
              loadingText="fetching users"
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
              disabled={!data || loading || isSending}
            >
              <Text fontSize="30px">preview send</Text>
            </Button>
          </Box>
        </>
      ) : (
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          width="100%"
          height="calc(100vh - 64px)"
          fontSize="50px"
        >
          <WavyText text="fetching..." />
        </Flex>
      )}
    </Flex>
  );
}
