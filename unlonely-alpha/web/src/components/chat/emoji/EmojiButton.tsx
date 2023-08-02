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
  Tooltip,
  Box,
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
      <Tooltip
        defaultIsOpen
        label="try me!"
        background="#7e10eb"
        placement="left"
        fontSize={"15px"}
        hasArrow
      >
        <Box display="inline-block">
          <PopoverTrigger>
            <IconButton
              icon={<Image src="/svg/emoji.svg" />}
              aria-label="clip stream"
              className="zooming-text"
              bg="transparent"
              _focus={{}}
              _hover={{ transform: "scale(1.15)" }}
              _active={{ transform: "scale(1.3)" }}
            />
          </PopoverTrigger>
        </Box>
      </Tooltip>
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
