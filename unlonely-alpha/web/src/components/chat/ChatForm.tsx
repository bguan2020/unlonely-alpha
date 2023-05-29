import { Flex, Button, Textarea, Stack } from "@chakra-ui/react";
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
        <Stack direction={"row"} spacing={2} mb={"10px"}>
          <Flex width="100%" position="relative">
            <Textarea
              ref={(element) => {
                inputBox = element;
              }}
              value={messageText}
              color={"white"}
              fontFamily="Inter"
              fontWeight="medium"
              placeholder="say something in chat!"
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              enterkeyhint="send"
              onChange={(e) => {
                if (e.target.value === "") {
                  setCommandsOpen(false);
                }
                setMessageText(e.target.value);
              }}
              onKeyPress={handleKeyPress}
              background="rgba(255, 255, 255, 0.35)"
              minW="100%"
              style={{ zIndex: 0, minHeight: mobile ? "68px" : "80px" }}
              position="relative"
              resize="none"
              height={"100%"}
            />
            {/* <Tooltip label="Toggle to send private message. Private messages won't get displayed to Farcaster.">
              <Flex
                position="absolute"
                zIndex={3}
                top="50px"
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
            </Tooltip> */}
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

            {/* <EmojiButton
              mobile={mobile}
              onSelectEmoji={(emoji) => addEmoji(emoji)}
              onSelectGif={(gif) => sendGif(gif)}
            /> */}
          </Flex>
          <Stack direction="column">
            {!mobile && (
              <Flex justifyContent="right">
                <Button
                  type="submit"
                  disabled={messageTextIsEmpty}
                  bg="#27415E"
                  color="white"
                  className="xeedev-button-desktop"
                >
                  Send
                </Button>
                {/* <Button
                  width={"40px"}
                  height={"40px"}
                  background={
                    "linear-gradient(90deg, #E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
                  }
                  borderRadius={8}
                  transform={"rotate(90deg)"}
                >
                </Button> */}
              </Flex>
            )}
            <EmojiButton
              mobile={mobile}
              onSelectEmoji={(emoji) => addEmoji(emoji)}
              onSelectGif={(gif) => sendGif(gif)}
            />
          </Stack>
        </Stack>
      </form>
    </>
  );
};

export default ChatForm;
