import React, { useEffect, useState } from "react";
import { configureAbly } from "@ably-labs/react-hooks";
import { Flex, SimpleGrid, Tooltip, Box } from "@chakra-ui/react";

import { usePresence } from "@ably-labs/react-hooks";
import Participant from "./Participant";
import { User } from "../../generated/graphql";
import { useUser } from "../../hooks/context/useUser";
import ExcessTooltip from "./ExcessTooltip";
import AnonExcessTooltip from "./AnonExcessTooltip";

configureAbly({
  authUrl: "/api/createTokenRequest",
});

type Props = {
  ablyPresenceChannel?: string;
  mobile?: boolean;
};

type Presence = {
  id: string;
  data: { user: User };
  action: string;
  clientId: string;
  encoding: string;
  timestamp: number;
};

const Participants = ({ ablyPresenceChannel, mobile }: Props) => {
  const { user } = useUser();
  const [presenceData, updateStatus] = usePresence(
    ablyPresenceChannel ? ablyPresenceChannel : "presence"
  );
  const [participantOrder, setParticipantOrder] = useState<Presence[]>([]);

  useEffect(() => {
    if (presenceData) {
      // update my presence data to include my user data
      updateStatus({
        user,
      });
    }
  }, [user]);

  useEffect(() => {
    if (presenceData) {
      // split presenceData into two arrays, one where data.user exists, and one where it doesn't
      const presenceDataWithUser = presenceData.filter(
        (presence) => presence.data?.user
      );
      const presenceDataWithoutUser = presenceData.filter(
        (presence) => !presence.data?.user
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
        ...presenceDataWithoutUser,
      ];

      if (combinedPresenceData === participantOrder) return;

      setParticipantOrder(combinedPresenceData);

      // send combinedPresenceData to react native webview
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (window.ReactNativeWebView !== undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.ReactNativeWebView.postMessage(
          JSON.stringify(combinedPresenceData)
        );
      }
    }
  }, [presenceData]);

  const participantTooltip = () => {
    // display mapping in grid, 3 columns
    return (
      <>
        <SimpleGrid columns={3}>
          {participantOrder.map((member, index) => {
            if (member.data?.user) {
              return (
                <Flex key={index} m="auto" p="0.5rem">
                  <ExcessTooltip user={member.data.user} />
                </Flex>
              );
            } else {
              return (
                <Flex key={index} m="auto" p="0.5rem">
                  <AnonExcessTooltip />
                </Flex>
              );
            }
          })}
        </SimpleGrid>
      </>
    );
  };

  if (mobile) return <></>;

  // make Participant overlap each other a bit and show a max of 6, with the last one being a count of the rest
  return (
    <Flex direction="row" maxW="100%" justifyContent="center" pl="1rem">
      <Flex flexDirection="row-reverse">
        {!!participantOrder.slice(6).length && (
          <Flex ml={-2}>
            <Tooltip label={participantTooltip()} hasArrow arrowSize={14}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="14px"
                bg="black"
                borderRadius="50%"
                width="8"
                height="8"
              >
                {`+${participantOrder.slice(6).length}`}
              </Box>
            </Tooltip>
          </Flex>
        )}
        {participantOrder
          .slice(0, 6)
          .reverse()
          .map((member, index) => (
            <Flex key={index} ml={-4}>
              <Participant user={member.data?.user} />
            </Flex>
          ))}
      </Flex>
    </Flex>
  );
};

export default Participants;
