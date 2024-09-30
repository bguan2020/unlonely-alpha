import { Flex, Text, Image, Button, Textarea, Tooltip } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import usePostStreamInteraction from "../../hooks/server/usePostStreamInteraction";
// import { StreamInteractionType } from "../../generated/graphql";
import { containsSwears } from "../../utils/validation/profanityFilter";
import { io, Socket } from "socket.io-client";
import { AblyChannelPromise, SEND_TTS_EVENT } from "../../constants";
import { StreamInteractionType } from "../../generated/graphql";
import { isValidAddress } from "../../utils/validation/wallet";
import { useUser } from "../../hooks/context/useUser";

export const WS_URL = "wss://sea-lion-app-j3rts.ondigitalocean.app/";

let socket: Socket | null;

export const BooEventTtsComponent = ({
  interactionsAblyChannel,
}: {
  interactionsAblyChannel: AblyChannelPromise;
}) => {
  const { activeWallet } = useUser();

  const [isEnteringMessage, setIsEnteringMessage] = useState(false);
  const [text, setText] = useState("");

  const { postStreamInteraction } = usePostStreamInteraction({});

  useEffect(() => {
    socket = io(WS_URL, {
      transports: ["websocket"],
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const handlePost = async () => {
    const res = await postStreamInteraction({
      channelId: "3",
      streamInteractionType: StreamInteractionType.TtsInteraction,
      text,
    });
    socket?.emit("interaction", { text });
    interactionsAblyChannel?.publish({
      name: SEND_TTS_EVENT,
      data: {
        body: JSON.stringify({
          id: res?.res?.id ?? "0",
          text,
        }),
      },
    });
    setIsEnteringMessage(false);
  };

  return (
    <Flex
      width="100%"
      height="100%"
      justifyContent={"center"}
      alignItems={"center"}
      onClick={() => {
        if (
          !isEnteringMessage &&
          isValidAddress(activeWallet?.address) === "solana"
        )
          setIsEnteringMessage(true);
      }}
    >
      {!isEnteringMessage ? (
        <Tooltip
          label="log in with solana wallet first"
          isDisabled={isValidAddress(activeWallet?.address) === "solana"}
        >
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
        </Tooltip>
      ) : (
        <Flex direction="column" gap="4px">
          <Textarea
            id="text"
            placeholder="Enter message to broadcast"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Tooltip
            label="log in with solana wallet first"
            isDisabled={isValidAddress(activeWallet?.address) === "solana"}
          >
            <Button
              bg="#2562db"
              color={"white"}
              _hover={{
                transform: "scale(1.1)",
              }}
              onClick={handlePost}
              isDisabled={
                text.length === 0 ||
                text.length > 200 ||
                containsSwears(text) ||
                isValidAddress(activeWallet?.address) !== "solana"
              }
            >
              Send
            </Button>
          </Tooltip>
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
