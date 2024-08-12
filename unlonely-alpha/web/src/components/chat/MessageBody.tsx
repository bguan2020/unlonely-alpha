import { Box, Image, Flex, Link, Text, IconButton } from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
} from "@chakra-ui/icons";

import {
  CHAT_MESSAGE_EVENT,
  InteractionType,
  NULL_ADDRESS,
} from "../../constants";
import { useUser } from "../../hooks/context/useUser";
import centerEllipses from "../../utils/centerEllipses";
import { SenderStatus } from "../../constants/types/chat";
import { useChannelContext } from "../../hooks/context/useChannel";
import Badges from "./Badges";
import { formatTimestampToTime } from "../../utils/time";
import { TiPin } from "react-icons/ti";
import { MessageItemProps } from "./MessageList";
import { messageStyle } from "../../utils/messageStyle";
import { jp } from "../../utils/validation/jsonParse";
import { NfcClipMintInterface } from "../general/NfcClipMintInterface";

type Props = MessageItemProps & {
  messageText: string;
  linkArray: RegExpMatchArray | null;
};

// if isVipChat is true, messages with SenderStatus.VIP will be displayed, else they are blurred,
// messages with SenderStatus.MODERATOR are always displayed when isVipChat is false or true.

const MessageBody = ({
  channel,
  message,
  index,
  messageText,
  linkArray,
  handleOpen,
  handlePinCallback,
  handleCollectorMint,
}: Props) => {
  const { user } = useUser();

  const { channel: c, leaderboard } = useChannelContext();
  const { isVip: userIsVip } = leaderboard;
  const { channelQueryData, channelRoles } = c;

  const [mouseHover, setMouseHover] = useState(false);
  const [nfcExpanded, setNfcExpanded] = useState(false);

  const userIsChannelOwner = useMemo(
    () => user?.address === channelQueryData?.owner.address,
    [user, channelQueryData]
  );

  const userIsModerator = useMemo(
    () =>
      channelRoles?.some((m) => m?.address === user?.address && m?.role === 2),
    [user, channelRoles]
  );

  const isNfcRelated = useMemo(() => {
    return (
      message.data.body &&
      (jp(message.data.body).interactionType === InteractionType.PUBLISH_NFC ||
        jp(message.data.body).interactionType ===
          InteractionType.MINT_NFC_IN_CHAT)
    );
    return false;
  }, [message.data.body]);

  const normalUserReceivesVipMessages = useMemo(
    () =>
      message.data.senderStatus === SenderStatus.VIP &&
      !userIsChannelOwner &&
      !userIsModerator &&
      !userIsVip,
    [userIsChannelOwner, userIsModerator, userIsVip, message.data.senderStatus]
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

  return (
    <>
      <Flex
        direction="column"
        onMouseEnter={
          userIsChannelOwner || userIsModerator
            ? () => setMouseHover(true)
            : undefined
        }
        onMouseLeave={
          userIsChannelOwner || userIsModerator
            ? () => setMouseHover(false)
            : undefined
        }
      >
        <Flex
          className="showhim"
          justifyContent={
            user?.address === message.data.address ? "end" : "start"
          }
          bg={messageStyle(message.data.body).bg}
          bgGradient={messageStyle(message.data.body).bgGradient}
          borderRadius="10px"
          position={"relative"}
        >
          {isNfcRelated ? (
            <Box key={index} p="0.3rem" position="relative" width="100%">
              <Flex direction="column" justifyContent={"center"}>
                <Flex justifyContent={"space-between"}>
                  <Text
                    as="span"
                    color={messageStyle(message.data.body).textColor ?? "white"}
                    fontStyle={messageStyle(message.data.body).fontStyle}
                    fontWeight={messageStyle(message.data.body).fontWeight}
                    fontSize={"12px"}
                    wordBreak="break-word"
                    textAlign="left"
                    filter={
                      normalUserReceivesVipMessages ? "blur(5px)" : "blur(0px)"
                    }
                  >
                    {messageText.split("\n").map((line, index) => (
                      <span key={index}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </Text>
                  {(message.data.body &&
                  jp(message.data.body).interactionType ===
                    InteractionType.MINT_NFC_IN_CHAT
                    ? true
                    : false) && (
                    <IconButton
                      _hover={{
                        color: "rgba(55, 255, 139, 1)",
                        bg: "rgba(0, 0, 0, 0.1)",
                      }}
                      _focus={{}}
                      _active={{}}
                      icon={
                        nfcExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />
                      }
                      aria-label="expand"
                      right="0"
                      height="20px"
                      top="0"
                      bg="transparent"
                      color="white"
                      onClick={() => {
                        setNfcExpanded(!nfcExpanded);
                      }}
                    />
                  )}
                </Flex>
                <MintWrapper
                  hide={
                    !nfcExpanded &&
                    (message.data.body &&
                    jp(message.data.body).interactionType ===
                      InteractionType.MINT_NFC_IN_CHAT
                      ? true
                      : false)
                  }
                >
                  <NfcClipMintInterface
                    contract1155Address={
                      jp(message.data.body as string).contract1155Address
                    }
                    tokenId={jp(message.data.body as string).tokenId}
                    zoraLink={jp(message.data.body as string).zoraLink}
                    mintCallback={async (contract1155Address, tokenId, n) => {
                      const txr = await handleCollectorMint?.(
                        contract1155Address as `0x${string}`,
                        tokenId,
                        n
                      );
                      if (!txr) return;
                      channel?.publish({
                        name: CHAT_MESSAGE_EVENT,
                        data: {
                          messageText: `${
                            user?.username ?? centerEllipses(user?.address, 13)
                          } minted ${n}x "${
                            jp(message.data.body as string).title
                          }"`,
                          username: "🤖",
                          address: NULL_ADDRESS,
                          isFC: false,
                          isLens: false,
                          isGif: false,
                          senderStatus: SenderStatus.CHATBOT,
                          body: JSON.stringify({
                            interactionType: InteractionType.MINT_NFC_IN_CHAT,
                            contract1155Address: jp(message.data.body as string)
                              .contract1155Address,
                            tokenId: jp(message.data.body as string).tokenId,
                            zoraLink: jp(message.data.body as string).zoraLink,
                            title: jp(message.data.body as string).title,
                          }),
                        },
                      });
                    }}
                  />
                </MintWrapper>
              </Flex>
            </Box>
          ) : (
            <Flex direction={"column"} width="100%">
              <Box key={index} px="0.3rem" position="relative">
                <Text as="span">
                  <Badges message={message} />
                  <Text
                    as="span"
                    onClick={() => {
                      if (message.data.username !== "🤖")
                        handleOpen({
                          address: message.data.address,
                          username: message.data.username,
                          FCHandle: message.data.FCHandle,
                        });
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
                  {message.data.username !== "🤖" ? ":" : ""}{" "}
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
                        normalUserReceivesVipMessages
                          ? "blur(5px)"
                          : "blur(0px)"
                      }
                      fontSize={"12px"}
                      wordBreak="break-word"
                      textAlign="left"
                    >
                      {fragments.map((fragment, i) => {
                        if (fragment.isLink) {
                          return (
                            <Link
                              href={
                                fragment.message.startsWith("https://") ||
                                fragment.message.startsWith("http://")
                                  ? fragment.message
                                  : "https://".concat(fragment.message)
                              }
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
                  )}
                  {!message.data.isGif && !linkArray && (
                    <Text
                      as="span"
                      color={
                        messageStyle(message.data.body).textColor ?? "white"
                      }
                      fontStyle={messageStyle(message.data.body).fontStyle}
                      fontWeight={messageStyle(message.data.body).fontWeight}
                      fontSize={"12px"}
                      wordBreak="break-word"
                      textAlign="left"
                      filter={
                        normalUserReceivesVipMessages
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
          )}
          {messageStyle(message.data.body).showTimestamp &&
            message.data.username === "🤖" && (
              <Flex bg="rgba(0, 0, 0, 0.1)" px="0.4rem">
                <Text fontSize="10px" whiteSpace={"nowrap"} fontStyle="italic">
                  {formatTimestampToTime(message.timestamp)}
                </Text>
              </Flex>
            )}
          {mouseHover && !isNfcRelated && (
            <IconButton
              right="2"
              bottom="0"
              height="20px"
              position="absolute"
              aria-label="pin-message"
              icon={<TiPin />}
              onClick={() => handlePinCallback(messageText)}
            />
          )}
        </Flex>
      </Flex>
    </>
  );
};

const MintWrapper = ({
  hide,
  children,
}: {
  hide: boolean;
  children: React.ReactNode;
}) => {
  return <>{!hide && children}</>;
};

export default MessageBody;
