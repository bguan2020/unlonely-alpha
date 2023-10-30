import { Flex, Text } from "@chakra-ui/react";
import { useLayoutEffect, useRef, useState } from "react";

import { Channel } from "../../generated/graphql";
import LiveChannelCard from "./LiveChannelCard";

type Props = {
  channels: Channel[];
  callback: () => void;
};
const LiveChannelList: React.FunctionComponent<Props> = ({
  channels,
  callback,
}) => {
  const liveChannels = channels?.filter((channel: Channel) => channel.isLive);
  const listRef = useRef<HTMLDivElement>(null);
  const [isCentered, setIsCentered] = useState(true);
  useLayoutEffect(() => {
    const checkOverflow = () => {
      if (listRef.current) {
        setIsCentered(
          listRef.current.scrollWidth <= listRef.current.clientWidth
        );
      }
    };
    checkOverflow(); // Check on initial mount
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);
  return (
    <>
      {liveChannels && liveChannels.length > 0 && (
        <Flex
          direction="row"
          overflowX={isCentered ? "hidden" : "auto"}
          overflowY="clip"
          width="100%"
          height={{
            base: "20rem",
            sm: "26rem",
            md: "26rem",
            lg: "26rem",
          }}
          gap={"1rem"}
          p="10px"
          justifyContent={isCentered ? "center" : "flex-start"}
          ref={listRef}
        >
          {liveChannels.map((channel: Channel) => (
            <LiveChannelCard
              key={channel.id}
              channel={channel}
              callback={callback}
            />
          ))}
        </Flex>
      )}
      {liveChannels && liveChannels.length === 0 && (
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          width="100%"
          fontSize={"30px"}
          gap="15px"
          my="2rem"
        >
          <Text fontFamily={"LoRes15"}>no one is live right now</Text>
        </Flex>
      )}
    </>
  );
};
export default LiveChannelList;
