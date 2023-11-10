import {
  Box,
  Image,
  Flex,
  Link,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  Spinner,
} from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

import {
  APPOINT_USER_EVENT,
  BAN_USER_EVENT,
  InteractionType,
  NULL_ADDRESS,
} from "../../constants";
import { useUser } from "../../hooks/context/useUser";
import centerEllipses from "../../utils/centerEllipses";
import { Message, SenderStatus } from "../../constants/types/chat";
import { useChannelContext } from "../../hooks/context/useChannel";
import usePostUserRoleForChannel from "../../hooks/server/usePostUserRoleForChannel";
import Badges from "./Badges";

type Props = {
  index: number;
  message: Message;
  messageText: string;
  linkArray: RegExpMatchArray | null;
  channel: any;
};

// if isVipChat is true, messages with SenderStatus.VIP will be displayed, else they are blurred

const MessageBody = ({
  message,
  index,
  messageText,
  linkArray,
  channel,
}: Props) => {
  const { channel: c, leaderboard } = useChannelContext();
  const { isVip } = leaderboard;
  const { channelQueryData } = c;
  const { user } = useUser();
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
        // bg: "rgba(19, 18, 37, 1)",
      };
    }
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
          <Flex direction={"column"} width="100%">
            <Box
              key={index}
              borderRadius="10px"
              {...messageBg()}
              p="5px"
              position="relative"
            >
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
              <Text as="span">
                <Badges user={user} message={message} />
                <Text
                  as="span"
                  onClick={() => {
                    if (message.data.username !== "chatbot🤖") setIsOpen(true);
                  }}
                  _hover={{ cursor: "pointer" }}
                  fontSize="12px"
                  color={message.data.chatColor}
                  fontWeight="bold"
                >
                  {message.data.username
                    ? message.data.username
                    : centerEllipses(message.data.address, 10)}
                </Text>
                :{" "}
                {message.data.isGif && (
                  <>
                    <Image
                      src={messageText}
                      display="inline"
                      verticalAlign={"middle"}
                      h="40px"
                      p="5px"
                    />
                    <Image
                      src={messageText}
                      display="inline"
                      verticalAlign={"middle"}
                      h="40px"
                      p="5px"
                    />
                    <Image
                      src={messageText}
                      display="inline"
                      verticalAlign={"middle"}
                      h="40px"
                      p="5px"
                    />
                  </>
                )}
                {!message.data.isGif && linkArray && (
                  <Text
                    as="span"
                    color="#15dae4"
                    filter={
                      message.data.senderStatus === SenderStatus.VIP &&
                      !userIsChannelOwner &&
                      !userIsModerator &&
                      !isVip
                        ? "blur(5px)"
                        : "blur(0px)"
                    }
                    fontSize={
                      message.data.address === NULL_ADDRESS ? "12px" : "14px"
                    }
                    wordBreak="break-word"
                    textAlign="left"
                  >
                    {fragments.map((fragment, i) => {
                      if (fragment.isLink) {
                        return (
                          <Link href={fragment.message} isExternal key={i}>
                            {fragment.message}
                            <ExternalLinkIcon mx="2px" />
                          </Link>
                        );
                      } else {
                        return <span key={i}>{fragment.message}</span>;
                      }
                    })}
                  </Text>
                )}
                {!message.data.isGif && !linkArray && (
                  <Text
                    as="span"
                    color="white"
                    fontSize={
                      message.data.address === NULL_ADDRESS ? "12px" : "14px"
                    }
                    wordBreak="break-word"
                    textAlign="left"
                    filter={
                      message.data.senderStatus === SenderStatus.VIP &&
                      !userIsChannelOwner &&
                      !userIsModerator &&
                      !isVip
                        ? "blur(5px)"
                        : "blur(0px)"
                    }
                  >
                    {messageText.split("\n").map((line, index) => (
                      <span key={index}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </Text>
                )}
              </Text>
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
