import { Flex, Text, Image, Button, Textarea } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import usePostStreamInteraction from "../../hooks/server/usePostStreamInteraction";
import { StreamInteractionType } from "../../generated/graphql";
import { containsSwears } from "../../utils/validation/profanityFilter";
import { io, Socket } from "socket.io-client";

let socket: Socket | null;

export const BooEventTtsComponent = () => {
  const [isEnteringMessage, setIsEnteringMessage] = useState(false);
  const [text, setText] = useState("");

  const { postStreamInteraction } = usePostStreamInteraction({});

  useEffect(() => {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const handlePost = async () => {
    await postStreamInteraction({
      channelId: "3",
      streamInteractionType: StreamInteractionType.TtsInteraction,
      text,
    });
    socket?.emit("interaction", { text: "hello!!" });
    setIsEnteringMessage(false);
  };

  return (
    <Flex
      width="100%"
      height="100%"
      justifyContent={"center"}
      alignItems={"center"}
      onClick={() => {
        if (!isEnteringMessage) setIsEnteringMessage(true);
      }}
    >
      {!isEnteringMessage ? (
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          gap="16px"
          _hover={{
            cursor: "pointer",
            transform: "scale(1.1)",
            transition: "transform 0.2s",
          }}
          border={"1px solid #b8b8b8"}
          borderRadius={"10px"}
          padding="10px"
        >
          <Image
            src="/images/megaphone.png"
            alt="megaphone"
            width="20px"
            height="20px"
          />
          <Text textAlign={"center"} fontFamily="LoRes15" fontSize="20px">
            TTS BROADCAST MESSAGE
          </Text>
        </Flex>
      ) : (
        <Flex direction="column" gap="4px">
          <Textarea
            id="text"
            placeholder="Enter message to broadcast"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button
            bg="#2562db"
            color={"white"}
            _hover={{
              transform: "scale(1.1)",
            }}
            onClick={handlePost}
            isDisabled={
              text.length === 0 || text.length > 200 || containsSwears(text)
            }
          >
            Send
          </Button>
          <Text h="20px" color={"red"} fontSize="10px">
            {text.length > 200
              ? "message must be 200 characters or under"
              : containsSwears(text)
              ? "message contains strong swear words"
              : ""}
          </Text>
        </Flex>
      )}
    </Flex>
  );
};
