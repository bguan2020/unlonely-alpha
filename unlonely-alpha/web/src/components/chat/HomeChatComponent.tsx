import { Box, Text, Flex, useToast } from "@chakra-ui/react";
import React, { useEffect, useMemo, useState } from "react";
import { useChannel } from "../../hooks/chat/useChannel";
import { initializeEmojis } from "./types/index";
import ChatForm from "./ChatForm";
import usePostFirstChat from "../../hooks/server/usePostFirstChat";
import Participants from "../presence/Participants";
import { useUser } from "../../hooks/context/useUser";
import MessageList from "./MessageList";
import { useScrollPercentage } from "../../hooks/internal/useScrollPercentage";
import {
  ADD_REACTION_EVENT,
  NULL_ADDRESS,
  RANDOM_CHAT_COLOR,
} from "../../constants";

const AblyHomeChatComponent = () => {
  const { user, userAddress: address } = useUser();
  /*eslint-disable prefer-const*/
  let inputBox: HTMLTextAreaElement | null = null;
  /*eslint-enable prefer-const*/

  const [formError, setFormError] = useState<null | string[]>(null);
  const [chatHeightGrounded, setChatHeightGrounded] = useState(false);

  const { postFirstChat } = usePostFirstChat({
    onError: (m) => {
      setFormError(m ? m.map((e) => e.message) : ["An unknown error occurred"]);
    },
  });
  const { scrollRef, scrollPercentage } = useScrollPercentage();

  const hasScrolled = useMemo(() => {
    return scrollPercentage < 100 && !chatHeightGrounded;
  }, [scrollPercentage, chatHeightGrounded]);

  const toast = useToast();

  const {
    ablyChannel: channel,
    hasMessagesLoaded,
    setHasMessagesLoaded,
    receivedMessages,
    setReceivedMessages,
  } = useChannel("persistMessages:home-page-chat");

  const sendChatMessage = async (messageText: string, isGif: boolean) => {
    if (user) {
      if (!user.signature) {
        // postFirstChat comes before channel.publish b/c it will set the signature
        // subsequent chats do not need to call postFirstChat first
        await postFirstChat(
          { text: messageText, channelId: 3 },
          { isFirst: true }
        );
        channel.publish({
          name: "chat-message",
          data: {
            messageText,
            username: user.username,
            chatColor: RANDOM_CHAT_COLOR,
            isFC: user.isFCUser,
            isLens: user.isLensUser,
            lensHandle: user.lensHandle,
            address: user.address,
            powerUserLvl: user?.powerUserLvl,
            videoSavantLvl: user?.videoSavantLvl,
            nfcRank: user?.nfcRank,
            isGif,
            reactions: initializeEmojis,
          },
        });
        handleChatCommand(messageText);
      } else {
        channel.publish({
          name: "chat-message",
          data: {
            messageText,
            username: user.username,
            chatColor: RANDOM_CHAT_COLOR,
            isFC: user.isFCUser,
            isLens: user.isLensUser,
            lensHandle: user.lensHandle,
            address: user.address,
            powerUserLvl: user?.powerUserLvl,
            videoSavantLvl: user?.videoSavantLvl,
            nfcRank: user?.nfcRank,
            isGif,
            reactions: initializeEmojis,
          },
        });
        handleChatCommand(messageText);
        // postFirstChat comes after to speed up chat
        await postFirstChat(
          { text: messageText, channelId: 3 },
          { isFirst: false }
        );
      }
    } else {
      if (address) {
        channel.publish({
          name: "chat-message",
          data: {
            messageText,
            username: null,
            chatColor: RANDOM_CHAT_COLOR,
            isFC: false,
            isLens: false,
            address: address,
            powerUserLvl: 0,
            videoSavantLvl: 0,
            nfcRank: 0,
            isGif,
            reactions: initializeEmojis,
          },
        });
      } else {
        toast({
          title: "Sign in first.",
          description: "Please sign into your wallet first.",
          status: "warning",
          duration: 9000,
          isClosable: true,
          position: "top",
        });
      }
    }
    if (inputBox) inputBox.focus();
  };

  const handleChatCommand = async (messageText: string) => {
    let messageToPublish = "";
    let allowPublish = false;

    if (messageText.startsWith("@chatbot")) {
      const prompt = messageText.substring(9);
      const res = await fetch("/api/openai", {
        body: JSON.stringify({
          prompt: `Answer the following prompt: ${prompt}`,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = await res.json();
      messageToPublish = `${data}`;
      allowPublish = true;
    } else if (
      messageText.startsWith("@nfc-it") ||
      messageText.startsWith("@nfc")
    ) {
      messageToPublish = "NFCs are not allowed on this channel.";
      allowPublish = true;
    } else if (messageText.startsWith("@rules")) {
      const rules =
        '"@chatbot [question]" to ask chatbot a question\n"@noFCplz [message]" to not have message casted.\n"@rules" to see these rules.';
      setTimeout(() => {
        messageToPublish = rules;
        publishMessage(messageToPublish);
      }, 1000);
      allowPublish = false;
    }

    if (allowPublish) {
      publishMessage(messageToPublish);
    }
  };

  const publishMessage = (messageText: string) => {
    channel.publish({
      name: "chat-message",
      data: {
        messageText: messageText,
        username: "chatbot🤖",
        address: NULL_ADDRESS,
        isFC: false,
        isLens: false,
        isGif: false,
        reactions: initializeEmojis,
      },
    });
  };

  useEffect(() => {
    async function getMessages() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await channel.history({ limit: 200 }, (err, result) => {
        const messageHistory: any = result.items.filter(
          (message: any) => message.name === "chat-message"
        );
        const reverse = [...messageHistory].reverse();
        setReceivedMessages(reverse);

        // iterate through result
        result.items.forEach((message: any) => {
          if (message.name === ADD_REACTION_EVENT) {
            const reaction = message;
            const timeserial = reaction.data.extras.reference.timeserial;
            const emojiType = reaction.data.body;

            // get index of message in filteredHistory array where timeserial matches
            const index = messageHistory.findIndex(
              (m: any) => m.extras.timeserial === timeserial
            );

            // if index is found, update the message object with the reaction count
            const messageToUpdate = messageHistory[index];
            const emojisToUpdate = messageToUpdate.data.reactions;
            const emojiIndex = emojisToUpdate.findIndex(
              (e: any) => e.emojiType === emojiType
            );

            if (emojiIndex !== -1) {
              emojisToUpdate[emojiIndex].count += 1;
            }
            const updatedMessage = {
              ...messageToUpdate,
              data: {
                ...messageToUpdate.data,
                reactions: emojisToUpdate,
              },
            };
            messageHistory[index] = updatedMessage;
            const reverse = [...messageHistory, message].reverse();
            setReceivedMessages(reverse);
          }
        });
        // Get index of last sent message from history
      });
    }
    getMessages();
  }, []);

  // useeffect to scroll to the bottom of the chat
  // explain what the useEffect below is doing
  useEffect(() => {
    const chat = document.getElementById("chat");
    if (!chat) return;
    if (!hasMessagesLoaded && receivedMessages.length) {
      chat.scrollTop = chat.scrollHeight;
      setHasMessagesLoaded(true);
      return;
    }
    if (scrollPercentage === 100) {
      chat.scrollTop = chat.scrollHeight;
    }
    setChatHeightGrounded(chat.scrollHeight <= chat.clientHeight);
  }, [receivedMessages]);

  const handleScrollToPresent = () => {
    const chat = document.getElementById("chat");
    if (!chat) return;
    chat.scrollTop = chat.scrollHeight;
  };

  return (
    <Flex h="100%" minW="100%">
      <Flex
        mt="10px"
        direction="column"
        minW="100%"
        width="100%"
        position={"relative"}
      >
        <Flex my="10px" direction={"column"}>
          <Text
            lineHeight={5}
            fontWeight="light"
            fontSize={13}
            textAlign="center"
            color="#A9ADCC"
          >
            who's here?
          </Text>
          <Participants ablyPresenceChannel={"home-page-presence"} />
        </Flex>
        <Flex
          direction="column"
          overflowX="auto"
          height="100%"
          id="chat"
          position="relative"
          mt="8px"
          ref={scrollRef}
        >
          <MessageList messages={receivedMessages} channel={channel} />
        </Flex>
        <Flex justifyContent="center">
          {hasScrolled && hasMessagesLoaded ? (
            <Box
              bg="rgba(98, 98, 98, 0.6)"
              p="4px"
              borderRadius="4px"
              _hover={{
                background: "rgba(98, 98, 98, 0.3)",
                cursor: "pointer",
              }}
              onClick={handleScrollToPresent}
            >
              <Text fontSize="12px">
                scrolling paused. click to scroll to bottom.
              </Text>
            </Box>
          ) : null}
        </Flex>
        <Flex mt="40px" w="100%" mb="15px">
          <ChatForm sendChatMessage={sendChatMessage} inputBox={inputBox} />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default AblyHomeChatComponent;
