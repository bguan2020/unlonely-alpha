import { AddIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Text,
  Image,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  Link,
  Spinner,
} from "@chakra-ui/react";
import React, { useMemo, useState } from "react";

import {
  ADD_REACTION_EVENT,
  APPOINT_USER_EVENT,
  BAN_USER_EVENT,
  InteractionType,
  NULL_ADDRESS,
} from "../../constants";
import { useUser } from "../../hooks/context/useUser";
import centerEllipses from "../../utils/centerEllipses";
import Badges from "./Badges";
import EmojiDisplay from "./emoji/EmojiDisplay";
import { Message } from "../../constants/types/chat";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { useChannelContext } from "../../hooks/context/useChannel";
import usePostUserRoleForChannel from "../../hooks/server/usePostUserRoleForChannel";
import { REACTION_EMOJIS } from "./emoji/constants";

type Props = {
  index: number;
  message: Message;
  messageText: string;
  linkArray: RegExpMatchArray | null;
  channel: any;
};

const MessageBody = ({
  message,
  index,
  messageText,
  linkArray,
  channel,
}: Props) => {
  const { channel: c } = useChannelContext();
  const { channelQueryData } = c;
  const { user } = useUser();
  const { isStandalone } = useUserAgent();
  const [showEmojiList, setShowEmojiList] = useState<null | string>(null);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { postUserRoleForChannel, loading } = usePostUserRoleForChannel({
    onError: (error) => {
      console.log(error);
    },
  });

  const [isBanning, setIsBanning] = useState<boolean>(false);
  const [isAppointing, setIsAppointing] = useState<boolean>(false);

  const userIsChannelOwner = useMemo(
    () => user?.address === channelQueryData?.owner.address,
    [user, channelQueryData]
  );

  const userIsModerator = useMemo(
    () =>
      channelQueryData?.roles?.some(
        (m) => m?.userAddress === user?.address && m?.role === 2
      ),
    [user, channelQueryData]
  );

  const fragments = useMemo(() => {
    let lastIndex = 0;
    const fragments: { message: string; isLink: boolean }[] = [];

    linkArray?.forEach((link) => {
      const startIndex = messageText.indexOf(link, lastIndex);
      if (startIndex > lastIndex) {
        fragments.push({
          message: messageText.substring(lastIndex, startIndex),
          isLink: false,
        });
      }
      fragments.push({ message: link, isLink: true });
      lastIndex = startIndex + link.length;
    });

    if (lastIndex < messageText.length) {
      fragments.push({
        message: messageText.substring(lastIndex),
        isLink: false,
      });
    }

    return fragments;
  }, [messageText, linkArray]);

  const messageBg = () => {
    if (
      message.data.body &&
      message.data.body.split(":")[0] === InteractionType.CUSTOM
    ) {
      return {
        bgGradient: "linear(to-r, #d16fce, #7655D2, #4173D6, #4ABBDF)",
      };
    } else {
      return {
        bg: "#3c3548",
      };
    }
  };

  // publish emoji reaction using timeserial
  const sendMessageReaction = (
    emoji: string,
    timeserial: any,
    reactionEvent: string
  ) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    channel.publish(reactionEvent, {
      body: emoji,
      name: reactionEvent,
      extras: {
        reference: { type: "com.ably.reaction", timeserial },
      },
    });
    setShowEmojiList(null);
  };

  const ban = async () => {
    await postUserRoleForChannel({
      channelId: channelQueryData?.id,
      userAddress: message.data.address,
      role: 1,
    });
    channel.publish({
      name: BAN_USER_EVENT,
      data: { body: message.data.address },
    });
    setIsBanning(false);
    setIsOpen(false);
  };

  const appoint = async () => {
    await postUserRoleForChannel({
      channelId: channelQueryData?.id,
      userAddress: message.data.address,
      role: 2,
    });
    channel.publish({
      name: APPOINT_USER_EVENT,
      data: { body: message.data.address },
    });
    setIsAppointing(false);
    setIsOpen(false);
  };

  return (
    <>
      <Flex direction="column">
        <Flex
          className="showhim"
          justifyContent={
            user?.address === message.data.address ? "end" : "start"
          }
        >
          <Flex direction={"column"}>
            <Flex direction="row" align="center">
              <Badges user={user} message={message} />
              <ChatUserModal
                isOpen={isOpen}
                handleClose={() => {
                  setIsBanning(false);
                  setIsAppointing(false);
                  setIsOpen(false);
                }}
              >
                {!isBanning && !isAppointing && (
                  <>
                    <Text
                      _hover={{ cursor: "pointer" }}
                      fontSize="16px"
                      color={message.data.chatColor}
                      fontWeight="bold"
                    >
                      {message.data.username
                        ? message.data.username
                        : centerEllipses(message.data.address, 10)}
                      :
                    </Text>
                    {message.data.address}
                    {(userIsChannelOwner || userIsModerator) &&
                      message.data.address !==
                        channelQueryData?.owner.address &&
                      message.data.address !== user?.address &&
                      !isBanning && (
                        <>
                          {!channelQueryData?.roles?.some(
                            (m) =>
                              m?.userAddress === message.data.address &&
                              m?.role === 2
                          ) ? (
                            <Button
                              mt="20px"
                              bg="#842007"
                              _hover={{}}
                              _focus={{}}
                              _active={{}}
                              onClick={() => setIsBanning(true)}
                            >
                              ban user from chat
                            </Button>
                          ) : (
                            <Text
                              textAlign={"center"}
                              fontSize="14px"
                              color="#db9719"
                            >
                              Cannot ban this user because they are a moderator,
                              remove their status on your dashboard first
                            </Text>
                          )}
                        </>
                      )}
                    {userIsChannelOwner &&
                      message.data.address !== user?.address &&
                      !channelQueryData?.roles?.some(
                        (m) =>
                          m?.userAddress === message.data.address &&
                          m?.role === 2
                      ) &&
                      !isAppointing && (
                        <Button
                          mt="20px"
                          bg="#074a84"
                          _hover={{}}
                          _focus={{}}
                          _active={{}}
                          onClick={() => setIsAppointing(true)}
                        >
                          appoint user as chat moderator
                        </Button>
                      )}
                  </>
                )}
                {isBanning && (
                  <>
                    {!loading ? (
                      <Flex direction="column" gap="10px">
                        <Text textAlign="center">
                          are you sure you want to ban this user from chatting
                          on your channel and all their chat messages?
                        </Text>
                        <Flex justifyContent={"space-evenly"}>
                          <Button
                            bg="#b12805"
                            _hover={{}}
                            _focus={{}}
                            _active={{}}
                            onClick={ban}
                          >
                            yes, do it
                          </Button>
                          <Button
                            opacity={"0.5"}
                            border={"1px solid white"}
                            bg={"transparent"}
                            _hover={{}}
                            _focus={{}}
                            _active={{}}
                            onClick={() => setIsBanning(false)}
                          >
                            maybe not...
                          </Button>
                        </Flex>
                      </Flex>
                    ) : (
                      <Flex justifyContent={"center"}>
                        <Spinner size="xl" />
                      </Flex>
                    )}
                  </>
                )}
                {isAppointing && (
                  <>
                    {!loading ? (
                      <Flex direction="column" gap="10px">
                        <Text textAlign="center">
                          are you sure you want to make this user a chat
                          moderator?
                        </Text>
                        <Text textAlign="center" color="#8ced15">
                          you can always remove their status through your
                          dashboard
                        </Text>
                        <Flex justifyContent={"space-evenly"}>
                          <Button
                            bg="#054db1"
                            _hover={{}}
                            _focus={{}}
                            _active={{}}
                            onClick={appoint}
                          >
                            yes, do it
                          </Button>
                          <Button
                            opacity={"0.5"}
                            border={"1px solid white"}
                            bg={"transparent"}
                            _hover={{}}
                            _focus={{}}
                            _active={{}}
                            onClick={() => setIsAppointing(false)}
                          >
                            maybe not...
                          </Button>
                        </Flex>
                      </Flex>
                    ) : (
                      <Flex justifyContent={"center"}>
                        <Spinner size="xl" />
                      </Flex>
                    )}
                  </>
                )}
              </ChatUserModal>
              <Text
                onClick={() => setIsOpen(true)}
                _hover={{ cursor: "pointer" }}
                fontSize="16px"
                color={message.data.chatColor}
                fontWeight="bold"
              >
                {message.data.username
                  ? message.data.username
                  : centerEllipses(message.data.address, 10)}
                :
              </Text>
            </Flex>
            <Box
              key={index}
              borderRadius="10px"
              {...messageBg()}
              pr="2px"
              pl="2px"
              mt="5px"
              mb="15px"
              pb={showEmojiList === message.id ? "10px" : "0px"}
              position="relative"
              width={!isStandalone ? "274px" : "100%"}
            >
              <Flex justifyContent="space-between" flexDirection="column">
                {message.data.isGif ? (
                  <>
                    <Flex flexDirection="row">
                      <Image src={messageText} h="40px" p="5px" />
                      <Image src={messageText} h="40px" p="5px" />
                      <Image src={messageText} h="40px" p="5px" />
                    </Flex>
                  </>
                ) : (
                  <>
                    {linkArray ? (
                      <Flex direction="column">
                        <Text
                          fontSize={
                            message.data.address === NULL_ADDRESS
                              ? "12px"
                              : "14px"
                          }
                          wordBreak="break-word"
                          textAlign="left"
                          p={"5px"}
                        >
                          {fragments.map((fragment, i) => {
                            if (fragment.isLink) {
                              return (
                                <Link
                                  href={fragment.message}
                                  isExternal
                                  key={i}
                                >
                                  {fragment.message}
                                  <ExternalLinkIcon mx="2px" />
                                </Link>
                              );
                            } else {
                              return <span key={i}>{fragment.message}</span>;
                            }
                          })}
                        </Text>
                      </Flex>
                    ) : (
                      <Text
                        color="white"
                        fontSize={
                          message.data.address === NULL_ADDRESS
                            ? "12px"
                            : "14px"
                        }
                        wordBreak="break-word"
                        textAlign="left"
                        p={"5px"}
                      >
                        {messageText.split("\n").map((line, index) => (
                          <span key={index}>
                            {line}
                            <br />
                          </span>
                        ))}
                      </Text>
                    )}
                  </>
                )}
                <div
                  className="showme"
                  style={{
                    position: "absolute",
                    left: "5px",
                    bottom: "-10px",
                  }}
                >
                  <Flex
                    borderRadius={"5px"}
                    p="1px"
                    bg={
                      "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
                    }
                  >
                    <Button
                      aria-label="Chat-Reaction"
                      onClick={() =>
                        setShowEmojiList(showEmojiList ? null : message.id)
                      }
                      height="12px"
                      width="12px"
                      padding={"10px"}
                      minWidth={"0px"}
                      bg={"#C6C0C0"}
                      _hover={{}}
                      _active={{}}
                      _focus={{}}
                    >
                      <AddIcon height="12px" width="12px" color={"white"} />
                    </Button>
                  </Flex>
                </div>
                <Flex flexDirection="row">
                  {message.data.reactions?.map((reaction) => (
                    <div
                      key={reaction.emojiType}
                      className={
                        "text-xs rounded-full p-2 m-1 space-x-2  bg-slate-100 hover:bg-slate-50"
                      }
                      style={{
                        cursor: buttonDisabled ? "not-allowed" : "pointer",
                      }}
                      onClick={() => {
                        if (buttonDisabled) return;
                        sendMessageReaction(
                          reaction.emojiType,
                          message.extras.timeserial,
                          ADD_REACTION_EVENT
                        );
                        setTimeout(() => {
                          setButtonDisabled(false);
                        }, 3000);
                        setButtonDisabled(true);
                      }}
                    >
                      {reaction.count > 0 && (
                        <Flex
                          flexDirection="row"
                          alignItems={"center"}
                          bgColor="#5A5A5A"
                          borderRadius={"10px"}
                          mb={"5px"}
                        >
                          <EmojiDisplay
                            emoji={reaction.emojiType}
                            fontSize={"16px"}
                            buttonDisabled={buttonDisabled}
                            setButtonDisabled={setButtonDisabled}
                          />
                          <span>
                            <Flex
                              pl="2px"
                              textColor="white"
                              fontSize="14px"
                              mr="4px"
                            >
                              {reaction.count}
                            </Flex>
                          </span>
                        </Flex>
                      )}
                    </div>
                  ))}
                </Flex>
              </Flex>
              {showEmojiList === message.id && (
                <Flex
                  flexWrap="wrap"
                  background={"rgba(255, 255, 255, 0.5)"}
                  borderRadius={"10px"}
                >
                  {REACTION_EMOJIS.map((emoji) => (
                    <Box
                      minH="40px"
                      background="transparent"
                      p="5px"
                      key={emoji}
                      style={{
                        cursor: buttonDisabled ? "not-allowed" : "pointer",
                      }}
                      onClick={() => {
                        setButtonDisabled(true);
                        sendMessageReaction(
                          emoji,
                          message.extras.timeserial,
                          ADD_REACTION_EVENT
                        );
                        setTimeout(() => {
                          setButtonDisabled(false);
                        }, 2000);
                      }}
                    >
                      <EmojiDisplay
                        emoji={emoji}
                        fontSize={"18px"}
                        buttonDisabled={buttonDisabled}
                        setButtonDisabled={setButtonDisabled}
                        channel={channel}
                        timeserial={message.extras.timeserial}
                      />
                    </Box>
                  ))}
                </Flex>
              )}
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

const ChatUserModal = ({
  isOpen,
  handleClose,
  children,
}: {
  isOpen: boolean;
  handleClose: () => void;
  children?: React.ReactNode;
}) => {
  return (
    <Modal isCentered isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay backgroundColor="#282828e6" />
      <ModalContent
        maxW="500px"
        boxShadow="0px 8px 28px #0a061c40"
        padding="12px"
        borderRadius="5px"
        bg="#3A3A3A"
      >
        {children}
      </ModalContent>
    </Modal>
  );
};

export default MessageBody;
