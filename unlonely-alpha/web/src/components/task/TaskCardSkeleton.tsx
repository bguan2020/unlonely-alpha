import { Grid, GridItem, Flex } from "@chakra-ui/layout";
import { Skeleton } from "@chakra-ui/react";

import Card from "../general/Card";

const TaskCardSkeleton = () => {
  return (
    <>
      <Flex
        direction="column"
        bg="#F1F4F8"
        padding={{ base: "0", sm: "0.5rem" }}
        borderRadius="0.5rem"
        mb="0.5rem"
        minH={"8rem"}
        overflow="fit"
      >
        <Flex
          justifyContent="space-between"
          alignItems="center"
          padding="0.25 0.3125rem"
        >
          <Skeleton h="12px" />
          <GridItem
            colSpan={1}
            pl="10px"
            fontSize="16px"
            fontWeight="600"
          ></GridItem>
        </Flex>
        <Card>
          <Grid templateColumns="1fr 3fr" gap="0.3125rem">
            <GridItem colSpan={1} mr="10px" width="120px">
              <Skeleton height="68px" width="120px" />
            </GridItem>
            <Flex maxW="100%" flexDir="column">
              <Skeleton h="12px" />
              <Skeleton h="12px" />
            </Flex>
          </Grid>
        </Card>
      </Flex>
    </>
  );
};

export default TaskCardSkeleton;
