import React from "react";
import { EmojiType } from "./types";
import { Button } from "@chakra-ui/react";

type Props = { emoji: EmojiType; onClick?: (emoji: EmojiType) => void };

const Emoji = ({ emoji, onClick }: Props) => {
  return (
    <Button
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