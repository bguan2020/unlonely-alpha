import { Button, Flex, Text, Image } from "@chakra-ui/react";

const HeroBanner = () => {
  const redirectToNewChannelPage = () => {
    window.open(`${window.location.origin}/onboard`, "_self");
  };

  return (
    <Flex
      mt="20px"
      gap="10px"
      h="35vh"
      direction={["column", "column", "row"]}
      alignItems={"center"}
      justifyContent={"space-evenly"}
      bg="rgba(0,0,0,0.5)"
      p="10px"
    >
      <Flex direction="column">
        <Text
          fontSize={["2rem", "3rem", "3rem", "4rem"]}
          fontWeight="600"
          fontFamily="Inter"
        >
          Make a Channel.
        </Text>
        <Text
          fontSize={["2rem", "3rem", "3rem", "4rem"]}
          fontWeight="600"
          fontFamily="Inter"
        >
          Start Streaming.
        </Text>
      </Flex>
      <Flex direction="column">
        <Flex justifyContent={"center"}>
          <Button
            border="2px solid white"
            borderRadius="20px"
            color="white"
            bg="rgba(70, 168, 0, 1)"
            onClick={redirectToNewChannelPage}
            _hover={{
              bg: "rgba(70, 168, 0, 0.8)",
            }}
            position={"relative"}
            _active={{}}
            _focus={{}}
            p={[6, 8, 10, 12]}
          >
            <Image
              src="/images/sparkles.png"
              position="absolute"
              zIndex="2"
              minWidth={["140%", "140%", "140%", "140%"]}
            />
            <Text
              fontSize={["1rem", "2rem", "2srem", "3rem"]}
              fontFamily="LoRes15"
            >
              create channel
            </Text>
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default HeroBanner;
