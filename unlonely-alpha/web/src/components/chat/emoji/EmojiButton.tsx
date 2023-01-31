import React from "react";
import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
} from "@chakra-ui/react";
import EmojiPicker from "./EmojiPicker";
import { EmojiType } from "./types";

type Props = {
  onSelectEmoji: (emoji: EmojiType) => void;
  onSelectGif: (gif: string) => void;
  mobile?: boolean;
};

const EmojiButton = ({ onSelectEmoji, onSelectGif, mobile }: Props) => {
  return (
    <Popover>
      <PopoverTrigger>
        <Button
          type="button"
          size="sm"
          z-index={2}
          position="absolute"
          bottom="8px"
          right={mobile ? "48px" : "36px"}
          bg="white"
          _focus={{ outline: "none" }}
        >
          😃
        </Button>
      </PopoverTrigger>
      <PopoverContent
        zIndex={4}
        maxHeight="400px"
        overflowY="scroll"
        overflow={mobile ? "hidden" : "auto"}
        right={12}
        bottom={5}
      >
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
          <EmojiPicker
            onSelectEmoji={onSelectEmoji}
            onSelectGif={onSelectGif}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiButton;
