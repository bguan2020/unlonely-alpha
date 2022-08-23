import { Box, Flex, Text } from "@chakra-ui/react";

type Props = {
  order: number;
  children: React.ReactNode;
};

const WinnerWrapper = ({ order, children }: Props) => {
  const isFirst = order === 1;
  const isSecond = order === 2;

  return (
    <>
      {isFirst && (
        <>
          <Flex direction="column">
            <Text color="#FFC700" fontWeight={"bold"} fontSize="25px">
              Playing Now
            </Text>
            <Flex
              border="3px solid"
              borderColor="#FFC700"
              flexDirection="column"
              alignItems="flex-end"
              borderRadius="8px"
              overflow="hidden"
              position="relative"
              mr="5px"
              alignSelf="stretch"
            >
              <Box width="100%" px={["12px", "0px"]}>
                {children}
              </Box>
              <Text
                color="#FFC700"
                fontWeight={"bold"}
                fontSize="22px"
                position="absolute"
                bottom="0"
                right="4px"
              >
                🥇
              </Text>
            </Flex>
          </Flex>
        </>
      )}
      {isSecond && (
        <>
          <Flex direction="column">
            <Text color="#56608A" fontWeight={"bold"} fontSize="25px">
              Playing Next
            </Text>
            <Flex
              border="3px solid"
              borderColor="#56608A"
              flexDirection="column"
              alignItems="flex-end"
              borderRadius="8px"
              overflow="hidden"
              position="relative"
              mr="5px"
              alignSelf="stretch"
            >
              <Box width="100%" px={["12px", "0px"]}>
                {children}
              </Box>
              <Text
                color="#FFC700"
                fontWeight={"bold"}
                fontSize="22px"
                position="absolute"
                bottom="0"
                right="4px"
              >
                🥈
              </Text>
            </Flex>
          </Flex>
        </>
      )}
    </>
  );
};

export default WinnerWrapper;
