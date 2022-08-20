import {
  Flex,
  Button,
  Textarea,
} from "@chakra-ui/react";
import React, { useState } from "react";
import EmojiButton from "./emoji/EmojiButton";
import { EmojiType } from "./emoji/types";

type Props = {
  sendChatMessage: (message: string) => void;
  inputBox: HTMLTextAreaElement | null;
};

const ChatForm = ({ sendChatMessage, inputBox }: Props) => {
  const [messageText, setMessageText] = useState<string>("");

  const messageTextIsEmpty = messageText.trim().length === 0;

  const addEmoji = (emoji: EmojiType) => {
    setMessageText(`${messageText}${emoji.unicodeString}`);
  }

  const handleKeyPress = (event: any) => {
    if (event.charCode !== 13 || messageTextIsEmpty) {
      return;
    }
    event.preventDefault();
    sendChatMessage(messageText);
    setMessageText("");
  };

  const handleFormSubmission = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    sendChatMessage(messageText);
    setMessageText("");
  };

  return (
    <>
      <form
        onSubmit={handleFormSubmission}
        className="xeedev-form-i"
        style={{ width: "100%" }}
      >
        <Flex width="100%" position="relative">
          <Textarea
            ref={(element) => {
              inputBox = element;
            }}
            value={messageText}
            placeholder="Type a message..."
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            background="white"
            minW="100%"
            style={{ zIndex: 0 }}
            position="relative"
          >
          </Textarea>
          <EmojiButton onSelectEmoji={(emoji) => addEmoji(emoji)}/>
        </Flex>
        <Flex width="100%" justifyContent="right" mb="50px">
          <Button
            type="submit"
            disabled={messageTextIsEmpty}
            mt="5px"
            bg="#27415E"
            color="white"
            className="xeedev-button-desktop"
          >
            Send
          </Button>
        </Flex>
      </form>
    </>
  );
};

export default ChatForm;
