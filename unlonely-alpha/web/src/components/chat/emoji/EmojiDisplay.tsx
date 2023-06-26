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
  const isGif = emoji.includes("https://i.imgur.com/");

  return (
    <>
      <Flex p="5px 5px 0px 5px">
        {isGif ? (
          <Gif
            gif={emoji}
            buttonDisabled={buttonDisabled}
            setButtonDisabled={setButtonDisabled}
            size={"20px"}
            padding={"0px"}
            channel={channel}
            timeserial={timeserial}
          />
        ) : (
          <Flex fontSize={fontSize}>{emoji}</Flex>
        )}
      </Flex>
    </>
  );
};

export default EmojiDisplay;
