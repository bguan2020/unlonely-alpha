import React from "react";
import { Flex } from "@chakra-ui/react";

import Gif from "./Gif";

type Props = {
  emoji: string;
  fontSize: string;
  buttonDisabled: boolean;
  setButtonDisabled: (disabled: boolean) => void;
  channel?: any;
  timeserial?: string;
};

const EmojiDisplay = ({
  emoji,
  fontSize,
  buttonDisabled,
  setButtonDisabled,
  channel,
  timeserial,
}: Props) => {
  // check if emoji contains "https://i.imgur.com/" to determine if it is a gif
  const isGif =
    emoji.includes("https://i.imgur.com/") ||
    emoji.includes("https://media.tenor.com/");

  return (
    <>
      <Flex>
        {isGif ? (
          <Gif
            gif={emoji}
            buttonDisabled={buttonDisabled}
            setButtonDisabled={setButtonDisabled}
            size={"20px"}
            padding={"0px"}
            channel={channel}
          />
        ) : (
          <Flex fontSize={fontSize}>{emoji}</Flex>
        )}
      </Flex>
    </>
  );
};

export default EmojiDisplay;
