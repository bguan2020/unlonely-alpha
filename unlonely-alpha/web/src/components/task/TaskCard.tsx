import { Text, Grid, GridItem, Flex } from "@chakra-ui/layout";
import { Image, Tooltip, useToast, Tag } from "@chakra-ui/react";
import { gql } from "@apollo/client";

import Card from "../general/Card";
import { TaskCard_TaskFragment } from "../../generated/graphql";
import centerEllipses from "../../utils/centerEllipses";

type Props = {
  task: TaskCard_TaskFragment;
};

const TaskCard = ({ task }: Props) => {
  const toast = useToast();

  return (
    <>
      <Flex
        direction="column"
        bg="#F1F4F8"
        padding={{ base: "0", sm: "0.5rem" }}
        borderRadius="0.5rem"
        mb="0.5rem"
        minH={task.taskType === "video" ? "8rem" : "6rem"}
        overflow="fit"
      >
        <Flex
          justifyContent="space-between"
          alignItems="center"
          padding="0.25 0.3125rem"
        >
          <Text color="#787878" fontSize="14px" fontWeight={"bold"} ml="5px">
            {task.owner.username === null
              ? centerEllipses(task.owner.address, 7)
              : task.owner.username}{" "}
            assigned a task
          </Text>
          <GridItem colSpan={1} pl="10px" fontSize="16px" fontWeight="600">
            {task.taskType === "video" ? (
              <Tag borderRadius="full" bg="#9FA4C4" m="5px">
                video
              </Tag>
            ) : (
              <Tag borderRadius="full" bg="#CD7F32" m="5px">
                song
              </Tag>
            )}
            {task.completed ? (
              <Tag borderRadius="full" colorScheme="green" m="5px">
                complete
              </Tag>
            ) : (
              <Tag borderRadius="full" colorScheme="red" m="5px">
                uncomplete
              </Tag>
            )}
          </GridItem>
        </Flex>
        {task.taskType === "video" ? (
          <Card>
            <Grid templateColumns="1fr 3fr" gap="0.3125rem">
              <GridItem colSpan={1} mr="10px" width="120px">
                {task.thumbnail && (
                  <Image
                    src={task.thumbnail}
                    height="68px"
                    width="120px"
                    objectFit="cover"
                  />
                )}
              </GridItem>
              <Flex maxW="100%" flexDir="column">
                <Tooltip label="copy video link">
                  <Text
                    textColor="#2C3A50"
                    fontWeight="bold"
                    fontSize="m"
                    lineHeight="18px"
                    noOfLines={2}
                    fontFamily="Roboto, sans-serif"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `https://www.youtube.com/watch?v=${task.youtubeId}`
                      );
                      toast({
                        title: "Copied!",
                        description: "Video link copied to clipboard",
                        status: "success",
                        duration: 4000,
                        isClosable: true,
                      });
                    }}
                  >
                    {task.title}
                  </Text>
                </Tooltip>

                <Text
                  mt="5px"
                  noOfLines={4}
                  textColor="#2C3A50"
                  fontWeight="normal"
                  fontSize="14px"
                  lineHeight="1.2"
                  fontFamily="Roboto, sans-serif"
                >
                  reason: "{task.description}"
                </Text>
              </Flex>
            </Grid>
          </Card>
        ) : (
          <Card>
            <Grid templateColumns="3fr 1fr" gap="0.3125rem">
              <GridItem colSpan={3} mr="10px">
                <Flex maxW="100%" flexDir="column">
                  <Text
                    textColor="#2C3A50"
                    fontWeight="bold"
                    fontSize="m"
                    lineHeight="18px"
                    noOfLines={2}
                    fontFamily="Roboto, sans-serif"
                  >
                    song request: {task.title}
                  </Text>

                  <Text
                    mt="5px"
                    noOfLines={4}
                    textColor="#2C3A50"
                    fontWeight="normal"
                    fontSize="14px"
                    lineHeight="1.2"
                    fontFamily="Roboto, sans-serif"
                  >
                    reason: "{task.description}"
                  </Text>
                </Flex>
              </GridItem>
            </Grid>
          </Card>
        )}
      </Flex>
    </>
  );
};

TaskCard.fragments = {
  task: gql`
    fragment TaskCard_task on Task {
      id
      taskType
      youtubeId
      title
      thumbnail
      description
      completed
      createdAt
      owner {
        username
        address
      }
    }
  `,
};

export default TaskCard;
