import { gql, useQuery } from "@apollo/client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Text,
  Flex,
  Grid,
  GridItem,
  Box,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";

import { useAccount } from "wagmi";
import AppLayout from "../../../components/layout/AppLayout";
import { getEnsName } from "../../../utils/ens";
import centerEllipses from "../../../utils/centerEllipses";
import AblyChatComponent from "../../../components/chat/AblyChataComponent";
import NextStreamTimer from "../../../components/video/NextStreamTimer";
import { useUser } from "../../../hooks/useUser";
import TaskList from "../../../components/task/TaskList";
import { TheatreModeIcon } from "../../../components/icons/TheatreModeIcon";
import NebulousButton from "../../../components/general/button/NebulousButton";
import BrianTokenTab from "../../../components/hostEvents/BrianTokenTab";

export type ChatBot = {
  username: string;
  address: string;
  taskType: string;
  title: string | null | undefined;
  description: string | null | undefined;
};

const Example: React.FunctionComponent = () => {
  const { user } = useUser();
  const [chatBot, setChatBot] = useState<ChatBot[]>([]);
  const [username, setUsername] = useState<string | null>();
  const router = useRouter();
  const [isTheatreMode, setIsTheatreMode] = useState<boolean>(
    router.query.theatreMode === "true"
  );
  const accountData = useAccount();
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

  const toggleTheatreMode = () => {
    if (isTheatreMode) {
      // route to /channels/brian
      window.location.href = "/channels/brian";
      return;
    }
    window.location.href = "/channels/brian?theatreMode=true";
  };

  return (
    <>
      {isTheatreMode ? (
        <Grid
          gridTemplateColumns={"80% 20%"}
          minH="calc(100vh - 48px)"
          mb="20px"
        >
          <GridItem rowSpan={2} colSpan={1}>
            <NextStreamTimer isTheatreMode={true} />
          </GridItem>
          <GridItem
            rowSpan={3}
            colSpan={1}
            border="2px"
            mt="10px"
            mb="190px"
            maxH="700px"
            id="xeedev-chat-div"
          >
            <Flex
              justifyContent="center"
              direction="column"
              bg="black"
              pb="10px"
              pt="10px"
            >
              <Box bg="black" margin="auto">
                <Text fontWeight={"bold"} fontSize="20px" color="white">
                  The Chat Room!
                </Text>
              </Box>
            </Flex>
            <AblyChatComponent
              username={username}
              chatBot={chatBot}
              user={user}
            />
          </GridItem>
          <Button onClick={toggleChatVideos} id="xeedev-poaav">
            Toggle Chat/Host Schedule
          </Button>
          <GridItem
            rowSpan={1}
            colSpan={1}
            mr="20px"
            id="xeedev-video-modal"
            className="xeedev-class-hide"
          >
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
                  Vote for the next host!
                </Text>
                <NebulousButton
                  opacity="0.5"
                  aria-label="toggleTheatreMode"
                  onClick={toggleTheatreMode}
                >
                  <TheatreModeIcon boxSize={8} />
                </NebulousButton>
              </Flex>
              <Flex direction="row" width="100%" margin="auto">
                <Tabs variant="unstyled" width="100%">
                  <TabList width="100%" ml="10%" mr="10%">
                    <Tab _selected={{ color: "white", bg: "blue.500" }}>
                      Hosts
                    </Tab>
                    <Tab _selected={{ color: "white", bg: "green.400" }}>
                      Tasks
                    </Tab>
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
                          <BrianTokenTab />
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
            </Flex>
          </GridItem>
        </Grid>
      ) : (
        <Grid
          gridTemplateColumns={"10% 60% 20% 10%"}
          minH="calc(100vh - 48px)"
          mb="20px"
        >
          <GridItem rowSpan={1} colSpan={2}></GridItem>
          <GridItem
            rowSpan={3}
            colSpan={1}
            border="2px"
            mt="10px"
            mb="190px"
            maxH="700px"
            id="xeedev-chat-div"
          >
            <Flex
              justifyContent="center"
              direction="column"
              bg="black"
              pb="10px"
              pt="10px"
            >
              <Box bg="black" margin="auto">
                <Text fontWeight={"bold"} fontSize="20px" color="white">
                  The Chat Room!
                </Text>
              </Box>
            </Flex>
            <AblyChatComponent
              username={username}
              chatBot={chatBot}
              user={user}
            />
          </GridItem>
          <GridItem rowSpan={3} colSpan={1}></GridItem>
          <GridItem rowSpan={2} colSpan={1}></GridItem>
          <GridItem rowSpan={1} colSpan={1} mb="20px" mr="20px">
            <NextStreamTimer isTheatreMode={isTheatreMode} />
          </GridItem>
          <Button onClick={toggleChatVideos} id="xeedev-poaav">
            Toggle Chat/Host Schedule
          </Button>
          <GridItem
            rowSpan={1}
            colSpan={1}
            mr="20px"
            id="xeedev-video-modal"
            className="xeedev-class-hide"
          >
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
                  Control My Stream Via $BRIAN!
                </Text>
                <NebulousButton
                  opacity="0.5"
                  aria-label="toggleTheatreMode"
                  onClick={toggleTheatreMode}
                >
                  <TheatreModeIcon boxSize={8} />
                </NebulousButton>
              </Flex>
              <Flex direction="row" width="100%" margin="auto">
                <Tabs variant="unstyled" width="100%">
                  <TabList width="100%" ml="10%" mr="10%">
                    <Tab _selected={{ color: "white", bg: "blue.500" }}>
                      Scene Select
                    </Tab>
                    <Tab _selected={{ color: "white", bg: "green.400" }}>
                      Tasks
                    </Tab>
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
                        <BrianTokenTab />
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
            </Flex>
          </GridItem>
        </Grid>
      )}
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
