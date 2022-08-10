import { useState, useEffect } from "react";
import { Text, Flex, Link } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import moment from "moment-timezone";

const NextStreamTimer: React.FunctionComponent = () => {
  const [streamingTime, setStreamingTime] = useState<boolean>(false);
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);

  const updateTime = () => {
    const now = new Date();
    // next stream time set to july 25, 2022 at 7pm PST, timezone specificed in moment-timezone
    const nextStreamTime = moment.tz(
      "2022-08-11T19:00:00",
      "America/Los_Angeles"
    );
    const diff = nextStreamTime.diff(now, "seconds");
    const days = Math.floor(diff / (60 * 60 * 24));
    const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((diff % (60 * 60)) / 60);
    const seconds = Math.floor(diff % 60);
    setDays(days);
    setHours(hours);
    setMinutes(minutes);
    setSeconds(seconds);

    if (days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0) {
      setStreamingTime(true);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      updateTime();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {streamingTime ? (
        <Flex
          flexDirection="row"
          justifyContent="center"
          width="100%"
          height={{ base: "80%", sm: "300px", md: "400px", lg: "500px" }}
          mt="10px"
        >
          <iframe
            src="https://player.castr.com/live_a998cbe00c7a11eda40d672859e3570c"
            width="100%"
            style={{ aspectRatio: "16/9", width: "100%", maxWidth: "889px" }}
            frameBorder="0"
            scrolling="no"
            allow="autoplay"
            allowFullScreen
          />
        </Flex>
      ) : (
        <Flex
          flexDirection="row"
          justifyContent="center"
          width="100%"
          height={{ base: "80%", sm: "300px", md: "400px", lg: "500px" }}
          mt="10px"
        >
          <Flex
            direction="column"
            width="100%"
            maxW="889px"
            pt="100px"
            pl="10px"
            color="white"
            fontWeight="bold"
            fontSize="40px"
            bg="black"
          >
            <Text fontFamily="Anonymous Pro, monospace">Next stream in:</Text>
            <Flex direction="row">
              <Flex direction="row" mr="5px">
                <Text mr="5px" fontSize="62px" color="#76D201">
                  {days}
                </Text>
                <Text>days</Text>
              </Flex>
              <Flex direction="row" mr="5px">
                <Text mr="5px" fontSize="62px" color="#FF3EA5">
                  {hours}
                </Text>
                <Text>hours</Text>
              </Flex>
              <Flex direction="row" mr="5px">
                <Text mr="5px" fontSize="62px" color="#BB29BB">
                  {minutes}
                </Text>
                <Text>minutes</Text>
              </Flex>
              <Flex direction="row" mr="5px">
                <Text mr="5px" fontSize="62px" color="#FF6D6A">
                  {seconds}
                </Text>
                <Text>seconds</Text>
              </Flex>
            </Flex>
            <Text lineHeight={5} mb="10px" fontSize="14px">
              Wanna get notified before the stream goes live?
              <Link href="https://tally.so/r/3ja0ba" isExternal>
                {" "}
                Join our community here!
                <ExternalLinkIcon mx="2px" />
              </Link>
            </Text>
          </Flex>
        </Flex>
      )}
    </>
  );
};

export default NextStreamTimer;
