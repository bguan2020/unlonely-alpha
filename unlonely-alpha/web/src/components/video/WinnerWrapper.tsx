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
              mr="5px"
            >
              <Box width="100%" px={["12px", "0px"]}>
                {children}
              </Box>
            </Flex>
            <Text color="#FFC700" fontWeight={"bold"} fontSize="25px">
              🥇🥇🥇
            </Text>
          </Flex>
        </>
      )}
      {isSecond && (
        <>
          <Flex direction="column">
            <Text color="#717BA7" fontWeight={"bold"} fontSize="25px">
              Playing Next
            </Text>
            <Flex
              border="3px solid"
              borderColor="#717BA7"
              flexDirection="column"
              alignItems="flex-end"
              borderRadius="8px"
              mr="5px"
            >
              <Box width="100%" px={["12px", "0px"]}>
                {children}
              </Box>
            </Flex>
            <Text color="#FFC700" fontWeight={"bold"} fontSize="25px">
              🥈🥈🥈
            </Text>
          </Flex>
        </>
      )}
    </>
  );
};

export default WinnerWrapper;
