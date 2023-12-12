import React from "react";
import { Button } from "@chakra-ui/react";

import { EmojiType } from "../../../constants/types/chat";

type Props = { emoji: EmojiType; onClick?: (emoji: EmojiType) => void };

const Emoji = ({ emoji, onClick }: Props) => {
  return (
    <Button
      color="white"
      bg={
        "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
      }
      padding="5px"
      _hover={{}}
      _active={{}}
      _focus={{}}
      type="button"
      isDisabled={emoji.unicodeString === "coming soon" ? true : false}
      as={onClick !== null ? "button" : "div"}
      textAlign="center"
      onClick={() => {
        if (onClick) onClick(emoji);
      }}
    >
      {emoji.unicodeString}
    </Button>
  );
};

export default Emoji;
