import {
  Flex,
  Button,
  Textarea,
} from "@chakra-ui/react";
import React, { useState } from "react";

type Props = {
  username: string | null | undefined;
  sendChatMessage: (message: string) => void;
  inputBox: HTMLTextAreaElement | null;
};

const ChatForm = ({ username, sendChatMessage, inputBox }: Props) => {
  const [messageText, setMessageText] = useState<string>("");

  const messageTextIsEmpty = messageText.trim().length === 0;

  const handleKeyPress = (event: any) => {
    if (event.charCode !== 13 || messageTextIsEmpty) {
      return;
    }
    event.preventDefault();
    if (username) {
      sendChatMessage(messageText);
      setMessageText("");
    }
  };

  const handleFormSubmission = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (username) {
      sendChatMessage(messageText);
      setMessageText("");
    }
  };

  return (
    <>
      <form
        onSubmit={handleFormSubmission}
        className="xeedev-form-i"
        style={{ width: "100%" }}
      >
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
        ></Textarea>
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
