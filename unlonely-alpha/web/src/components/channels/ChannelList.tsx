import { Channel } from "../../generated/graphql";
import ChannelCard from "./ChannelCard";

type Props = {
  channels: Channel[];
};

const ChannelList: React.FunctionComponent<Props> = ({ channels }) => {
  return <>{channels?.map((h: Channel) => !!h && <ChannelCard key={h.id} channel={h} />)}</>;
};

export default ChannelList;
