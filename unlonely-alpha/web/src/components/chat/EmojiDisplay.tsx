import { Image, Text } from "@chakra-ui/react";

export const EmojiDisplay = ({ emoji }: { emoji: string }) => {
  return (
    <Text>
      {emoji}
    </Text>
  )
}