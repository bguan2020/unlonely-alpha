import { Flex, Text, Tooltip } from "@chakra-ui/react";
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
      <Link href={"https://lu.ma/unlonely"} passHref target="_blank">
        <Text textAlign="center" fontSize="20px" textDecoration="underline">
          see our upcoming stream schedule
        </Text>
      </Link>
      <Text textAlign="center" fontSize={["15px", "18px"]} fontStyle="italic">
        <span
          style={{
            fontWeight: "bold",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          <Tooltip
            label="dm @gracewhiteguan or @brianguan on telegram a picture of your OBS setup to get your own channel"
            fontWeight={"bold"}
          >
            start
          </Tooltip>
        </span>{" "}
        your own channel and{" "}
        <span
          style={{
            fontWeight: "bold",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          <Tooltip label="stream for 10 hours to get your own arcade token">
            launch
          </Tooltip>
        </span>{" "}
        your own arcade token
      </Text>
    </Flex>
  );
};

export default HeroBanner;
