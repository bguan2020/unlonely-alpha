import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  Flex,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Stack,
  Container,
} from "@chakra-ui/react";

import { useAccount } from "wagmi";
import AppLayout from "../../../components/layout/AppLayout";
import { getEnsName } from "../../../utils/ens";
import centerEllipses from "../../../utils/centerEllipses";
import AblyChatComponent from "../../../components/chat/AblyChataComponent";
import NextStreamTimer from "../../../components/stream/NextStreamTimer";
import { useUser } from "../../../hooks/useUser";
import TaskList from "../../../components/task/TaskList";
import BrianTokenTab from "../../../components/hostEvents/BrianTokenTab";
import { useWindowSize } from "../../../hooks/useWindowSize";

export type ChatBot = {
  username: string;
  address: string;
  taskType: string;
  title: string | null | undefined;
  description: string | null | undefined;
};

const brianPlaybackUrl =
  "https://0ef8576db087.us-west-2.playback.live-video.net/api/video/v1/us-west-2.500434899882.channel.8e2oKm7LXNGq.m3u8";

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

  const isHidden = useCallback(
    (isChat: boolean) => {
      //checks if width is <= 48 em (base size) if so checks switch tab is disabled
      return width <= 768 && (isChat ? hideChat : !hideChat);
    },
    [width, hideChat]
  );

  return (
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
            playbackUrl={brianPlaybackUrl}
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
          />
        </Container>
      </Stack>
      <Flex hidden={isHidden(false)} direction="column">
        <Text align="center" fontSize="2rem" fontWeight="bold">
          Welcome to Unlonely! Control My Stream with $BRIAN!
        </Text>
        <Tabs
          className="xeedev-class-hide"
          align="center"
          variant="unstyled"
          width="100%"
        >
          <TabList width="100%">
            <Tab _selected={{ color: "white", bg: "blue.500" }}>scene tab</Tab>
            <Tab _selected={{ color: "white", bg: "green.400" }}>task tab</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Flex
                margin="auto"
                maxW={{
                  base: "100%",
                  sm: "533px",
                  md: "711px",
                  lg: "889px",
                }}
                w="100%"
                borderRadius="0.3125rem"
                pt="1rem"
                justifyContent="center"
                backgroundColor="rgba(0,0,0,0.2)"
              >
                <Flex
                  width="100%"
                  justifyContent="center"
                  alignItems="center"
                  direction="column"
                >
                  <BrianTokenTab chatBot={chatBot} setChatBot={setChatBot} />
                </Flex>
              </Flex>
            </TabPanel>
            <TabPanel>
              <Flex
                margin="auto"
                maxW={{
                  base: "100%",
                  sm: "533px",
                  md: "711px",
                  lg: "889px",
                }}
                borderRadius="0.3125rem"
                pt="1rem"
                justifyContent="center"
                backgroundColor="rgba(0,0,0,0.2)"
              >
                <TaskList chatBot={chatBot} setChatBot={setChatBot} />
              </Flex>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </Stack>
  );
};

export default function Page() {
  return (
    <AppLayout isCustomHeader={false}>
      <Example />
    </AppLayout>
  );
}
