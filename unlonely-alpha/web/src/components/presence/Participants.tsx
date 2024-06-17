import React, { useEffect, useState } from "react";
import { configureAbly } from "@ably-labs/react-hooks";
import {
  Flex,
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
} from "@chakra-ui/react";
import { usePresence } from "@ably-labs/react-hooks";

import Participant from "./Participant";
import { useUser } from "../../hooks/context/useUser";
import ExcessTooltipAvatar from "./ExcessTooltipAvatar";
import AnonExcessTooltipAvatar from "./AnonExcessTooltipAvatar";
import { useChannelContext } from "../../hooks/context/useChannel";
import { CustomUser } from "../../constants/types";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { truncateValue } from "../../utils/tokenDisplayFormatting";

configureAbly({
  authUrl: "/api/createTokenRequest",
});

type Props = {
  ablyPresenceChannel?: string;
  mobile?: boolean;
  show?: boolean;
};

type Presence = {
  id: string;
  data: { user: CustomUser };
  action: string;
  clientId: string;
  encoding: string;
  timestamp: number;
};

const limit = 6;

const Participants = ({ ablyPresenceChannel, show }: Props) => {
  const { user } = useUser();
  const { isStandalone } = useUserAgent();
  const { leaderboard } = useChannelContext();
  const { userRank } = leaderboard;
  const [presenceData, updateStatus] = usePresence(
    ablyPresenceChannel ? ablyPresenceChannel : "presence"
  );
  const [participantOrder, setParticipantOrder] = useState<Presence[]>([]);

  useEffect(() => {
    if (presenceData) {
      // update my presence data to include my user data
      updateStatus({
        user: user
          ? {
              ...user,
              channelUserRank: userRank,
            }
          : undefined,
      });
    }
  }, [user, userRank]);

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

  // make Participant overlap each other a bit and show a max of 6, with the last one being a count of the rest
  return (
    <>
      {show && (
        <Flex direction="row" maxW="100%" justifyContent="center">
          <Flex flexDirection="row-reverse" alignItems="center" ml={4}>
            {!!participantOrder.slice(limit).length && (
              <Flex>
                <Popover trigger={!isStandalone ? "hover" : "click"}>
                  <PopoverTrigger>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="14px"
                      bg="black"
                      borderRadius="10px"
                      width={"10"}
                      height={"8"}
                    >
                      {`+${truncateValue(
                        participantOrder.slice(limit).length * 2 + (Math.random() < 0.5 ? 1 : 0),
                        0,
                        true,
                        0
                      )}`}
                    </Box>
                  </PopoverTrigger>
                  <PopoverContent
                    bg="gray.800"
                    border="none"
                    height="400px"
                    overflowY="scroll"
                  >
                    <PopoverArrow bg="gray.800" />
                    {participantOrder.map((member, index) => {
                      if (member.data?.user) {
                        return (
                          <ExcessTooltipAvatar
                            key={index}
                            user={member.data.user}
                          />
                        );
                      } else {
                        return <AnonExcessTooltipAvatar key={index} />;
                      }
                    })}
                  </PopoverContent>
                </Popover>
              </Flex>
            )}
            {participantOrder
              .slice(0, limit)
              .reverse()
              .map((member, index) => (
                <Flex key={index} ml={-4}>
                  <Participant user={member.data?.user} />
                </Flex>
              ))}
          </Flex>
        </Flex>
      )}
    </>
  );
};

export default Participants;
