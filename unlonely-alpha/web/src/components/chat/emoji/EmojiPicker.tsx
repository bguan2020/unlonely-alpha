import React from "react";
import { SimpleGrid, Flex, Text } from "@chakra-ui/react";

import { unicodeEmojis, categoriesList, gifsList } from "./constants";
import { EmojiType } from "../../../constants/types/chat";
import Emoji from "./Emoji";
import GifPicker from "./GifPicker";

type Props = {
  onSelectEmoji: (emoji: EmojiType) => void;
  onSelectGif: (gif: string) => void;
};

const EmojiCategory = ({
  category,
  onSelectEmoji,
  emojis,
}: {
  category: string;
  emojis: Array<EmojiType>;
  onSelectEmoji: (emoji: EmojiType) => void;
}) => {
  return (
    <Flex direction="column">
      <Text
        fontWeight={"bold"}
        style={{
          textShadow: "0 0 0.2em black",
        }}
      >
        {category}
      </Text>
      <SimpleGrid minChildWidth="34px" spacing="5px" alignContent="center">
        {emojis.map((emoji) => (
          <Emoji
            key={emoji.unicodeString}
            onClick={onSelectEmoji}
            emoji={emoji}
          />
        ))}
      </SimpleGrid>
    </Flex>
  );
};

const EmojiPicker = ({ onSelectEmoji, onSelectGif }: Props) => {
  return (
    <Flex direction="column">
      {categoriesList.map((category, i) => (
        <EmojiCategory
          key={i}
          onSelectEmoji={onSelectEmoji}
          category={category}
          emojis={unicodeEmojis[category]}
        />
      ))}
      <GifPicker onSelectGif={onSelectGif} gifs={gifsList} />
    </Flex>
  );
};

export default EmojiPicker;
