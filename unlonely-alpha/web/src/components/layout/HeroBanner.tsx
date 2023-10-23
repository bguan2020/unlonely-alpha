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
      <Text textAlign="center" fontSize={["15px", "18px"]} fontStyle="italic">
        new here? check out our{" "}
        <span
          style={{
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          <Link href={"https://bit.ly/unlonelyFAQs"} target="_blank" passHref>
            FAQs
          </Link>
        </span>{" "}
        and{" "}
        <span
          style={{
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          <Tooltip label="DM @gracewhiteguan on telegram a screenshot of your OBS setup and links to your socials to get your own channel">
            start
          </Tooltip>
        </span>{" "}
        your own channel today
      </Text>
    </Flex>
  );
};

export default HeroBanner;
