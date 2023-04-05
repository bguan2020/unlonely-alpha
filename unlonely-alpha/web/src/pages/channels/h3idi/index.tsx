import React, { useState, useEffect, useCallback } from "react";
import { Text, Flex, Button, Container, Stack } from "@chakra-ui/react";

import { useAccount } from "wagmi";
import AppLayout from "../../../components/layout/AppLayout";
import { getEnsName } from "../../../utils/ens";
import centerEllipses from "../../../utils/centerEllipses";
import AblyChatComponent from "../../../components/chat/AblyChataComponent";
import NextStreamTimer from "../../../components/stream/NextStreamTimer";
import { useUser } from "../../../hooks/useUser";
import { useWindowSize } from "../../../hooks/useWindowSize";

export type ChatBot = {
  username: string;
  address: string;
  taskType: string;
  title: string | null | undefined;
  description: string | null | undefined;
};

const seamPlaybackUrl =
  "https://0ef8576db087.us-west-2.playback.live-video.net/api/video/v1/us-west-2.500434899882.channel.6w42ZibGJCGN.m3u8";

const channelArn = "arn:aws:ivs:us-west-2:500434899882:channel/6w42ZibGJCGN";
const ablyChatChannel = "h3idi-channel";
const ablyPresenceChannel = "h3idi-presence-channel";

const Example: React.FunctionComponent = () => {
  const [width, height] = useWindowSize();
  const { user } = useUser();
  const [chatBot, setChatBot] = useState<ChatBot[]>([]);
  const [username, setUsername] = useState<string | null>();
  const accountData = useAccount();
  //used on mobile view
  const [hideChat, setHideChat] = useState<boolean>(false);
  const toggleChatVideos = function () {
    setHideChat(!hideChat);
  };

  const isHidden = useCallback(
    (isChat: boolean) => {
      //checks if width is <= 48 em (base size) if so checks switch tab is disabled
      return width <= 768 && (isChat ? hideChat : !hideChat);
    },
    [width, hideChat]
  );

  useEffect(() => {
    const fetchEns = async () => {
      if (accountData?.address) {
        const ens = await getEnsName(accountData.address);
        const username = ens ? ens : centerEllipses(accountData.address, 9);
        setUsername(username);
      }
    };

    fetchEns();
  }, [accountData?.address]);

  return (
    <>
      <Stack direction="column">
        <Stack
          mx={[8, 4]}
          alignItems={["center", "initial"]}
          mt="10px"
          spacing={8}
          direction={["column", "row", "row"]}
        >
          <Flex width={{ base: "100%", sm: "70%", md: "70%", lg: "100%" }}>
            <NextStreamTimer
              isTheatreMode={true}
              hasTimer={false}
              playbackUrl={seamPlaybackUrl}
            />
          </Flex>
          <Button
            height={{
              //only show on mobile
              base: "100%", // 0-48em
              md: "0%", // 48em-80em,
              xl: "0%", // 80em+
            }}
            onClick={toggleChatVideos}
            id="xeedev-poaav"
          >
            Toggle Chat/Host Schedule
          </Button>
          <Container
            hidden={isHidden(true)}
            maxW={["768px", "300px"]}
            mr="10px"
            borderWidth="3px"
            borderColor="black"
            centerContent
          >
            <Text
              mt="10px"
              align="center"
              fontWeight={"bold"}
              fontSize="20px"
              color="white"
            >
              The Chat Room!
            </Text>
            <AblyChatComponent
              username={username}
              chatBot={chatBot}
              user={user}
              ablyChatChannel={ablyChatChannel}
              ablyPresenceChannel={ablyPresenceChannel}
              channelArn={channelArn}
            />
          </Container>
        </Stack>
        <Flex direction="column">
          <Flex
            maxH="400px"
            margin="auto"
            mb="16px"
            ml="32px"
            w="100%"
            justifyContent="space-between"
            pr="32px"
          >
            <Text fontSize="2rem" fontWeight="bold">
              The H3idi Channel
            </Text>
          </Flex>
          <Flex direction="row" width="100%" margin="auto" ml="32px">
            add any description here...
          </Flex>
        </Flex>
      </Stack>
    </>
  );
};

const toggleChatVideos = function () {
  document
    .getElementById("xeedev-video-modal")
    ?.classList.toggle("xeedev-class-block");
  document
    .getElementById("xeedev-chat-div")
    ?.classList.toggle("xeedev-class-hide");

  const poaav = document.getElementById("xeedev-poaav");
  if (poaav?.innerHTML === "Vote/Add Upcoming Videos") {
    poaav.innerHTML = "Return to Chat";
  } else if (poaav?.innerHTML === "Return to Chat") {
    poaav.innerHTML = "Vote/Add Upcoming Videos";
  }
};

export default function Page() {
  return (
    <AppLayout isCustomHeader={false}>
      <Example />
    </AppLayout>
  );
}
