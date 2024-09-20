import { useLazyQuery } from "@apollo/client";
import {
  useToast,
  Tabs,
  Text,
  Flex,
  Box,
  Button,
  Input,
  Tab,
  TabList,
} from "@chakra-ui/react";
import { useState, useMemo, useCallback } from "react";

import { SEND_ALL_NOTIFICATIONS_QUERY } from "../../constants/queries";
import { QuerySendAllNotificationsArgs } from "../../generated/graphql";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useUser } from "../../hooks/context/useUser";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { PreviewNotification } from "../mobile/PreviewNotification";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";
import { areAddressesEqual } from "../../utils/validation/wallet";

const BRIAN = "0xf6B640ED09927C90185D3a7aF4b186317Cc8df3e";

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
  const [call] = useLazyQuery<QuerySendAllNotificationsArgs>(
    SEND_ALL_NOTIFICATIONS_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

  const { user } = useUser();
  const { channel } = useChannelContext();
  const { channelQueryData } = channel;
  const [isSending, setIsSending] = useState(false);
  const [selectedType, setSelectedType] = useState("live");
  const toast = useToast();
  const { isStandalone } = useUserAgent();

  const isBrian = useMemo(() => {
    if (!user?.address) return false;
    return areAddressesEqual(BRIAN, user?.address);
  }, [user?.address]);

  const titleLive = useMemo(() => {
    return `🔴 ${user?.channel?.[0]?.slug} is live!`;
  }, [user]);

  const [titleNFCs, setTitleNFCs] = useState("new NFCs just dropped");
  const [bodyLive, setBodyLive] = useState("");
  const [bodyNFCs, setBodyNFCs] = useState(
    "watch some highlights from recent streams"
  );

  const sendNotifications = useCallback(async () => {
    if (channelQueryData?.id === undefined) return;
    setIsSending(true);
    try {
      const res = await call({
        variables: {
          data: {
            title: selectedType === "live" ? titleLive : titleNFCs,
            body: selectedType === "live" ? bodyLive : bodyNFCs,
            pathname: `/channels/${channelQueryData?.slug}`,
            channelId: channelQueryData?.id,
          },
        },
      });
      console.log("send all notifications:", res);
      toast({
        id: new Date().getMilliseconds(),
        title: "notification pushed!",
        status: "success",
        duration: 6000,
        isClosable: true,
      });
    } catch (e) {
      console.log("error", e);
      toast({
        id: new Date().getMilliseconds(),
        title: "notification failed",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    }
    setIsSending(false);
  }, [
    selectedType,
    titleLive,
    titleNFCs,
    bodyLive,
    bodyNFCs,
    channelQueryData,
  ]);

  return (
    <TransactionModalTemplate
      title={title}
      isOpen={isOpen}
      handleClose={handleClose}
      confirmButton={"confirm"}
      hideFooter
      isModalLoading={isSending}
      loadingText={"sending notifications..."}
      size={isStandalone ? "sm" : "md"}
    >
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
                    variant="glow"
                    defaultValue={titleNFCs}
                    onChange={(event) => setTitleNFCs(event.target.value)}
                  />
                </Flex>
                <Flex direction="column" gap="10px">
                  <Text fontSize="15px" color="#bababa">
                    description
                  </Text>
                  <Input
                    variant="glow"
                    defaultValue={bodyNFCs}
                    onChange={(event) => setBodyNFCs(event.target.value)}
                  />
                </Flex>
              </Flex>
            ) : (
              <Flex direction="column" gap="10px">
                <Text fontSize="15px">enter a description</Text>
                <Input
                  variant="glow"
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
            color="white"
            mt={"15px"}
            onClick={sendNotifications}
            isLoading={isSending}
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
            isDisabled={
              isSending || (bodyLive === "" && selectedType === "live")
            }
          >
            <Text fontSize="30px">send</Text>
          </Button>
        </Box>
      </>
    </TransactionModalTemplate>
  );
}
