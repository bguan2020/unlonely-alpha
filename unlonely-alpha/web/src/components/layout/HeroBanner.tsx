import { Flex, Text } from "@chakra-ui/react";

const HeroBanner = () => {
  return (
    <Flex direction="column">
      <Text
        fontSize={["40px", "60px", "75px"]}
        fontFamily={"Neue Pixel Sans"}
        textAlign="center"
      >
        Welcome to unlonely
      </Text>
      <Text
        fontSize={["20px", "24px"]}
        className="gradient-text"
        textAlign="center"
      >
        Something something something
      </Text>
    </Flex>
  );
};

export default HeroBanner;
