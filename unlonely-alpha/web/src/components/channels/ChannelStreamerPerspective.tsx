import { Flex, Stack, SimpleGrid, Box, Text, Image } from "@chakra-ui/react";

import { SharesEventState } from "../../generated/graphql";
import { useChannelContext } from "../../hooks/context/useChannel";

const ChannelStreamerPerspective = () => {
  const { arcade, channel } = useChannelContext();
  const {
    handleNotificationsModal,
    handleTokenSaleModal,
    handleEventModal,
    handleEditModal,
    handleChatCommandModal,
    handleCustomModal,
    handleBetModal,
    handleModeratorModal,
  } = arcade;
  const { channelQueryData } = channel;

  const isSharesEventLive =
    channelQueryData?.sharesEvent?.[0]?.eventState === SharesEventState.Live;
  const isSharesEventLock =
    channelQueryData?.sharesEvent?.[0]?.eventState === SharesEventState.Lock;
  const isSharesEventPayout =
    channelQueryData?.sharesEvent?.[0]?.eventState === SharesEventState.Payout;

  return (
    <Flex direction="column" width={"100%"}>
      <Stack
        my="5rem"
        direction="column"
        width={"100%"}
        justifyContent="center"
      >
        <Flex width={"100%"} position="relative" justifyContent={"center"}>
          <SimpleGrid columns={4} spacing={10}>
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
              <Text textAlign="center">offer tokens for sale</Text>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="10px"
                onClick={() => handleTokenSaleModal(true)}
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
              <Text textAlign="center">paid custom action</Text>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="10px"
                onClick={() => handleCustomModal(true)}
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
            <Flex direction="column" gap="10px" justifyContent={"flex-end"}>
              <Text textAlign="center">
                {isSharesEventPayout
                  ? "stop event"
                  : isSharesEventLive
                  ? "lock bets"
                  : isSharesEventLock
                  ? "decide outcome"
                  : "create a bet"}
              </Text>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="10px"
                onClick={() => handleBetModal(true)}
                _hover={{
                  cursor: "pointer",
                  transform: "scale(1.1)",
                  transitionDuration: "0.3s",
                }}
                _active={{
                  transform: "scale(1)",
                }}
              >
                <Image src="/svg/bet.svg" width="100%" />
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
          </SimpleGrid>
        </Flex>
      </Stack>
    </Flex>
  );
};

export default ChannelStreamerPerspective;
