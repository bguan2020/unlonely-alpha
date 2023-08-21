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
import { isAddressEqual } from "viem";

import { SEND_ALL_NOTIFICATIONS_QUERY } from "../../constants/queries";
import { QuerySendAllNotificationsArgs } from "../../generated/graphql";
import { useUser } from "../../hooks/context/useUser";
import useUserAgent from "../../hooks/internal/useUserAgent";
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
  const [call, { loading: sendLoading, data: sendData }] =
    useLazyQuery<QuerySendAllNotificationsArgs>(SEND_ALL_NOTIFICATIONS_QUERY, {
      fetchPolicy: "network-only",
    });

  const { user } = useUser();
  const [isSending, setIsSending] = useState(false);
  const [selectedType, setSelectedType] = useState("live");
  const toast = useToast();
  const { isStandalone } = useUserAgent();

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

  const sendNotifications = useCallback(async () => {
    setIsSending(true);
    try {
      await call({
        variables: {
          data: {
            title: selectedType === "live" ? titleLive : titleNFCs,
            body: selectedType === "live" ? bodyLive : bodyNFCs,
          },
        },
      });
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
  }, [selectedType, titleLive, titleNFCs, bodyLive, bodyNFCs]);

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
            disabled={isSending || (bodyLive === "" && selectedType === "live")}
          >
            <Text fontSize="30px">send</Text>
          </Button>
        </Box>
      </>
    </TransactionModalTemplate>
  );
}
