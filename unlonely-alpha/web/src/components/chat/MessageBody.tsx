import {
  Box,
  Image,
  Flex,
  Link,
  Text,
  IconButton,
  Button,
  Input,
} from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
} from "@chakra-ui/icons";

import {
  CHAT_MESSAGE_EVENT,
  ETH_COST_FOR_ONE_NFT_MINT,
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
import {
  filteredInput,
  formatIncompleteNumber,
} from "../../utils/validation/input";

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
  const [selectedTokensToMint, setSelectedTokensToMint] = useState<string>("1");
  const [customAmountSelected, setCustomAmountSelected] = useState(false);
  const [customTokensToMint, setCustomTokensToMint] = useState<string>("");
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
                  <Flex
                    direction="column"
                    bg="rgba(0,0,0,0.5)"
                    p="5px"
                    borderRadius={"15px"}
                  >
                    <Flex gap="20px">
                      {jp(message.data.body as string).zoraLink && (
                        <Link
                          href={jp(message.data.body as string).zoraLink}
                          isExternal
                        >
                          <Text
                            as="span"
                            color="#15dae4"
                            fontSize={"12px"}
                            wordBreak="break-word"
                            textAlign="left"
                          >
                            zora link
                            <ExternalLinkIcon mx="2px" />
                          </Text>
                        </Link>
                      )}
                    </Flex>
                    <Flex gap="10px" alignItems={"center"}>
                      <Button
                        color="rgba(63, 59, 253, 1)"
                        height="20px"
                        width="20px"
                        _hover={{}}
                        bg={
                          selectedTokensToMint === "1"
                            ? "rgba(55, 255, 139, 1)"
                            : "white"
                        }
                        onClick={() => {
                          setCustomAmountSelected(false);
                          setSelectedTokensToMint("1");
                        }}
                      >
                        1
                      </Button>
                      <Button
                        color="rgba(63, 59, 253, 1)"
                        height="20px"
                        width="20px"
                        _hover={{}}
                        bg={
                          selectedTokensToMint === "3"
                            ? "rgba(55, 255, 139, 1)"
                            : "white"
                        }
                        onClick={() => {
                          setCustomAmountSelected(false);
                          setSelectedTokensToMint("3");
                        }}
                      >
                        3
                      </Button>
                      <Button
                        color="rgba(63, 59, 253, 1)"
                        height="20px"
                        width="20px"
                        _hover={{}}
                        bg={
                          selectedTokensToMint === "10"
                            ? "rgba(55, 255, 139, 1)"
                            : "white"
                        }
                        onClick={() => {
                          setCustomAmountSelected(false);
                          setSelectedTokensToMint("10");
                        }}
                      >
                        10
                      </Button>
                      <Button
                        color="rgba(63, 59, 253, 1)"
                        height="20px"
                        width="70px"
                        p="0"
                        _hover={{}}
                        bg={
                          customAmountSelected
                            ? "rgba(55, 255, 139, 1)"
                            : "white"
                        }
                        onClick={() => {
                          setCustomAmountSelected(true);
                          setSelectedTokensToMint(customTokensToMint);
                        }}
                        position={"relative"}
                      >
                        custom
                        <Input
                          cursor="pointer"
                          position="absolute"
                          bottom={customAmountSelected ? "-25px" : "0px"}
                          opacity={customAmountSelected ? 1 : 0}
                          transition={"all 0.3s"}
                          bg={"white"}
                          height="20px"
                          width="70px"
                          p="4px"
                          value={customTokensToMint}
                          onChange={(e) =>
                            setCustomTokensToMint(filteredInput(e.target.value))
                          }
                        />
                      </Button>
                      <Button
                        bg={"rgba(55, 255, 139, 1)"}
                        borderRadius={"50%"}
                        width="70px"
                        minWidth="70px"
                        height="70px"
                        p="0"
                        isDisabled={
                          Number(
                            formatIncompleteNumber(
                              customAmountSelected
                                ? customTokensToMint
                                : selectedTokensToMint
                            )
                          ) === 0 || !user
                        }
                        onClick={async () => {
                          const n = customAmountSelected
                            ? customTokensToMint
                            : selectedTokensToMint;
                          if (n === "0") return;
                          const txr = await handleCollectorMint?.(
                            jp(message.data.body as string).contract1155Address,
                            jp(message.data.body as string).tokenId,
                            BigInt(n)
                          );
                          if (!txr) return;
                          channel?.publish({
                            name: CHAT_MESSAGE_EVENT,
                            data: {
                              messageText: `${
                                user?.username ??
                                centerEllipses(user?.address, 13)
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
                                interactionType:
                                  InteractionType.MINT_NFC_IN_CHAT,
                                contract1155Address: jp(
                                  message.data.body as string
                                ).contract1155Address,
                                tokenId: jp(message.data.body as string)
                                  .tokenId,
                                zoraLink: jp(message.data.body as string)
                                  .zoraLink,
                                title: jp(message.data.body as string).title,
                              }),
                            },
                          });
                        }}
                      >
                        <Text whiteSpace={"normal"} overflowWrap={"break-word"}>
                          MINT NOW
                        </Text>
                      </Button>
                    </Flex>
                    <Flex>
                      <Text fontSize="10px" color="rgba(187, 201, 213, 1)">
                        total cost:{" "}
                        {(customAmountSelected
                          ? Number(customTokensToMint)
                          : Number(selectedTokensToMint)) *
                          ETH_COST_FOR_ONE_NFT_MINT}{" "}
                        ETH
                      </Text>
                    </Flex>
                  </Flex>
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
