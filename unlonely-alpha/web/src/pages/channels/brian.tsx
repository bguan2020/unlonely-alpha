import { gql, useQuery } from "@apollo/client";
import React, { useState, useEffect } from "react";
import {
  Text,
  Flex,
  Grid,
  GridItem,
  Box,
  Button,
  Spacer,
  Image,
} from "@chakra-ui/react";
import { useAccount } from "wagmi";

import AppLayout from "../../components/layout/AppLayout";
import { getEnsName } from "../../utils/ens";
import centerEllipses from "../../utils/centerEllipses";
import { TaskCard_TaskFragment } from "../../generated/graphql";
import AblyChatComponent from "../../components/chat/AblyChataComponent";
import NextStreamTimer from "../../components/video/NextStreamTimer";
import { useUser } from "../../hooks/useUser";
import TaskList from "../../components/task/TaskList";

const TASK_LIST_QUERY = gql`
  query TaskFeed($data: TaskFeedInput!) {
    getTaskFeed(data: $data) {
      id
      taskType
      youtubeId
      title
      thumbnail
      description
      link
      completed
      owner {
        username
        address
      }
    }
  }
`;

type Props = {
  tasks: TaskCard_TaskFragment[];
  loading: boolean;
};

export type ChatBot = {
  username: string;
  address: string;
  taskType: string;
  title: string | null | undefined;
  description: string | null | undefined;
};

const Example: React.FunctionComponent<Props> = ({ tasks, loading }) => {
  const { user } = useUser();
  const [chatBot, setChatBot] = useState<ChatBot[]>([]);
  const [username, setUsername] = useState<string | null>();
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

  return (
    <>
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
          <NextStreamTimer />
        </GridItem>
        <Button onClick={toggleChatVideos} id="xeedev-poaav">
          Toggle Chat/Tasks
        </Button>
        <GridItem
          rowSpan={1}
          colSpan={1}
          mr="20px"
          id="xeedev-video-modal"
          className="xeedev-class-hide"
        >
          <Flex direction="row" justifyContent="left">
            <Flex maxH="400px" margin="auto" mb="16px" ml="32px">
              <Text fontSize="2rem" fontWeight="bold">
                Attend Streams. Collect POAPs. Demand Tasks.
              </Text>
            </Flex>
            <Spacer />
            {loading && (
              <Flex flexDirection="row">
                <Image
                  src="https://i.imgur.com/tS6RUJt.gif"
                  width="2rem"
                  height="2rem"
                  mr="0.5rem"
                />
                {"syncing tasks"}
              </Flex>
            )}
          </Flex>
          <Flex
            margin="auto"
            maxW={{ base: "100%", sm: "533px", md: "711px", lg: "889px" }}
            borderRadius="0.3125rem"
            padding="0.5rem 1rem"
            justifyContent="center"
            backgroundColor="rgba(0,0,0,0.2)"
            overflowX="auto"
            maxH="400px"
            height="400px"
          >
            <TaskList chatBot={chatBot} setChatBot={setChatBot} tasks={tasks} />
          </Flex>
        </GridItem>
      </Grid>
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
  const { data, loading, error } = useQuery(TASK_LIST_QUERY, {
    variables: {
      data: {
        searchString: null,
        skip: null,
        limit: null,
        orderBy: null,
      },
    },
    notifyOnNetworkStatusChange: true,
    pollInterval: 30000,
  });
  const tasks = data?.getTaskFeed;

  return (
    <AppLayout error={error}>
      <Example tasks={tasks} loading={loading} />
    </AppLayout>
  );
}

// export async function getStaticProps() {
//   const API_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

//   return { props: {} };
// }
