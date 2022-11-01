import { Flex, Text } from "@chakra-ui/react";
import { HostEventCard_HostEventFragment } from "../../generated/graphql";
import HostEventCard from "./HostEventCard";

type Props = {
  hostEvents: HostEventCard_HostEventFragment[];
};

const HostEventList: React.FunctionComponent<Props> = ({ hostEvents }) => {
  const eventDateState = (hostDate: string) => {
    // function to determine if hostEvent.hostDate is in the past by more than an hour, or if hostEvent.hostDate is less than 1 hour in the past, or if hostEvent.hostDate is in the future
    const hostEventDate = new Date(hostDate);
    const now = new Date();
    const dayFuture = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (hostEventDate < now) {
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      if (hostEventDate < hourAgo) {
        return "past";
      } else {
        return "live";
      }
    }
    // else if hostEventDate is less than 24 hour in the future
    else if (hostEventDate < dayFuture) {
      return "up next";
    }
  };
  // iterate hostEvents through eventDateState, if its "past", store in pastEvents array and order descending by hostDate
  const pastEvents = hostEvents
    .filter((hostEvent) => eventDateState(hostEvent.hostDate) === "past")
    .sort((a, b) => {
      return new Date(b.hostDate).getTime() - new Date(a.hostDate).getTime();
    });
  // array of hostEvents where eventDateState(hostEvent.hostDate) doesn't include "past"
  const upcomingEvents = hostEvents.filter(
    (hostEvent) => eventDateState(hostEvent.hostDate) !== "past"
  );

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
