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
      h="15vh"
      py="20px"
      px="5vw"
      backgroundImage="url('/svg/gradient.svg')"
      backgroundSize="cover" // Adjust as needed
      backgroundPosition="bottom" // Adjusted to show the bottom part of the image
    >
      <Text fontFamily={"DigitalDisplay"} fontSize="5vh" width="220px">
        "THE FUD" STARTS IN
      </Text>
      <Text
        fontFamily={"DigitalDisplay"}
        fontSize={"7vw"}
        color="white"
        fontStyle={"italic"}
        whiteSpace="nowrap" // Prevent text from wrapping
      >
        {getTimeFromMillis(timeLeftInMillis, true, true, true, true)}
      </Text>
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
          <Text fontFamily={"DigitalDisplay"} fontSize="4vh">
            NO FOMO?
          </Text>
          <Text fontFamily={"DigitalDisplay"} fontSize="4vh">
            RSVP NOW
          </Text>
        </Flex>
      </Button>
    </Flex>
  );
};
