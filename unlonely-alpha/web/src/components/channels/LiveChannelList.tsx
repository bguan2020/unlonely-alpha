import { Flex } from "@chakra-ui/react";
import { useLayoutEffect, useRef, useState } from "react";
import { Channel } from "../../generated/graphql";
import LiveChannelCard from "./LiveChannelCard";

type Props = {
  channels: Channel[];
};

const LiveChannelList: React.FunctionComponent<Props> = ({ channels }) => {
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
          {channels?.map((channel: Channel) =>
            channel.isLive ? (
              <LiveChannelCard key={channel.id} channel={channel} />
            ) : null
          )}
        </Flex>
      )}
    </>
  );
};

export default LiveChannelList;
