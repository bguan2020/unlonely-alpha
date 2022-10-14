import { Grid, GridItem, Flex } from "@chakra-ui/layout";
import { Skeleton, SkeletonCircle } from "@chakra-ui/react";

const HostEventCardSkeleton = () => {
  return (
    <>
      <Flex
        direction="column"
        alignItems="left"
        w={{ base: "100%", md: "60%", lg: "60%", sm: "100%" }}
      >
        <Skeleton />
      </Flex>
      <Flex
        direction="column"
        bg="#F1F4F8"
        w={{ base: "100%", md: "60%", lg: "60%", sm: "100%" }}
        h="9rem"
        padding="0.3rem"
        borderRadius="1rem"
        minH="5rem"
        mb="1.5rem"
        mt="8px"
        boxShadow="0px 0px 16px rgba(0, 0, 0, 0.25)"
      >
        <Grid
          templateColumns="1fr 1fr"
          gap="0.3125rem"
          width="100%"
          height="100%"
        >
          <GridItem colSpan={1} position="relative">
            <Flex
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <SkeletonCircle size="16px" />
            </Flex>
            <Grid
              templateColumns="1fr 2fr"
              gap="0.1rem"
              width="100%"
              height="100%"
              mt="0.6rem"
              ml="0.6rem"
            >
              <GridItem
                colSpan={1}
                ml="0.1rem"
                overflow="hidden"
                justifyItems="center"
              >
                <SkeletonCircle size="66px" />
                <Skeleton h="12px" />
              </GridItem>
              <GridItem
                colSpan={1}
                ml="0.1rem"
                overflow="hidden"
                justifyItems="center"
              >
                <Skeleton h="12px" />
                <Skeleton h="12px" />
              </GridItem>
            </Grid>
            <Flex position="absolute" right="4px" bottom="0px"></Flex>
          </GridItem>
          <GridItem colSpan={1} position="relative" mt="20px" mr="5px">
            <Flex
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <Flex />
              <Flex></Flex>
            </Flex>
            <Grid
              templateColumns="1fr 2fr"
              gap="0.1rem"
              width="100%"
              height="100%"
              mt="0.6rem"
              ml="0.6rem"
            >
              <GridItem
                colSpan={1}
                ml="0.1rem"
                overflow="hidden"
                justifyItems="center"
              >
                <SkeletonCircle size="66px" />
                <Skeleton h="12px" />
              </GridItem>
              <GridItem
                colSpan={1}
                ml="0.1rem"
                overflow="hidden"
                justifyItems="center"
              >
                <Skeleton h="12px" />
                <Skeleton h="12px" />
              </GridItem>
            </Grid>
          </GridItem>
        </Grid>
      </Flex>
    </>
  );
};

export default HostEventCardSkeleton;
