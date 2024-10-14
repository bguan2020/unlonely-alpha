import React from "react";
import { Button, Flex, Text } from "@chakra-ui/react";
import { getTimeFromMillis } from "../../utils/time";

export const HomePageBooEventTokenCountdown = ({
  timeLeftInMillis,
}: {
  timeLeftInMillis: number;
}) => {
  return (
    <Flex
      alignItems="center"
      justifyContent={"space-between"}
      h={["85px", "115px", "115px", "115px"]}
      py="10px"
      px="5vw"
      backgroundImage="url('/svg/gradient.svg')"
      backgroundSize="cover" // Adjust as needed
      backgroundPosition="bottom" // Adjusted to show the bottom part of the image
      gap="4px"
    >
      <Flex direction="column" width="unset !important">
        <Text
          fontFamily={"DigitalDisplay"}
          fontSize={["15px", "20px", "30px", "40px"]}
          noOfLines={1}
          lineHeight="1.1"
        >
          THE "FUD"
        </Text>
        <Text
          fontFamily={"DigitalDisplay"}
          fontSize={["15px", "20px", "30px", "40px"]}
          noOfLines={1}
          lineHeight="1.1"
        >
          STARTS IN
        </Text>
      </Flex>
      <Flex display={"inline-block"} transform={"translateX(-2%)"}>
        <Text
          fontFamily={"DigitalDisplay"}
          fontSize={["35px", "50px", "70px", "100px"]}
          color="white"
          fontStyle={"italic"}
          whiteSpace="nowrap" // Prevent text from wrapping
        >
          {getTimeFromMillis(timeLeftInMillis, true, true, true, true)}
        </Text>
      </Flex>
      <Button
        h="100%"
        borderRadius="0px"
        border="1px white solid"
        bg="#131323"
        _hover={{ bg: "#2d2d6b" }}
        color="white"
        onClick={() => {
          window.open("https://lu.ma/coz1gn0t", "_blank");
        }}
      >
        <Flex direction="column">
          <Text
            fontFamily={"DigitalDisplay"}
            fontSize={["20px", "20px", "30px", "40px"]}
          >
            NO FOMO?
          </Text>
          <Text
            fontFamily={"DigitalDisplay"}
            fontSize={["20px", "20px", "30px", "40px"]}
          >
            RSVP NOW
          </Text>
        </Flex>
      </Button>
    </Flex>
  );
};
