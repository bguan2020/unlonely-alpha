import {
  Flex,
  Stack,
  IconButton,
  Image,
  useToast,
  Spinner,
  Text,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  Input,
} from "@chakra-ui/react";
import React, { useCallback, useRef, useState } from "react";
import copy from "copy-to-clipboard";
import { BsFillHeartFill } from "react-icons/bs";
import { GiTalk } from "react-icons/gi";

import {
  ADD_REACTION_EVENT,
  AblyChannelPromise,
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
  channel?: AblyChannelPromise;
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
  const [instantCommandSend, setInstantCommandSend] = useState(false);
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

  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
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
    if (!channel) return;
    channel.publish(reactionEvent, {
      body: emoji,
      name: reactionEvent,
    });
    // setShowEmojiReactionList(false);
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
                  color="white"
                  width="100%"
                  bg="#b82929"
                  onClick={() => copy(error)}
                  _focus={{}}
                  _hover={{ background: "#f25719" }}
                >
                  copy error
                </Button>
                <Button
                  color="white"
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
                  justifyContent="space-between"
                >
                  {REACTION_EMOJIS.map((emoji) => (
                    <Button
                      color="white"
                      minH="40px"
                      background="transparent"
                      p="5px"
                      key={emoji}
                      style={{
                        cursor: reactionDisabled ? "not-allowed" : "pointer",
                      }}
                      _focus={{}}
                      _active={{}}
                      _hover={{ transform: "scale(1.15)" }}
                      onClick={() => {
                        // setReactionDisabled(true);
                        sendMessageReaction(emoji, ADD_REACTION_EVENT);
                        // setTimeout(() => {
                        //   setReactionDisabled(false);
                        // }, 2000);
                      }}
                    >
                      <EmojiDisplay
                        emoji={emoji}
                        fontSize={"18px"}
                        buttonDisabled={reactionDisabled}
                        setButtonDisabled={setReactionDisabled}
                      />
                    </Button>
                  ))}
                </Flex>
              )}
              <Flex justifyContent={"space-between"}>
                <Flex gap="1rem">
                  {clipLoading ? (
                    <Flex alignSelf="center" mr="8px">
                      <Spinner />
                    </Flex>
                  ) : (
                    <Popover trigger="hover" placement="top" openDelay={500}>
                      <PopoverTrigger>
                        <IconButton
                          icon={<Image src="/svg/cut.svg" height={"20px"} />}
                          aria-label="clip stream"
                          bg="transparent"
                          _focus={{}}
                          _hover={{ transform: "scale(1.15)" }}
                          _active={{ transform: "scale(1.3)" }}
                          minWidth="auto"
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
                          icon={
                            <Image src="/svg/pop-out.svg" height={"20px"} />
                          }
                          bg="transparent"
                          minWidth="auto"
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
                  <Popover trigger="hover" placement="top" openDelay={500}>
                    <PopoverTrigger>
                      <IconButton
                        color="white"
                        icon={<GiTalk size={20} />}
                        bg="transparent"
                        aria-label="react"
                        _focus={{}}
                        _hover={{ transform: "scale(1.15)" }}
                        _active={{ transform: "scale(1.3)" }}
                        onClick={() => {
                          setCommandsOpen(!commandsOpen);
                          if (!commandsOpen) setInstantCommandSend(true);
                        }}
                        minWidth="auto"
                      />
                    </PopoverTrigger>
                    <PopoverContent
                      bg="#925800"
                      border="none"
                      width="100%"
                      p="2px"
                    >
                      <PopoverArrow bg="#925800" />
                      <Text fontSize="12px" textAlign={"center"}>
                        use chat commands for this stream!
                      </Text>
                    </PopoverContent>
                  </Popover>
                  {(isOwner || isVip) && (
                    <Popover trigger="hover" placement="top" openDelay={500}>
                      <PopoverTrigger>
                        <IconButton
                          icon={<Image src="/svg/blast.svg" height={"20px"} />}
                          aria-label="clip stream"
                          bg={blastMode ? "red" : "transparent"}
                          _focus={{}}
                          _hover={{ transform: "scale(1.15)" }}
                          _active={{ transform: "scale(1.3)" }}
                          style={{
                            cursor: blastDisabled ? "not-allowed" : "pointer",
                          }}
                          minWidth="auto"
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
                  color="white"
                  icon={<BsFillHeartFill size={15} />}
                  bg="transparent"
                  aria-label="react"
                  _focus={{}}
                  _hover={{ transform: "scale(1.15)" }}
                  _active={{ transform: "scale(1.3)" }}
                  onClick={() =>
                    setShowEmojiReactionList(!showEmojiReactionList)
                  }
                  minWidth="auto"
                />
              </Flex>
              <Flex
                mt="5px"
                position="relative"
                direction="column"
                border={blastMode ? "1px solid red" : "1px solid #FAFAFA"}
                p="5px"
                background={blastMode ? "rgba(255, 108, 108, 0.35)" : "#131225"}
              >
                <Flex alignItems="center" gap="5px">
                  <Input
                    ref={inputRef}
                    variant="unstyled"
                    size="sm"
                    maxLength={500}
                    value={messageText}
                    color={"FAFAFA"}
                    fontWeight="medium"
                    placeholder={
                      blastMode
                        ? "blast a message to everyone watching!"
                        : "say something in chat!"
                    }
                    enterKeyHint="send"
                    onChange={(e) => {
                      if (e.target.value === "") {
                        setInstantCommandSend(false);
                        setCommandsOpen(false);
                      }
                      setMessageText(e.target.value);
                    }}
                    onKeyPress={handleKeyPress}
                    style={{ zIndex: 0, minHeight: "50px" }}
                    height={"100%"}
                    minHeight={"0px !important"}
                  />
                  <IconButton
                    size={"10px"}
                    type="submit"
                    isDisabled={messageTextIsEmpty}
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
                    onClose={() => {
                      setCommandsOpen(false);
                      setInstantCommandSend(false);
                    }}
                    onCommandClick={(text: string) => {
                      if (instantCommandSend && !text.includes("!chatbot")) {
                        sendChatMessage(
                          text,
                          false,
                          isVipChat ? SenderStatus.VIP : SenderStatus.USER
                        );
                      } else {
                        focusInput();
                        setMessageText(text);
                      }
                      setCommandsOpen(false);
                      setInstantCommandSend(false);
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
