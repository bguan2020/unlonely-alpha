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
};

const EmojiButton = ({ onSelectEmoji, onSelectGif }: Props) => {
  return (
    <Popover>
      <PopoverTrigger>
        <Button
          type="button"
          size="sm"
          z-index={2}
          position="absolute"
          bottom="8px"
          right="8px"
          bg="white"
        >
          😃
        </Button>
      </PopoverTrigger>
      <PopoverContent zIndex={4} maxHeight="400px" overflowY="scroll">
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
