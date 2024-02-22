import { Flex, Stack } from "@chakra-ui/react";

import { useChannelContext } from "../../hooks/context/useChannel";

const ChannelStreamerPerspective = () => {
  const { ui } = useChannelContext();
  const {
    handleNotificationsModal,
    handleEventModal,
    handleEditModal,
    handleChatCommandModal,
    handleModeratorModal,
  } = ui;

  return (
    <Flex direction="column" width={"100%"}>
      <Stack direction="column" width={"100%"} justifyContent="center">
        <Flex width={"100%"} position="relative" justifyContent={"center"}>
          {/* <SimpleGrid columns={3} spacing={10}>
            <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
              <Text textAlign="center">send notifications</Text>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="10px"
                onClick={() => handleNotificationsModal(true)}
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
              <Text textAlign="center">add event</Text>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="10px"
                onClick={() => handleEventModal(true)}
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
                onClick={() => handleEditModal(true)}
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
                onClick={() => handleChatCommandModal(true)}
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
              <Text textAlign={"center"}>moderators</Text>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="10px"
                onClick={() => handleModeratorModal(true)}
                _hover={{
                  cursor: "pointer",
                  transform: "scale(1.1)",
                  transitionDuration: "0.3s",
                }}
                _active={{
                  transform: "scale(1)",
                }}
              >
                <Image src="/svg/mods.svg" width="100%" />
              </Box>
            </Flex>
          </SimpleGrid> */}
        </Flex>
      </Stack>
    </Flex>
  );
};

export default ChannelStreamerPerspective;
