import { Flex } from "@chakra-ui/layout";
import { Skeleton, SkeletonCircle } from "@chakra-ui/react";

const NfcCardSkeleton = () => {
  return (
    <>
      <Flex
        direction="column"
        w={{ base: "100%", md: "60%", lg: "60%", sm: "100%" }}
        h="15rem"
        padding="0.3rem"
        borderRadius="1rem"
        minH="8rem"
        minW="25rem"
        mb="1.5rem"
        mt="8px"
        mr="1rem"
      >
        <Skeleton width="25rem" height="20rem" />
        <Flex direction="row" justifyContent="flex-end">
          <SkeletonCircle size="10" />
        </Flex>
      </Flex>
      <Flex
        direction="column"
        alignItems="left"
        w={{ base: "100%", md: "60%", lg: "60%", sm: "100%" }}
      >
        <Skeleton />
      </Flex>
    </>
  );
};

export default NfcCardSkeleton;
