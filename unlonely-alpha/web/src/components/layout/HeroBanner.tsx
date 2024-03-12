import { Button, Flex, Text } from "@chakra-ui/react";

const HeroBanner = () => {
  const redirectToNewChannelPage = () => {
    window.open(`${window.location.origin}/onboard`, "_self");
  };

  return (
    <Flex
      mt="20px"
      gap="10px"
      h="30vh"
      direction={["column", "column", "row"]}
      alignItems={"center"}
      justifyContent={"space-evenly"}
      bg="rgba(0,0,0,0.5)"
      p="10px"
    >
      <Flex direction="column">
        <Text fontSize={["1rem", "3rem"]} fontWeight="bold">
          Make a Channel.
        </Text>
        <Text fontSize={["1rem", "3rem"]} fontWeight="bold">
          Start Streaming.
        </Text>
      </Flex>
      <Flex direction="column">
        <Button
          _hover={{
            transform: "scale(1.1)",
          }}
          _active={{}}
          _focus={{}}
          onClick={redirectToNewChannelPage}
          p={[4, 6, 8, 10]}
        >
          <Text fontSize={["1rem", "2rem"]} fontWeight="bold">
            Create Channel
          </Text>
        </Button>
      </Flex>
    </Flex>
  );
};

export default HeroBanner;
