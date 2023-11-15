import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  Image,
  IconButton,
} from "@chakra-ui/react";

import EmojiPicker from "./EmojiPicker";
import { EmojiType } from "../../../constants/types/chat";

type Props = {
  onSelectEmoji: (emoji: EmojiType) => void;
  onSelectGif: (gif: string) => void;
};

const EmojiButton = ({ onSelectEmoji, onSelectGif }: Props) => {
  return (
    <Popover>
      <PopoverTrigger>
        <IconButton
          icon={<Image src="/svg/emoji.svg" height={"20px"} />}
          aria-label="clip stream"
          bg="transparent"
          _focus={{}}
          _hover={{ transform: "scale(1.15)" }}
          _active={{ transform: "scale(1.3)" }}
          minWidth="auto"
        />
      </PopoverTrigger>
      <PopoverContent
        zIndex={4}
        rootProps={{ style: { transform: "scale(0)" } }} // when Popover is not opened yet, PopoverContent causes unwanted scroll, this is a fix
        right={9}
        bottom={10}
        bg={"#3B3547"}
        _focus={{ outline: "none" }}
        borderWidth="0px"
      >
        <PopoverArrow bg={"#3B3547"} />
        <PopoverCloseButton />
        <PopoverBody overflow={"scroll"}>
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
