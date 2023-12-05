import { Flex, Box, Text } from "@chakra-ui/react";
import {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  CSSProperties,
  useMemo,
} from "react";

import { ADD_REACTION_EVENT } from "../../constants";
import { ChatReturnType, useChatBox } from "../../hooks/chat/useChat";
import { useChannelContext } from "../../hooks/context/useChannel";
import ChatForm from "./ChatForm";
import MessageList from "./MessageList";
import { useUser } from "../../hooks/context/useUser";
import { VipBadgeBuy } from "../channels/VipBadgeBuy";

const Chat = ({
  chat,
  isVipChat,
}: {
  chat: ChatReturnType;
  isVipChat?: boolean;
}) => {
  const { channel, leaderboard } = useChannelContext();
  const { channelQueryData } = channel;
  const { isVip } = leaderboard;
  const { user } = useUser();

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

  const {
    scrollRef,
    isAtBottom,
    channelChatCommands,
    handleScrollToPresent,
    handleIsAtBottom,
    sendChatMessage,
  } = useChatBox(
    isVipChat ? "vip-chat" : "chat",
    chat.receivedMessages,
    chat.hasMessagesLoaded,
    chat.channel
  );

  const [emojisToAnimate, setEmojisToAnimate] = useState<
    { emoji: string; id: number }[]
  >([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  useLayoutEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };

    updateHeight();

    // Optional: Use ResizeObserver to handle dynamic content resizing
    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  const handleAnimateReactionEmoji = (str: string) => {
    const id = Date.now();
    setEmojisToAnimate((prev) => [...prev, { emoji: str, id }]);

    // Remove the emoji from the state after the animation duration
    setTimeout(() => {
      setEmojisToAnimate((prev) => prev.filter((emoji) => emoji.id !== id));
    }, 4000);
  };

  useEffect(() => {
    if (!chat.allMessages || chat.allMessages.length === 0) return;
    const latestMessage = chat.allMessages[chat.allMessages.length - 1];
    if (
      Date.now() - latestMessage.timestamp < 12000 &&
      latestMessage.name === ADD_REACTION_EVENT &&
      latestMessage.data.body
    )
      handleAnimateReactionEmoji(latestMessage.data.body);
  }, [chat.allMessages]);

  return (
    <Flex
      // mt="40px"
      direction="column"
      minW="100%"
      width="100%"
      h="100%"
      position={"relative"}
    >
      <div
        style={{
          width: "100%",
          position: "absolute",
          pointerEvents: "none",
          height: "100%",
          zIndex: 2,
        }}
        ref={containerRef}
      >
        {emojisToAnimate.map(({ emoji, id }) => (
          <span
            key={id}
            className="floatingEmoji"
            style={
              {
                "--translateY": `${containerHeight - 120}px`,
              } as CSSProperties & { "--translateY": string }
            }
          >
            {emoji}
          </span>
        ))}
      </div>
      {!isVip && !userIsChannelOwner && !userIsModerator && isVipChat && (
        <Flex direction="column">
          <Text textAlign={"center"}>
            You must have a VIP badge to use this chat.
          </Text>
          <VipBadgeBuy />
        </Flex>
      )}
      <Flex
        direction="column"
        overflowX="auto"
        height="100%"
        id={isVipChat ? "vip-chat" : "chat"}
        position="relative"
        // mt="40px"
      >
        {!isVip && !userIsChannelOwner && !userIsModerator && isVipChat && (
          <Flex
            position="absolute"
            style={{ backdropFilter: "blur(6px)" }}
            left={"0"}
            right={"0"}
            top={"0"}
            bottom={"0"}
            zIndex={"1"}
          />
        )}
        <MessageList
          scrollRef={scrollRef}
          messages={chat.receivedMessages}
          channel={chat.channel}
          isAtBottomCallback={handleIsAtBottom}
          isVipChat={isVipChat}
        />
      </Flex>
      <Flex justifyContent="center">
        {!isAtBottom && chat.hasMessagesLoaded && (
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
        )}
      </Flex>
      {(userIsChannelOwner || userIsModerator || isVip || !isVipChat) && (
        <Flex w="100%" px="0.5rem" pb="0.5rem">
          <ChatForm
            sendChatMessage={sendChatMessage}
            additionalChatCommands={channelChatCommands}
            allowPopout
            channel={chat.channel}
            isVipChat={isVipChat}
          />
        </Flex>
      )}
    </Flex>
  );
};

export default Chat;
