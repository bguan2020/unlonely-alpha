import { Tooltip, Image, Box, Text } from "@chakra-ui/react";

import { Message, SenderStatus } from "../../constants/types/chat";
import { useGetBadges } from "../../hooks/internal/useGetBadges";

type Props = {
  message: Message;
};

export default function Badges({ message }: Props) {
  const { rankUrl, rankDesc } = useGetBadges(message.data.channelUserRank);

  return (
    <>
      {rankUrl && (
        <Tooltip label={rankDesc}>
          <Image
            display="inline-block"
            verticalAlign="middle"
            src={rankUrl}
            width="20px"
            height="20px"
            mr="5px"
          />
        </Tooltip>
      )}
      {message.data.isFC && (
        <Tooltip label="Farcaster Badge">
          <Image
            display="inline-block"
            verticalAlign="middle"
            src="/images/farcaster_logo.png"
            width="20px"
            height="20px"
            mr="5px"
          />
        </Tooltip>
      )}
      {message.data.isLens && (
        <Tooltip label="Lens Badge">
          <Image
            display="inline-block"
            verticalAlign="middle"
            src="/images/lens_logo.png"
            width="20px"
            height="20px"
            mr="5px"
          />
        </Tooltip>
      )}
      {message.data.senderStatus === SenderStatus.MODERATOR && (
        <Tooltip label="Chat Moderator">
          <Box
            bg="#b07300"
            p="2px"
            display="inline-block"
            verticalAlign="middle"
            height="20px"
            mr="5px"
            borderRadius="5px"
          >
            <Text
              lineHeight="15px"
              fontSize="15px"
              fontFamily={"LoRes15"}
              color="white"
              textAlign={"center"}
            >
              mod
            </Text>
          </Box>
        </Tooltip>
      )}
    </>
  );
}
