import {
  Flex,
  Button,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";

import { TaskCard_TaskFragment } from "../../generated/graphql";
import { ChatBot } from "../../pages/channels/brian";
import AddVideoModal from "./TaskVideoModal";
import TaskModals from "./TaskModals";
import { exampleTasks } from "./tasks";
import TaskCard from "./TaskCard";

type Props = {
  tasks: TaskCard_TaskFragment[];
  setChatBot: (chatBot: ChatBot[]) => void;
  chatBot: ChatBot[];
};

const TaskList: React.FunctionComponent<Props> = ({
  setChatBot,
  chatBot,
  tasks,
}) => {
  let cardId = 0;
  const {
    isOpen: songIsOpen,
    onOpen: songOnOpen,
    onClose: songOnClose,
  } = useDisclosure();

  const handleModalOpen = (taskType: string) => {
    // switch statement for all tasktypes
    switch (taskType) {
      case "song":
        songOnOpen();
        break;
      case "Watch a Video":
        break;
    }
  };

  return (
    <>
      <Flex direction="row" width="100%">
        <Flex direction="column" width="30%" mr="1.5rem">
          <Text fontSize="1.5rem" fontWeight="bold" m="auto">
            Pick a Task
          </Text>
          <Flex direction="row" justifyContent="left">
            <Text minW="4rem" m="auto">
              1 POAP
            </Text>
            <Button
              key={cardId}
              height={["60px"]}
              style={{
                whiteSpace: "normal",
                wordWrap: "break-word",
              }}
              mb="1rem"
              bgGradient={
                "linear-gradient(to bottom, #CD7F32 0%, #BE7023 100%);"
              }
              onClick={() => handleModalOpen("song")}
            >
              Play a Song
            </Button>
          </Flex>
          <Flex direction="row" justifyContent="left">
            <Text minW="4rem" m="auto">
              1 POAP
            </Text>
            <AddVideoModal chatBot={chatBot} setChatBot={setChatBot} />
          </Flex>
          {exampleTasks.map((t) => {
            cardId++;
            return (
              !!t && (
                <>
                  <Flex direction="row" justifyContent="left">
                    <Text minW="4rem" m="auto">
                      {t.reputation} POAPs
                    </Text>
                    <Button
                      key={cardId}
                      height={[
                        `${t.taskType.length > 30 ? "80px" : "60px"}`,
                        "60px",
                      ]}
                      isDisabled={
                        t.taskType === "Review a Product" ||
                        t.taskType === "Give Tofu a Treat" ||
                        t.taskType === "Make a Post From my FC or Twitter"
                          ? true
                          : false
                      }
                      style={{
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                      }}
                      mb="1rem"
                      bgGradient={`${t.color}`}
                      onClick={() => handleModalOpen(t.taskType)}
                    >
                      {t.taskType}
                    </Button>
                  </Flex>
                </>
              )
            );
          })}
          <TaskModals
            chatBot={chatBot}
            setChatBot={setChatBot}
            songIsOpen={songIsOpen}
            songOnClose={songOnClose}
          />
        </Flex>
        <Flex direction="column" width="70%">
          <Text fontSize="1.5rem" fontWeight="bold">
            To Do List:
          </Text>
          {tasks?.map((t) => {
            cardId++;
            return (
              !!t && (
                <>
                  <TaskCard task={t} />
                </>
              )
            );
          })}
        </Flex>
      </Flex>
    </>
  );
};

export default TaskList;
