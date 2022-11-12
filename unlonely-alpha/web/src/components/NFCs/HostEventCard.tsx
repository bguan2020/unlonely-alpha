import { Text, Grid, GridItem, Flex } from "@chakra-ui/layout";
import { Button, Image, Tooltip, useToast } from "@chakra-ui/react";
import { gql } from "@apollo/client";
import { useEffect, useState } from "react";

import { HostEventCard_HostEventFragment,  } from "../../generated/graphql";
import useLike from "../../hooks/useLike";

import { UpVoteIcon, UpVoteIconSalmon } from "../icons/UpVoteIcon";
import { DownVoteIcon, DownVoteIconSalmon } from "../icons/DownVoteIcon";
import NebulousButton from "../general/button/NebulousButton";
import { dateConverter } from "../../utils/timestampConverter";
import { useUser } from "../../hooks/useUser";
import EventState from "./EventState";
import ChallengeModal from "./ChallengeModal";

type Props = {
  nfc: HostEventCard_HostEventFragment;
};

const unlonelyAvatar = "https://i.imgur.com/MNArpwV.png";

const NfcCard = ({ hostEvent }: Props) => {

  return (
    <>
      <Flex
        direction="column"
        alignItems="left"
        w={{ base: "100%", md: "60%", lg: "60%", sm: "100%" }}
      >  
      </Flex>
      <Flex
        direction="column"
        bg="#F1F4F8"
        w={{ base: "100%", md: "60%", lg: "60%", sm: "100%" }}
        h="9rem"
        padding="0.3rem"
        borderRadius="1rem"
        minH="5rem"
        mb="1.5rem"
        mt="8px"
        boxShadow="0px 0px 16px rgba(0, 0, 0, 0.25)"
      >

      </Flex>
    </>
  );
};

NfcCard.fragments = {
  nFC: gql`
    fragment NFCCard_nFC on NFC {
      createdAt
      id
      videoLink
      owner {
        address
        FCImageUrl
        powerUserLvl
        videoSavantLvl
      }
      title
      score
  `,
};

export default NfcCard;
