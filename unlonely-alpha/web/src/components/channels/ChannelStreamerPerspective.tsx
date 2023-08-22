import { Flex, Stack, SimpleGrid, Box, Text, Image } from "@chakra-ui/react";
import { useState } from "react";

import CalendarEventModal from "./CalendarEventModal";
import ChatCommandModal from "./ChatCommandModal";
import EditChannelModal from "./EditChannelModal";
import NotificationsModal from "./NotificationsModal";
import TokenSaleModal from "./TokenSaleModal";

const ChannelStreamerPerspective = ({
  setCustomActionModal,
}: {
  setCustomActionModal: (value: boolean) => void;
}) => {
  const [tokenSaleModal, setTokenSaleModal] = useState<boolean>(false);
  const [chatCommandModal, setChatCommandModal] = useState<boolean>(false);
  const [editModal, setEditModal] = useState<boolean>(false);
  const [notificationsModal, setNotificationsModal] = useState<boolean>(false);
  const [eventModal, setEventModal] = useState<boolean>(false);

  return (
    <Flex direction="column" width={"100%"}>
      <TokenSaleModal
        title={"offer tokens for sale"}
        isOpen={tokenSaleModal}
        handleClose={() => setTokenSaleModal(false)}
      />
      <ChatCommandModal
        title={"custom commands"}
        isOpen={chatCommandModal}
        handleClose={() => setChatCommandModal(false)}
      />
      <EditChannelModal
        title={"edit title / description"}
        isOpen={editModal}
        handleClose={() => setEditModal(false)}
      />
      <NotificationsModal
        title={"send notifications"}
        isOpen={notificationsModal}
        handleClose={() => setNotificationsModal(false)}
      />
      <CalendarEventModal
        title={"add event"}
        isOpen={eventModal}
        handleClose={() => setEventModal(false)}
      />
      <Stack
        my="5rem"
        direction="column"
        width={"100%"}
        justifyContent="center"
      >
        <Flex width={"100%"} position="relative" justifyContent={"center"}>
          <SimpleGrid columns={3} spacing={10}>
            <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
              <Text textAlign="center">send notifications</Text>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="10px"
                onClick={() => setNotificationsModal(true)}
                _hover={{
                  cursor: "pointer",
                  transform: "scale(1.1)",
                  transitionDuration: "0.3s",
                }}
                _active={{
                  transform: "scale(1)",
                }}
              >
                <Image src="/svg/notifications.svg" width="100%" />
              </Box>
            </Flex>
            <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
              <Text textAlign="center">offer tokens for sale</Text>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="10px"
                onClick={() => setTokenSaleModal(true)}
                _hover={{
                  cursor: "pointer",
                  transform: "scale(1.1)",
                  transitionDuration: "0.3s",
                }}
                _active={{
                  transform: "scale(1)",
                }}
              >
                <Image src="/svg/token-sale.svg" width="100%" />
              </Box>
            </Flex>
            <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
              <Text textAlign="center">add event</Text>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="10px"
                onClick={() => setEventModal(true)}
                _hover={{
                  cursor: "pointer",
                  transform: "scale(1.1)",
                  transitionDuration: "0.3s",
                }}
                _active={{
                  transform: "scale(1)",
                }}
              >
                <Image src="/svg/calendar.svg" width="100%" />
              </Box>
            </Flex>
            <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
              <Text textAlign="center">edit channel title / description</Text>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="10px"
                onClick={() => setEditModal(true)}
                _hover={{
                  cursor: "pointer",
                  transform: "scale(1.1)",
                  transitionDuration: "0.3s",
                }}
                _active={{
                  transform: "scale(1)",
                }}
              >
                <Image src="/svg/edit.svg" width="100%" />
              </Box>
            </Flex>
            <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
              <Text textAlign="center">custom commands</Text>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="10px"
                onClick={() => setChatCommandModal(true)}
                _hover={{
                  cursor: "pointer",
                  transform: "scale(1.1)",
                  transitionDuration: "0.3s",
                }}
                _active={{
                  transform: "scale(1)",
                }}
              >
                <Image src="/svg/custom-commands.svg" width="100%" />
              </Box>
            </Flex>
            <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
              <Text textAlign="center">paid custom action</Text>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="10px"
                onClick={() => setCustomActionModal(true)}
                _hover={{
                  cursor: "pointer",
                  transform: "scale(1.1)",
                  transitionDuration: "0.3s",
                }}
                _active={{
                  transform: "scale(1)",
                }}
              >
                <Image src="/svg/custom-actions.svg" width="100%" />
              </Box>
            </Flex>
          </SimpleGrid>
        </Flex>
      </Stack>
    </Flex>
  );
};

export default ChannelStreamerPerspective;
