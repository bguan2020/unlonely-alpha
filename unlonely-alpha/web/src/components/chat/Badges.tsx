import { Tooltip, Image } from "@chakra-ui/react";
import { User } from "../../generated/graphql";

import { Message } from "./types/index";

type Props = {
  message: Message;
  user: User | undefined;
};

export default function Badges({ message, user }: Props) {
  let numStreams: string;
  switch (message.data.videoSavantLvl) {
    case 1:
      numStreams = "1+";
      break;
    case 2:
      numStreams = "5+";
      break;
    case 3:
      numStreams = "15+";
      break;
    default:
      numStreams = "0";
  }

  return (
    <>
      {(user &&
        user?.powerUserLvl > 0 &&
        user?.username === message.data.username) ||
      (message.data.powerUserLvl && message.data.powerUserLvl > 0) ? (
        <Tooltip
          label={`Power User lvl:${message.data.powerUserLvl} \nThis badge means you've come to multiple streams and have engaged in chat! Continue the streak to gain levels!`}
        >
          <Image
            src={`/images/badges/lvl${message.data.powerUserLvl}_poweruser.png`}
            width="20px"
            height="20px"
            mr="5px"
          />
        </Tooltip>
      ) : null}
      {(user &&
        user?.videoSavantLvl > 0 &&
        user?.username === message.data.username) ||
      (message.data.videoSavantLvl && message.data.videoSavantLvl > 0) ? (
        <Tooltip
          label={`Host lvl:${message.data.videoSavantLvl}\nHas hosted ${numStreams} streams!`}
        >
          <Image
            src={`/images/badges/lvl${message.data.videoSavantLvl}_host.png`}
            width="20px"
            height="20px"
            mr="5px"
          />
        </Tooltip>
      ) : null}
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
    </>
  );
}
