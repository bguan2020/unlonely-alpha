import React from "react";
import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  Text,
} from "@chakra-ui/react";

import EmojiPicker from "./EmojiPicker";
import { EmojiType } from "../../../constants/types/chat";

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
          // size="sm"
          z-index={2}
          // position="absolute"
          // bottom="8px"
          // right={mobile ? "48px" : "36px"}
          width={"40px"}
          height={"40px"}
          size="lg"
          bg="rgba(255,255,255,0)"
          _focus={{}}
          _hover={{ transform: "scale(1.15)" }}
          _active={{ transform: "scale(1.3)" }}
        >
          <Text fontSize="30px" textAlign={"center"}>
            😃
          </Text>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        zIndex={4}
        right={9}
        bottom={10}
        bg={"rgba(255, 255, 255, 0.5)"}
        _focus={{ outline: "none" }}
        borderWidth="0px"
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
