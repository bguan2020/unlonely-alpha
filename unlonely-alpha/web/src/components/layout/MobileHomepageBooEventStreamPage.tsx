import { useEffect, useMemo, useState } from "react";
import { eventStartTime } from "./BooEventWrapper";
import { MobileHomepageBooEventStream } from "./MobileHomepageBooEventStream";
import { getTimesFromMillis } from "../../utils/time";
import { Flex, Text, Image } from "@chakra-ui/react";
import NextImage from "next/image";
import { HomepageBooEventTrailer } from "./HomepageBooEventTrailer";

export const MobileHomePageBooEventStreamPage = () => {
  const [dateNow, setDateNow] = useState(Date.now());

  const timeLeftInMillis = useMemo(() => {
    const now = dateNow;
    const remaining = eventStartTime - now;
    return remaining > 0 ? remaining : 0;
  }, [dateNow]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDateNow(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {timeLeftInMillis > 0 ? (
        <Flex direction="column" height={"100%"} overflowY="hidden">
          <Flex p="5px">
            <NextImage
              src="/svg/unlonely-green.svg"
              priority
              alt="unlonely"
              width={80}
              height={80}
            />
          </Flex>
          <Flex display={"inline-block"} transform={"translateX(-2%)"}>
            <Text
              lineHeight={"1"}
              fontStyle={"italic"}
              fontFamily={"DigitalDisplay"}
              textAlign={"center"}
              fontSize={[
                "calc(1vw + 1vh + 70px)",
                "calc(2vw + 2vh + 140px)",
                "calc(3vw + 3vh + 210px)",
                "calc(4vw + 4vh + 280px)",
              ]}
            >
              {getTimesFromMillis(timeLeftInMillis, true)
                .days.toString()
                .padStart(2, "0")}{" "}
              DAYS
            </Text>
          </Flex>
          <Flex justifyContent={"center"} width="100%" px="10px">
            <Image src="/svg/fud-text.svg" width={"80%"} />
          </Flex>
          <Flex justifyContent={"center"} height="100%" bg="black">
            <HomepageBooEventTrailer />
          </Flex>
          <Flex
            direction="column"
            justifyContent={"space-around"}
            flex="1"
            p="20px"
            gap="30px"
          >
            <Flex justifyContent={"center"}>
              <Flex
                border="1px white solid"
                backgroundImage="url('/images/gradient.png')"
                backgroundSize="cover" // Stretches the image to fill the box
                backgroundPosition="100% 100%" // Keeps the image centered
                justifyContent={"center"}
                width={[
                  "calc(1vw + 1vh + 200px)",
                  "calc(2vw + 2vh + 250px)",
                  "calc(3vw + 3vh + 120px)",
                  "calc(4vw + 4vh + 160px)",
                ]}
                alignItems={"center"}
                onClick={() => {
                  window.open("https://lu.ma/coz1gn0t", "_blank");
                }}
              >
                <Text
                  fontFamily={"DigitalDisplay"}
                  fontSize={[
                    "calc(1vw + 1vh + 40px)",
                    "calc(2vw + 2vh + 40px)",
                    "calc(3vw + 3vh + 120px)",
                    "calc(4vw + 4vh + 160px)",
                  ]}
                  noOfLines={1}
                >
                  RSVP NOW
                </Text>
              </Flex>
            </Flex>
            <Flex justifyContent={"center"} width="100%" px="10px">
              <Image src="/svg/join-desktop-text.svg" width={"80%"} />
            </Flex>
          </Flex>
        </Flex>
      ) : (
        <MobileHomepageBooEventStream />
      )}
    </>
  );
};
