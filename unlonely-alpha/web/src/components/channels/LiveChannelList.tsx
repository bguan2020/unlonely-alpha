import { Flex } from "@chakra-ui/react";
import { Channel } from "../../generated/graphql";
import LiveChannelCard from "./LiveChannelCard";

type Props = {
  channels: Channel[];
};

const LiveChannelList: React.FunctionComponent<Props> = ({ channels }) => {
  const liveChannels = channels?.filter((channel: Channel) => channel.isLive);

  return (
    <>
      {liveChannels && liveChannels.length > 0 && (
        <>
          <Flex
            direction="row"
            overflowX="scroll"
            overflowY="clip"
            width="100%"
            height={{
              base: "20rem",
              sm: "26rem",
              md: "26rem",
              lg: "26rem",
            }}
            gap={"1rem"}
          >
            {channels?.map((channel: Channel) =>
              channel.isLive ? (
                <>
                  <LiveChannelCard key={channel.id} channel={channel} />
                  {/* <LiveChannelCard key={channel.id} channel={channel} />
                  <LiveChannelCard key={channel.id} channel={channel} />
                  <LiveChannelCard key={channel.id} channel={channel} /> */}
                </>
              ) : // <LiveChannelCard key={channel.id} channel={channel} />
              null
            )}
          </Flex>
        </>
      )}
    </>
  );
};

export default LiveChannelList;
