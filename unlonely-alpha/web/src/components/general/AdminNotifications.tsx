import { useLazyQuery } from "@apollo/client";
import { Box, Flex, useToast, Text, Input, Button } from "@chakra-ui/react";
import { useCallback, useState } from "react";

import { SEND_ALL_NOTIFICATIONS_QUERY } from "../../constants/queries";
import { QuerySendAllNotificationsArgs } from "../../generated/graphql";
import { PreviewNotification } from "../mobile/PreviewNotification";

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

function AdminNotifications() {
  const [call] = useLazyQuery<QuerySendAllNotificationsArgs>(
    SEND_ALL_NOTIFICATIONS_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

  const toast = useToast();
  const [isSending, setIsSending] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const sendNotifications = useCallback(async () => {
    setIsSending(true);
    try {
      await call({
        variables: {
          data: {
            title,
            body,
            channelId: undefined,
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
  }, [title, body]);

  return (
    <Box
      borderRadius="10px"
      padding="16px"
      bg="#1F2D31"
      width="400px"
      margin="auto"
      borderColor="#dadada"
    >
      <Flex direction="column" gap="20px">
        <Flex direction="column" gap="10px">
          <Text fontSize="15px" color="#bababa">
            title
          </Text>
          <Input
            {...inputStyle}
            defaultValue={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Flex>
        <Flex direction="column" gap="10px">
          <Text fontSize="15px" color="#bababa">
            description
          </Text>
          <Input
            {...inputStyle}
            defaultValue={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </Flex>
        <Flex direction="column" gap="10px">
          <Text fontSize="15px" color="#dadada">
            preview
          </Text>
          <PreviewNotification
            selectedType={"live"}
            titleLive={title}
            titleNFCs={""}
            bodyLive={body}
            bodyNFCs={""}
          />
        </Flex>
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
        disabled={isSending || body === "" || title === ""}
      >
        <Text fontSize="30px">send</Text>
      </Button>
    </Box>
  );
}

export default AdminNotifications;
