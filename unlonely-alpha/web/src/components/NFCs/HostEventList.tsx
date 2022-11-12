import { Flex, Text } from "@chakra-ui/react";
import { HostEventCard_HostEventFragment } from "../../generated/graphql";
import HostEventCard from "./HostEventCard";

type Props = {
  hostEvents: HostEventCard_HostEventFragment[];
};

const HostEventList: React.FunctionComponent<Props> = ({ nfcs }) => {
  return (
    <>
      {upcomingEvents?.map(
        (h: HostEventCard_HostEventFragment) =>
          !!h && <HostEventCard key={h.id} hostEvent={h} />
      )}
      <Flex direction="column" align="center" justify="center" w="100%">
        <Text fontSize="2rem">Previous Streams</Text>
      </Flex>
      {pastEvents?.map(
        (h: HostEventCard_HostEventFragment) =>
          !!h && <HostEventCard key={h.id} hostEvent={h} />
      )}
    </>
  );
};

export default HostEventList;
