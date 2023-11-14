import { Tooltip, Image } from "@chakra-ui/react";

import { User } from "../../generated/graphql";
import { Message } from "../../constants/types/chat";
import { useGetBadges } from "../../hooks/internal/useGetBadges";

type Props = {
  message: Message;
  user?: User;
};

export default function Badges({ message, user }: Props) {
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
    </>
  );
}
