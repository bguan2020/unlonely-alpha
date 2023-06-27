import { Flex, Text } from "@chakra-ui/react";
import Link from "next/link";

const HeroBanner = () => {
  return (
    <Flex direction="column" mt="20px" gap="10px">
      <Text
        fontSize={["40px", "55px", "70px"]}
        fontFamily={"Neue Pixel Sans"}
        textAlign="center"
      >
        welcome to unlonely
      </Text>
      <Text
        fontSize={["20px", "24px"]}
        className="gradient-text"
        textAlign="center"
      >
        your cozy space on the internet
      </Text>
      <Link target="_blank" href={"https://lu.ma/unlonely"} passHref>
        <Text
          textAlign="center"
          fontSize={["12px", "15px"]}
          textDecoration="underline"
          fontStyle="italic"
        >
          <span style={{ fontWeight: "bold" }}>start</span> your own channel to{" "}
          <span style={{ fontWeight: "bold" }}>launch</span> your own arcade
          token
        </Text>
      </Link>
    </Flex>
  );
};

export default HeroBanner;
