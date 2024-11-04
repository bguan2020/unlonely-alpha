import React from "react";
import { Flex } from "@chakra-ui/react";

import Gif from "./Gif";
import { safeIncludes } from "../../../utils/safeFunctions";

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
}: Props) => {
  // check if emoji contains "https://i.imgur.com/" to determine if it is a gif
  const isGif =
    safeIncludes(emoji, "https://i.imgur.com/") ||
    safeIncludes(emoji, "https://media.tenor.com/");

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
          />
        ) : (
          <Flex fontSize={fontSize}>{emoji}</Flex>
        )}
      </Flex>
    </>
  );
};

export default EmojiDisplay;
