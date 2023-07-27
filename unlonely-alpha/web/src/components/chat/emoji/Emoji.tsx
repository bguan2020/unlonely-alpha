import React from "react";
import { Button } from "@chakra-ui/react";

import { EmojiType } from "../../../constants/types/chat";

type Props = { emoji: EmojiType; onClick?: (emoji: EmojiType) => void };

const Emoji = ({ emoji, onClick }: Props) => {
  return (
    <Button
      bg={
        "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
      }
      _hover={{ transform: "scale(1.3)" }}
      _active={{ transform: "scale(1.5)" }}
      _focus={{}}
      type="button"
      disabled={emoji.unicodeString === "coming soon" ? true : false}
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
