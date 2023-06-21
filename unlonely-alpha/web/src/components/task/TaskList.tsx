import { gql, useQuery } from "@apollo/client";
import { Flex, Text } from "@chakra-ui/react";
import React from "react";

import AddVideoModal from "./TaskVideoModal";
import TaskCard from "./TaskCard";
import { TaskCard_TaskFragment } from "../../generated/graphql";
import TaskCardSkeleton from "./TaskCardSkeleton";
import { ChatBot } from "../../constants/types";

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
  setChatBot: (chatBot: ChatBot[]) => void;
  chatBot: ChatBot[];
};

const TaskList: React.FunctionComponent<Props> = ({ setChatBot, chatBot }) => {
  let cardId = 0;
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
  });

  const tasks = data?.getTaskFeed;

  return (
    <>
      <Flex direction="row" width="100%">
        <Flex direction="column" width="30%" mr="1.5rem">
          <Flex direction="row" justifyContent="left">
            <Text minW="4rem" m="auto">
              1 POAP required
            </Text>
            <AddVideoModal chatBot={chatBot} setChatBot={setChatBot} />
          </Flex>
        </Flex>
        <Flex direction="column" width="70%">
          <Text fontSize="1.5rem" fontWeight="bold">
            To Do List:
          </Text>
          {loading || !tasks ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <TaskCardSkeleton />
              ))}
            </>
          ) : (
            <>
              {tasks?.map((t: TaskCard_TaskFragment) => {
                cardId++;
                return (
                  !!t && (
                    <>
                      <TaskCard task={t} />
                    </>
                  )
                );
              })}
            </>
          )}
        </Flex>
      </Flex>
    </>
  );
};

export default TaskList;
