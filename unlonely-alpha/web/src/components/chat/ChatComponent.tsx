import { Flex, Text, Container, Image, Tooltip } from "@chakra-ui/react";
import { useState } from "react";

import { ChatReturnType } from "../../hooks/chat/useChat";
import { useChannelContext } from "../../hooks/context/useChannel";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { OuterBorder, BorderType } from "../general/OuterBorder";
import Participants from "../presence/Participants";
import Chat from "./Chat";

const ChatComponent = ({ chat }: { chat: ChatReturnType }) => {
  const { isStandalone } = useUserAgent();
  const [selectedTab, setSelectedTab] = useState<"chat" | "vip">("chat");
  const { chat: chatContext } = useChannelContext();
  const { presenceChannel } = chatContext;

  return (
    <Flex
      height={!isStandalone ? { base: "60vh" } : "100%"}
      position={"relative"}
    >
      <OuterBorder type={BorderType.OCEAN} p={"0"}>
        <Container centerContent maxW="100%" h="100%" alignSelf="end" p="0">
          <Flex width="100%">
            <OuterBorder
              cursor={"pointer"}
              type={BorderType.OCEAN}
              zIndex={selectedTab === "chat" ? 4 : 2}
              onClick={() => setSelectedTab("chat")}
              noborder
              pb={selectedTab === "chat" ? "0px" : undefined}
            >
              <Flex
                bg={selectedTab === "chat" ? "#1b9d9d" : "rgba(19, 18, 37, 1)"}
                width="100%"
                justifyContent={"center"}
              >
                <Text fontFamily="LoRes15" fontSize="20px" fontWeight={"bold"}>
                  chat
                </Text>
              </Flex>
            </OuterBorder>
            <OuterBorder
              cursor={"pointer"}
              type={BorderType.OCEAN}
              zIndex={selectedTab === "vip" ? 4 : 2}
              onClick={() => setSelectedTab("vip")}
              noborder
              pb={selectedTab === "vip" ? "0px" : undefined}
            >
              <Flex
                bg={
                  selectedTab === "vip"
                    ? "#1b9d9d"
                    : "linear-gradient(163deg, rgba(255,255,255,1) 1%, rgba(255,227,143,1) 13%, rgba(255,213,86,1) 14%, rgba(246,190,45,1) 16%, rgba(249,163,32,1) 27%, rgba(231,143,0,1) 28%, #2e1405 30%, #603208 100%)"
                }
                width="100%"
                justifyContent={"center"}
                alignItems={"center"}
                gap="5px"
              >
                <Text fontFamily="LoRes15" fontSize="20px" fontWeight={"bold"}>
                  vip
                </Text>
                <Tooltip
                  label="buy a vip badge to get access to the VIP chat!"
                  shouldWrapChildren
                >
                  <Image src="/svg/info.svg" width="16px" height="16px" />
                </Tooltip>
              </Flex>
            </OuterBorder>
          </Flex>
          <OuterBorder
            type={BorderType.OCEAN}
            width={"100%"}
            zIndex={3}
            alignSelf="flex-end"
            noborder
            pt="0px"
          >
            <Flex bg="rgba(24, 22, 47, 1)" width={"100%"} direction="column">
              {presenceChannel && (
                <Flex justifyContent={"center"} py="0.5rem">
                  <Participants ablyPresenceChannel={presenceChannel} />
                </Flex>
              )}
              {selectedTab === "chat" && <Chat chat={chat} />}
              {selectedTab === "vip" && <Chat chat={chat} isVipChat />}
            </Flex>
          </OuterBorder>
        </Container>
      </OuterBorder>
    </Flex>
  );
};

export default ChatComponent;
