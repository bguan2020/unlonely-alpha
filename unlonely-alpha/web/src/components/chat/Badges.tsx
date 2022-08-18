import { Tooltip, Image } from "@chakra-ui/react";
import { User } from "../../generated/graphql";

import { Message } from "./types/index";

type Props = {
  message: Message;
  user: User | undefined;
};

export default function Badges({
  message, user
}: Props) {
  return (
    <>
      {((user && (user?.powerUserLvl > 0) && (user?.username === message.data.username)) || (message.data.powerUserLvl && message.data.powerUserLvl> 0)) ? (
        <Tooltip label={`Power User lvl:${message.data.powerUserLvl} \nThis badge means you've come to multiple streams and have engaged in chat! Continue the streak to gain levels!`}>
            <Image
              src={`/images/badges/lvl${message.data.powerUserLvl}_poweruser.png`}
              width="20px"
              height="20px"
              mr="5px"
            />
        </Tooltip>
      ) : null}
      {((user && (user?.videoSavantLvl > 0) && (user?.username === message.data.username)) || (message.data.videoSavantLvl && message.data.videoSavantLvl> 0)) ? (
        <Tooltip label={`Video Savant lvl:${message.data.videoSavantLvl}\nThis badge means you pick good videos that get upvoted and watched. Continue picking good videos to gain levels!`}>
            <Image
              src={`/images/badges/lvl${message.data.videoSavantLvl}_videosavant.png`}
              width="20px"
              height="20px"
              mr="5px"
            />
        </Tooltip>
      ) : null}
      {(message.data.isFC) && (
        <Tooltip label="Farcaster Badge">
            <Image
              src="https://searchcaster.xyz/img/logo.png"
              width="20px"
              height="20px"
              mr="5px"
            />
        </Tooltip>
      )}
    </>
  );
}
