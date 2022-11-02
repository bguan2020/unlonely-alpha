import React, { useEffect, useState } from "react";
import { usePresence, configureAbly } from "@ably-labs/react-hooks";
import { AvatarGroup, Flex } from "@chakra-ui/react";
import Participant from "./Participant";
import { User } from "../../generated/graphql";

configureAbly({
  authUrl: "/api/createTokenRequest",
});

type Presence = {
  id: string;
  data: { user: User };
  action: string;
  clientId: string;
  encoding: string;
  timestamp: number;
};

const Participants = () => {
  const [presenceData] = usePresence("persistMessages:chat-demo");
  const [participantOrder, setParticipantOrder] = useState<Presence[]>([]);

  useEffect(() => {
    if (presenceData) {
      // split presenceData into two arrays, one where data.user exists, and one where it doesn't
      const presenceDataWithUser = presenceData.filter(
        (presence) => presence.data?.user
      );
      const presenceDataWithoutUser = presenceData.filter(
        (presence) => !presence.data?.user
      );
      // split presenceDataWithoutUser array into two arrays, rounding up
      const presenceDataWithoutUser1 = presenceDataWithoutUser.slice(
        0,
        Math.ceil(presenceDataWithoutUser.length / 2)
      );

      // randomly sort presenceDataWithUser
      const presenceDataWithUserRandom = presenceDataWithUser.sort(
        () => Math.random() - 0.5
      );


      // remove duplicates so only 1 of each user.address is shown
      const uniquePresenceDataWithUser = presenceDataWithUserRandom.filter(
        (presence, index, self) => {
          return (
            index ===
            self.findIndex(
              (t) => t.data.user.address === presence.data.user.address
            )
          );
        }
      );

      // combine the two arrays
      const combinedPresenceData = [
        ...uniquePresenceDataWithUser,
        ...presenceDataWithoutUser1,
      ];

      if (combinedPresenceData === participantOrder) return;

      setParticipantOrder(combinedPresenceData);
    }
  }, [presenceData]);

  const presenceList = participantOrder.map((member, index) => {
    return (
      <Flex key={index}>
        <Participant user={member.data?.user} />
      </Flex>
    );
  });

  return (
    <Flex direction="row" maxW="100%">
      <AvatarGroup max={6}>{presenceList}</AvatarGroup>
    </Flex>
  );
};

export default Participants;
