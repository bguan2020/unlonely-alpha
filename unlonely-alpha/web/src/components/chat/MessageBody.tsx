import { AddIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Flex, Text, Image, Link } from "@chakra-ui/react";
import React, { useState } from "react";

import { useUser } from "../../hooks/useUser";
import { timestampConverter } from "../../utils/timestampConverter";
import NebulousButton from "../general/button/NebulousButton";
import NFTList from "../profile/NFTList";
import Badges from "./Badges";
import EmojiDisplay from "./emoji/EmojiDisplay";
import { Message } from "./types";

type Props = {
  index: number;
  message: Message;
  messageText: string;
  isLink: boolean;
  splitURL: string[] | undefined;
  channel: any;
};

export const chatbotAddress = "0x0000000000000000000000000000000000000000";
export const emojis = [
  "https://i.imgur.com/wbUNcyS.gif",
  "https://i.imgur.com/zTfFgtZ.gif",
  "https://i.imgur.com/NurjwAK.gif",
  "⛽️",
  "😂",
  "❤️",
  "👑",
  "👀",
  "👍",
  "👎",
  "🚀",
];
const ADD_REACTION_EVENT = "add-reaction";

const MessageBody = ({
  message,
  index,
  messageText,
  isLink,
  splitURL,
  channel,
}: Props) => {
  const { user } = useUser();
  const [showEmojiList, setShowEmojiList] = useState<null | string>(null);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [emojiList, setEmojiList] = useState<string[]>(emojis);

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

  return (
    <>
      <Flex direction="column">
        <Flex direction="row" align="center">
          <Text color="#5A5A5A" fontSize="12px" mr="5px">
            {`${timestampConverter(message.timestamp)}`}
          </Text>
          <Badges user={user} message={message} />
          <NFTList
            address={message.data.address}
            author={message.data.username}
            isLens={message.data.isLens}
            lensHandle={message.data.lensHandle}
          />
        </Flex>
        <div className="showhim">
          {message.data.nfcRank && message.data.nfcRank > 0 ? (
            <Box
              key={index}
              borderRadius="10px"
              // bg={message.data.chatColor}
              bgGradient="linear(to-r, #d16fce, #7655D2, #4173D6, #4ABBDF)"
              pr="10px"
              pl="10px"
              mb="10px"
              pb={showEmojiList === message.id ? "10px" : "0px"}
              position="relative"
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
                    {isLink && splitURL ? (
                      <>
                        {splitURL.length > 1 ? (
                          <>
                            <Text
                              color="white"
                              fontFamily="Inter"
                              fontSize={12}
                              wordBreak="break-word"
                              textAlign="left"
                            >
                              {splitURL[0]}
                            </Text>
                            <Link
                              href={splitURL[splitURL.length - 1]}
                              isExternal
                              color="white"
                              fontSize={12}
                              fontFamily="Inter"
                              wordBreak="break-word"
                              textAlign="left"
                            >
                              {splitURL[splitURL.length - 1]}
                              <ExternalLinkIcon mx="2px" />
                            </Link>
                          </>
                        ) : (
                          <Link
                            href={messageText}
                            fontFamily="Inter"
                            fontWeight="light"
                            isExternal
                            color="white"
                            fontSize={12}
                            wordBreak="break-word"
                            textAlign="left"
                          >
                            {messageText}
                            <ExternalLinkIcon mx="2px" />
                          </Link>
                        )}
                      </>
                    ) : (
                      <Text
                        color="white"
                        fontFamily="Inter"
                        fontWeight="light"
                        fontSize={
                          message.data.address === chatbotAddress ? 10 : 12
                        }
                        wordBreak="break-word"
                        textAlign="left"
                      >
                        {messageText}
                      </Text>
                    )}
                  </>
                )}
                <div
                  className="showme"
                  style={{
                    position: "absolute",
                    right: "5px",
                    bottom: "0px",
                  }}
                >
                  <NebulousButton
                    opacity={"0.3"}
                    aria-label="Chat-Reaction"
                    onClick={() =>
                      setShowEmojiList(showEmojiList ? null : message.id)
                    }
                    height="12px"
                    width="12px"
                  >
                    <AddIcon height="12px" width="12px" />
                  </NebulousButton>
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
                      {reaction.count > 0 ? (
                        <>
                          <Flex flexDirection="row">
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
                        </>
                      ) : null}
                    </div>
                  ))}
                </Flex>
              </Flex>
              {showEmojiList === message.id ? (
                <Flex
                  flexWrap="wrap"
                  background={"rgba(255, 255, 255, 0.5)"}
                  borderRadius={"10px"}
                >
                  {emojiList.map((emoji) => (
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
              ) : null}
            </Box>
          ) : (
            <Box
              key={index}
              borderRadius="10px"
              bg={message.data.chatColor}
              pr="10px"
              pl="10px"
              mb="10px"
              pb={showEmojiList === message.id ? "10px" : "0px"}
              position="relative"
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
                    {isLink && splitURL ? (
                      <>
                        {splitURL.length > 1 ? (
                          <>
                            <Text
                              color="white"
                              fontFamily="Inter"
                              fontSize={12}
                              wordBreak="break-word"
                              textAlign="left"
                            >
                              {splitURL[0]}
                            </Text>
                            <Link
                              href={splitURL[splitURL.length - 1]}
                              isExternal
                              color="white"
                              fontSize={12}
                              fontFamily="Inter"
                              wordBreak="break-word"
                              textAlign="left"
                            >
                              {splitURL[splitURL.length - 1]}
                              <ExternalLinkIcon mx="2px" />
                            </Link>
                          </>
                        ) : (
                          <Link
                            href={messageText}
                            fontFamily="Inter"
                            fontWeight="light"
                            isExternal
                            color="white"
                            fontSize={12}
                            wordBreak="break-word"
                            textAlign="left"
                          >
                            {messageText}
                            <ExternalLinkIcon mx="2px" />
                          </Link>
                        )}
                      </>
                    ) : (
                      <Text
                        color="white"
                        fontFamily="Inter"
                        fontWeight="light"
                        fontSize={
                          message.data.address === chatbotAddress ? 10 : 12
                        }
                        wordBreak="break-word"
                        textAlign="left"
                      >
                        {messageText}
                      </Text>
                    )}
                  </>
                )}
                <div
                  className="showme"
                  style={{
                    position: "absolute",
                    right: "5px",
                    bottom: "0px",
                  }}
                >
                  <NebulousButton
                    opacity={"0.3"}
                    aria-label="Chat-Reaction"
                    onClick={() =>
                      setShowEmojiList(showEmojiList ? null : message.id)
                    }
                    height="12px"
                    width="12px"
                  >
                    <AddIcon height="12px" width="12px" />
                  </NebulousButton>
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
                      {reaction.count > 0 ? (
                        <>
                          <Flex flexDirection="row">
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
                        </>
                      ) : null}
                    </div>
                  ))}
                </Flex>
              </Flex>
              {showEmojiList === message.id ? (
                <Flex
                  flexWrap="wrap"
                  background={"rgba(255, 255, 255, 0.5)"}
                  borderRadius={"10px"}
                >
                  {emojiList.map((emoji) => (
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
              ) : null}
            </Box>
          )}
        </div>
      </Flex>
    </>
  );
};

export default MessageBody;
