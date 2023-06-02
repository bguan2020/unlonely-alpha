import { Flex } from "@chakra-ui/react";
import { Channel } from "../../generated/graphql";
import ChannelCard from "./ChannelCard";

type Props = {
  channels: Channel[];
};

const ChannelList: React.FunctionComponent<Props> = ({ channels }) => {
  return (
    <Flex
      direction="row"
      overflowX="scroll"
      overflowY="clip"
      width="100%"
      gap={"1rem"}
    >
      {channels?.map(
        (h: Channel) => !!h && <ChannelCard key={h.id} channel={h} />
      )}
    </Flex>
  );
};

export default ChannelList;
