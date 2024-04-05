import { Box, Image, Flex, Link, Text } from "@chakra-ui/react";
import React, { useMemo } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

import { InteractionType } from "../../constants";
import { useUser } from "../../hooks/context/useUser";
import centerEllipses from "../../utils/centerEllipses";
import {
  Message,
  SelectedUser,
  SenderStatus,
} from "../../constants/types/chat";
import { useChannelContext } from "../../hooks/context/useChannel";
import Badges from "./Badges";
import { formatTimestampToTime } from "../../utils/time";

type Props = {
  index: number;
  message: Message;
  messageText: string;
  linkArray: RegExpMatchArray | null;
  handleOpen: (value?: SelectedUser) => void;
};

// if isVipChat is true, messages with SenderStatus.VIP will be displayed, else they are blurred,
// messages with SenderStatus.MODERATOR are always displayed when isVipChat is false or true.

const MessageBody = ({
  message,
  index,
  messageText,
  linkArray,
  handleOpen,
}: Props) => {
  const { channel: c, leaderboard } = useChannelContext();
  const { isVip: userIsVip } = leaderboard;
  const { channelQueryData, channelRoles } = c;
  const { user } = useUser();

  const userIsChannelOwner = useMemo(
    () => user?.address === channelQueryData?.owner.address,
    [user, channelQueryData]
  );

  const userIsModerator = useMemo(
    () =>
      channelRoles?.some((m) => m?.address === user?.address && m?.role === 2),
    [user, channelRoles]
  );

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

  const messageStyle = () => {
    const eventTypes = [
      InteractionType.EVENT_LIVE,
      InteractionType.EVENT_LOCK,
      InteractionType.EVENT_UNLOCK,
      InteractionType.EVENT_PAYOUT,
    ];

    const tempTokenInteractionTypes = [
      InteractionType.CREATE_TEMP_TOKEN,
      InteractionType.BUY_TEMP_TOKENS,
      InteractionType.SELL_TEMP_TOKENS,
      InteractionType.TEMP_TOKEN_EXPIRED,
      InteractionType.TEMP_TOKEN_EXPIRATION_WARNING,
      InteractionType.TEMP_TOKEN_REACHED_THRESHOLD,
      InteractionType.TEMP_TOKEN_DURATION_INCREASED,
      InteractionType.TEMP_TOKEN_BECOMES_ALWAYS_TRADEABLE,
      InteractionType.TEMP_TOKEN_THRESHOLD_INCREASED,
      InteractionType.SEND_REMAINING_FUNDS_TO_WINNER_AFTER_TEMP_TOKEN_EXPIRATION,
    ];

    if (
      message.data.body &&
      (eventTypes as string[]).includes(message.data.body.split(":")[0])
    ) {
      return {
        bg: "rgba(63, 59, 253, 1)",
      };
    } else if (
      message.data.body &&
      (tempTokenInteractionTypes as string[]).includes(
        message.data.body.split(":")[0]
      )
    ) {
      return {
        bg: "rgba(55, 255, 139, 0.26)",
        textColor: "rgba(55, 255, 139, 1)",
        fontStyle: "italic",
        showTimestamp: true,
      };
    } else if (
      message.data.body &&
      message.data.body.split(":")[0] === InteractionType.CLIP
    ) {
      return {
        bgGradient:
          "linear-gradient(138deg, rgba(0,0,0,1) 10%, rgba(125,125,125,1) 11%, rgba(125,125,125,1) 20%, rgba(0,0,0,1) 21%, rgba(0,0,0,1) 30%, rgba(125,125,125,1) 31%, rgba(125,125,125,1) 40%, rgba(0,0,0,1) 41%, rgba(0,0,0,1) 50%, rgba(125,125,125,1) 51%, rgba(125,125,125,1) 60%, rgba(0,0,0,1) 61%, rgba(0,0,0,1) 70%, rgba(125,125,125,1) 71%, rgba(125,125,125,1) 80%, rgba(0,0,0,1) 81%, rgba(0,0,0,1) 90%, rgba(125,125,125,1) 91%)",
      };
    } else if (
      message.data.body &&
      message.data.body.split(":")[0] === InteractionType.BUY_VOTES
    ) {
      if (message.data.body?.split(":")[3] === "yay") {
        return {
          bg: "#1B9C9C",
        };
      } else {
        return {
          bg: "#D343F7",
        };
      }
    } else if (
      message.data.body &&
      message.data.body.split(":")[0] === InteractionType.BUY_VIBES
    ) {
      return {
        bg: "rgba(10, 179, 18, 1)",
      };
    } else if (
      message.data.body &&
      message.data.body.split(":")[0] === InteractionType.SELL_VIBES
    ) {
      return {
        bg: "rgba(218, 58, 19, 1)",
      };
    } else {
      return {
        // bg: "rgba(19, 18, 37, 1)",
      };
    }
  };

  return (
    <>
      <Flex direction="column">
        <Flex
          className="showhim"
          justifyContent={
            user?.address === message.data.address ? "end" : "start"
          }
          bg={messageStyle().bg}
          borderRadius="10px"
        >
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
                      normalUserReceivesVipMessages ? "blur(5px)" : "blur(0px)"
                    }
                    fontSize={"12px"}
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
                    color={messageStyle().textColor ?? "white"}
                    fontStyle={messageStyle().fontStyle}
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
                )}
              </Text>
            </Box>
          </Flex>
          {messageStyle().showTimestamp && message.data.username === "🤖" && (
            <Flex bg="rgba(0, 0, 0, 0.1)" px="0.4rem">
              <Text fontSize="10px" whiteSpace={"nowrap"} fontStyle="italic">
                {formatTimestampToTime(message.timestamp)}
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>
    </>
  );
};

export default MessageBody;
