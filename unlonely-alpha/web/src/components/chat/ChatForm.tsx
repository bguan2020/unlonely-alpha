import { Flex, Button, Textarea, Switch, Tooltip } from "@chakra-ui/react";
import React, { useState } from "react";
import Commands from "./Commands";

import EmojiButton from "./emoji/EmojiButton";
import { EmojiType } from "./emoji/types";

type Props = {
  sendChatMessage: (message: string, isGif: boolean) => void;
  inputBox: HTMLTextAreaElement | null;
  mobile?: boolean;
};

const ChatForm = ({ sendChatMessage, inputBox, mobile }: Props) => {
  const [messageText, setMessageText] = useState<string>("");
  const [privateChat, setPrivateChat] = useState<boolean>(true);
  const [commandsOpen, setCommandsOpen] = useState(false);

  const messageTextIsEmpty =
    messageText.trim().length === 0 || messageText.trim() === "";

  const addEmoji = (emoji: EmojiType) => {
    setMessageText(`${messageText}${emoji.unicodeString}`);
  };

  const sendGif = (gif: string) => {
    sendChatMessage(gif, true);
    setMessageText("");
  };

  const handleKeyPress = (event: any) => {
    const isGif = false;
    if (event.charCode !== 13 || messageTextIsEmpty) {
      if (event.charCode === 64) {
        setCommandsOpen(true);
      }
      return;
    }
    if (event.charCode === 13) {
      setCommandsOpen(false);
    }
    event.preventDefault();
    sendChatMessage(messageText, isGif);
    setMessageText("");
  };

  const handleFormSubmission = (event: { preventDefault: () => void }) => {
    const isGif = false;
    event.preventDefault();
    sendChatMessage(messageText, isGif);
    setMessageText("");
  };

  const handlePrivateChat = () => {
    setPrivateChat(!privateChat);
    if (privateChat) {
      // add "@noFCplz" to beginning of messageText
      setMessageText(`@noFCplz ${messageText}`);
    } else {
      // remove "@noFCplz" from beginning of messageText
      setMessageText(messageText.replace("@noFCplz ", ""));
    }
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
            fontFamily="Inter"
            fontWeight="medium"
            placeholder="try asking @chatbot a question"
            enterkeyhint="send"
            onChange={(e) => {
              if (e.target.value === "") {
                setCommandsOpen(false);
              }
              setMessageText(e.target.value);
            }}
            onKeyPress={handleKeyPress}
            background="white"
            minW="100%"
            style={{ zIndex: 0, minHeight: mobile ? "68px" : "80px" }}
            position="relative"
            resize="none"
          ></Textarea>
          <Flex
            position="absolute"
            zIndex={3}
            bottom="5px"
            left="8px"
            pt="2px"
            pb="1px"
            pl="2px"
            pr="2px"
            borderRadius="2rem"
          >
            <Commands
              chat={messageText}
              open={commandsOpen}
              onClose={() => setCommandsOpen(false)}
              onCommandClick={(text: string) => {
                setMessageText(text);
                setCommandsOpen(false);
              }}
            />
          </Flex>
          <Tooltip label="Toggle to send private message. Private messages won't get displayed to Farcaster.">
            <Flex
              position="absolute"
              zIndex={3}
              bottom="12px"
              right="8px"
              pt="2px"
              pb="1px"
              pl="2px"
              pr="2px"
              bg="grey"
              borderRadius="2rem"
            >
              <Switch
                size="sm"
                colorScheme={"red"}
                onChange={() => handlePrivateChat()}
              />
            </Flex>
          </Tooltip>

          <EmojiButton
            mobile={mobile}
            onSelectEmoji={(emoji) => addEmoji(emoji)}
            onSelectGif={(gif) => sendGif(gif)}
          />
        </Flex>
        {!mobile && (
          <Flex width="100%" justifyContent="right" mb="5px">
            <Button
              type="submit"
              disabled={messageTextIsEmpty}
              mt="7px"
              bg="#27415E"
              color="white"
              className="xeedev-button-desktop"
            >
              Send
            </Button>
          </Flex>
        )}
      </form>
    </>
  );
};

export default ChatForm;
