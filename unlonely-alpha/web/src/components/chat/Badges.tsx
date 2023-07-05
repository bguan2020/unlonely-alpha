import { Tooltip, Image } from "@chakra-ui/react";
import { User } from "../../generated/graphql";
import { Message } from "./types/index";
import { useGetBadges } from "../../hooks/internal/useGetBadges";

type Props = {
  message: Message;
  user?: User;
};

export default function Badges({ message, user }: Props) {
  const { rankUrl, rankDesc } = useGetBadges(message.data.tokenHolderRank);

  return (
    <>
      {rankUrl &&
        (user?.username === message.data.username ? (
          <Tooltip label={rankDesc}>
            <Image src={rankUrl} width="20px" height="20px" mr="5px" />
          </Tooltip>
        ) : (
          <Image src={rankUrl} width="20px" height="20px" mr="5px" />
        ))}
      {message.data.isFC && (
        <Tooltip label="Farcaster Badge">
          <Image
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
