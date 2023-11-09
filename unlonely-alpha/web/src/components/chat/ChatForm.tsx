import {
  Flex,
  Textarea,
  Stack,
  IconButton,
  Image,
  useToast,
  Box,
  Spinner,
  Text,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
} from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import copy from "copy-to-clipboard";
import { BsFillHeartFill } from "react-icons/bs";

import {
  ADD_REACTION_EVENT,
  CommandData,
  InteractionType,
} from "../../constants";
import Commands from "./Commands";
import { EmojiType, SenderStatus } from "../../constants/types/chat";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useUser } from "../../hooks/context/useUser";
import EmojiButton from "./emoji/EmojiButton";
import centerEllipses from "../../utils/centerEllipses";
import ConnectWallet from "../navigation/ConnectWallet";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { ChatClip } from "./ChatClip";
import { REACTION_EMOJIS } from "./emoji/constants";
import EmojiDisplay from "./emoji/EmojiDisplay";

type Props = {
  sendChatMessage: (
    message: string,
    isGif: boolean,
    senderStatus: SenderStatus,
    body?: string
  ) => void;
  isVipChat?: boolean;
  mobile?: boolean;
  additionalChatCommands?: CommandData[];
  allowPopout?: boolean;
  channel?: any;
};

const ChatForm = ({
  sendChatMessage,
  additionalChatCommands,
  allowPopout,
  channel,
  isVipChat,
}: Props) => {
  const { user, walletIsConnected, userAddress: address } = useUser();
  const { isStandalone } = useUserAgent();

  const toast = useToast();
  const { channel: channelContext, chat, leaderboard } = useChannelContext();
  const { isVip } = leaderboard;
  const { clipping, addToChatbot } = chat;
  const { handleIsClipUiOpen, loading: clipLoading } = clipping;

  const { channelQueryData } = channelContext;

  const [messageText, setMessageText] = useState<string>("");
  const [commandsOpen, setCommandsOpen] = useState(false);
  const [error, setError] = useState<string>("");

  const [blastMode, setBlastMode] = useState(false);
  const [blastDisabled, setBlastDisabled] = useState(false);

  const [showEmojiReactionList, setShowEmojiReactionList] = useState(false);
  const [reactionDisabled, setReactionDisabled] = useState<boolean>(false);
  const isOwner = address === channelQueryData?.owner.address;

  const messageTextIsEmpty =
    messageText.trim().length === 0 || messageText.trim() === "";

  const addEmoji = (emoji: EmojiType) => {
    setMessageText(`${messageText}${emoji.unicodeString}`);
  };

  const sendGif = (gif: string) => {
    if (!blastMode) {
      sendChatMessage(
        gif,
        true,
        isVipChat ? SenderStatus.VIP : SenderStatus.USER
      );
    } else {
      sendChatMessage(
        gif,
        true,
        isVipChat ? SenderStatus.VIP : SenderStatus.USER,
        `${InteractionType.BLAST}:`
      );
      setBlastMode(false);
      setBlastDisabled(true);
      setTimeout(() => {
        setBlastDisabled(false);
      }, 6000);
    }
    setMessageText("");
  };

  const handleKeyPress = useCallback(
    async (event: any) => {
      if (event.charCode !== 13 || messageTextIsEmpty) {
        if (event.charCode === 33) {
          setCommandsOpen(true);
        }
        return;
      }
      if (event.charCode === 13) {
        setCommandsOpen(false);
      }
      event.preventDefault();
      if (!blastMode) {
        sendChatMessage(
          messageText.replace(/^\s*\n|\n\s*$/g, ""),
          false,
          isVipChat ? SenderStatus.VIP : SenderStatus.USER
        );
      } else {
        sendChatMessage(
          messageText.replace(/^\s*\n|\n\s*$/g, ""),
          false,
          isVipChat ? SenderStatus.VIP : SenderStatus.USER,
          `${InteractionType.BLAST}:`
        );
        setBlastMode(false);
        setBlastDisabled(true);
        setTimeout(() => {
          setBlastDisabled(false);
        }, 6000);
      }
      setMessageText("");
    },
    [blastMode, messageText, messageTextIsEmpty]
  );

  const handleFormSubmission = useCallback(
    async (event: { preventDefault: () => void }) => {
      event.preventDefault();
      if (!blastMode) {
        sendChatMessage(
          messageText.replace(/^\s*\n|\n\s*$/g, ""),
          false,
          isVipChat ? SenderStatus.VIP : SenderStatus.USER
        );
      } else {
        sendChatMessage(
          messageText.replace(/^\s*\n|\n\s*$/g, ""),
          false,
          isVipChat ? SenderStatus.VIP : SenderStatus.USER,
          `${InteractionType.BLAST}:`
        );
        setBlastMode(false);
        setBlastDisabled(true);
        setTimeout(() => {
          setBlastDisabled(false);
        }, 6000);
      }
      setMessageText("");
    },
    [blastMode, messageText]
  );

  const toastSignIn = () => {
    toast({
      title: "Sign in first.",
      description: "Please sign into your wallet first.",
      status: "warning",
      duration: 9000,
      isClosable: true,
      position: "top",
    });
  };

  const openChatPopout = () => {
    if (!channelQueryData) return;
    const windowFeatures = "width=400,height=600,menubar=yes,toolbar=yes";
    window.open(
      `${window.location.origin}/mobile/chat/${channelQueryData?.slug}`,
      "_blank",
      windowFeatures
    );
  };

  const sendMessageReaction = (emoji: string, reactionEvent: string) => {
    channel.publish(reactionEvent, {
      body: emoji,
      name: reactionEvent,
    });
    setShowEmojiReactionList(false);
  };

  return (
    <>
      <ChatClip />
      <form
        onSubmit={handleFormSubmission}
        className="xeedev-form-i"
        style={{
          position: "relative",
          width: "100%",
          marginBottom: isStandalone ? "15px" : undefined,
        }}
      >
        <Stack direction={"row"} spacing={"10px"}>
          {!walletIsConnected ? (
            <Flex
              justifyContent={"center"}
              direction="column"
              margin="auto"
              gap="5px"
            >
              <Text>you must sign in to chat</Text>
              <ConnectWallet />
            </Flex>
          ) : error ? (
            <Flex direction="column" gap="10px">
              <Text textAlign={"center"} color="#fa8a29">
                There was an error when trying to send your blast message
              </Text>
              <Flex gap="10px">
                <Button
                  width="100%"
                  bg="#b82929"
                  onClick={() => copy(error)}
                  _focus={{}}
                  _hover={{ background: "#f25719" }}
                >
                  copy error
                </Button>
                <Button
                  opacity={"0.5"}
                  border={"1px solid white"}
                  bg={"transparent"}
                  width="100%"
                  onClick={() => setError("")}
                  _focus={{}}
                  _hover={{ opacity: "1" }}
                  _active={{}}
                >
                  close
                </Button>
              </Flex>
            </Flex>
          ) : (
            <Flex direction="column" width="100%">
              {showEmojiReactionList && (
                <Flex
                  flexWrap="wrap"
                  background={"rgba(255, 255, 255, 0.2)"}
                  borderRadius={"10px"}
                >
                  {REACTION_EMOJIS.map((emoji) => (
                    <Box
                      minH="40px"
                      background="transparent"
                      p="5px"
                      key={emoji}
                      style={{
                        cursor: reactionDisabled ? "not-allowed" : "pointer",
                      }}
                      onClick={() => {
                        setReactionDisabled(true);
                        sendMessageReaction(emoji, ADD_REACTION_EVENT);
                        setTimeout(() => {
                          setReactionDisabled(false);
                        }, 2000);
                      }}
                    >
                      <EmojiDisplay
                        emoji={emoji}
                        fontSize={"18px"}
                        buttonDisabled={reactionDisabled}
                        setButtonDisabled={setReactionDisabled}
                      />
                    </Box>
                  ))}
                </Flex>
              )}
              <Flex justifyContent={"space-between"}>
                <Flex>
                  {clipLoading ? (
                    <Flex justifyContent="center">
                      <Spinner />
                    </Flex>
                  ) : (
                    <Popover trigger="hover" placement="top" openDelay={500}>
                      <PopoverTrigger>
                        <IconButton
                          icon={<Image src="/svg/cut.svg" />}
                          aria-label="clip stream"
                          bg="transparent"
                          _focus={{}}
                          _hover={{ transform: "scale(1.15)" }}
                          _active={{ transform: "scale(1.3)" }}
                          onClick={() => {
                            if (user) {
                              handleIsClipUiOpen(true);
                              addToChatbot({
                                username: user?.username ?? "",
                                address: user?.address ?? "",
                                taskType: InteractionType.CLIP,
                                title: `${
                                  user?.username ?? centerEllipses(address, 15)
                                } has just clipped a highlight from this stream!`,
                                description: "",
                              });
                            } else {
                              toastSignIn();
                            }
                          }}
                        />
                      </PopoverTrigger>
                      <PopoverContent
                        bg="#1557c0"
                        border="none"
                        width="100%"
                        p="2px"
                      >
                        <PopoverArrow bg="#1557c0" />
                        <Text fontSize="12px" textAlign={"center"}>
                          clip the last 30 secs as an NFC!
                        </Text>
                      </PopoverContent>
                    </Popover>
                  )}
                  {allowPopout && (
                    <Popover trigger="hover" placement="top" openDelay={500}>
                      <PopoverTrigger>
                        <IconButton
                          onClick={openChatPopout}
                          aria-label="chat-popout"
                          _focus={{}}
                          _hover={{ transform: "scale(1.15)" }}
                          _active={{ transform: "scale(1.3)" }}
                          icon={<Image src="/svg/pop-out.svg" />}
                          bg="transparent"
                        />
                      </PopoverTrigger>
                      <PopoverContent
                        bg="#5d12c6"
                        border="none"
                        width="100%"
                        p="2px"
                      >
                        <PopoverArrow bg="#5d12c6" />
                        <Text fontSize="12px" textAlign={"center"}>
                          pop out chat in a new window!
                        </Text>
                      </PopoverContent>
                    </Popover>
                  )}
                  {isVipChat && (isOwner || isVip) && (
                    <Popover trigger="hover" placement="top" openDelay={500}>
                      <PopoverTrigger>
                        <IconButton
                          icon={<Image src="/svg/blast.svg" />}
                          aria-label="clip stream"
                          bg={blastMode ? "red" : "transparent"}
                          _focus={{}}
                          _hover={{ transform: "scale(1.15)" }}
                          _active={{ transform: "scale(1.3)" }}
                          style={{
                            cursor: blastDisabled ? "not-allowed" : "pointer",
                          }}
                          onClick={() => {
                            if (blastMode) {
                              setBlastMode(false);
                            } else {
                              if (user) {
                                if (!blastDisabled) setBlastMode(true);
                              } else {
                                toastSignIn();
                              }
                            }
                          }}
                        />
                      </PopoverTrigger>
                      <PopoverContent
                        bg="#c82606"
                        border="none"
                        width="100%"
                        p="2px"
                      >
                        <PopoverArrow bg="#c82606" />
                        <Text fontSize="12px" textAlign={"center"}>
                          blast ur chat across the screen!
                        </Text>
                      </PopoverContent>
                    </Popover>
                  )}
                  <EmojiButton
                    onSelectEmoji={(emoji) => addEmoji(emoji)}
                    onSelectGif={(gif) => sendGif(gif)}
                  />
                </Flex>
                <IconButton
                  icon={<BsFillHeartFill />}
                  bg="transparent"
                  aria-label="react"
                  _focus={{}}
                  _hover={{ transform: "scale(1.15)" }}
                  _active={{ transform: "scale(1.3)" }}
                  onClick={() =>
                    setShowEmojiReactionList(!showEmojiReactionList)
                  }
                />
              </Flex>
              <Flex
                mt="5px"
                width="100%"
                position="relative"
                direction="column"
                border={
                  blastMode
                    ? "1px solid red"
                    : "1px solid rgba(250, 250, 250, 0.5)"
                }
                px="10px"
                py="5px"
                background={blastMode ? "rgba(255, 108, 108, 0.35)" : undefined}
              >
                <Flex alignItems="center">
                  <Textarea
                    size="md"
                    resize="none"
                    variant="unstyled"
                    maxLength={500}
                    value={messageText}
                    color={"white"}
                    fontWeight="medium"
                    placeholder={
                      blastMode
                        ? "blast a message to everyone watching!"
                        : "say something in chat!"
                    }
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    enterKeyHint="send"
                    onChange={(e) => {
                      if (e.target.value === "") {
                        setCommandsOpen(false);
                      }
                      setMessageText(e.target.value);
                    }}
                    onKeyPress={handleKeyPress}
                    style={{ zIndex: 0, minHeight: "50px" }}
                    height={"100%"}
                  />
                  <IconButton
                    type="submit"
                    disabled={messageTextIsEmpty}
                    icon={
                      blastMode ? (
                        <Image src="/svg/blast-send.svg" />
                      ) : (
                        <Image src="/svg/send.svg" />
                      )
                    }
                    aria-label="clip stream"
                    bg="transparent"
                    _focus={{}}
                    _hover={{ transform: "scale(1.15)" }}
                    _active={{ transform: "scale(1.3)" }}
                  />
                </Flex>
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
                    additionalChatCommands={additionalChatCommands}
                  />
                </Flex>
              </Flex>
            </Flex>
          )}
        </Stack>
      </form>
    </>
  );
};

export default ChatForm;
