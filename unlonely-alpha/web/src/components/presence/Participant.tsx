import React from "react";
import { Avatar, Flex, Tooltip, Text, Image } from "@chakra-ui/react";
import { User } from "../../generated/graphql";
import { anonUrl } from "./AnonUrl";
import centerEllipses from "../../utils/centerEllipses";

type Props = {
  user: User;
};
const Participant = ({ user }: Props) => {
  const imageUrl = user?.FCImageUrl
    ? user.FCImageUrl
    : user?.lensImageUrl
    ? user.lensImageUrl
    : anonUrl;
  // if imageUrl begins with  ipfs://, convert to https://ipfs.io/ipfs/
  const ipfsUrl = imageUrl.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${imageUrl.slice(7)}`
    : imageUrl;

  const toolTipMessage = (user: User) => {
    return (
      <>
        <Flex direction="column">
          <Text>
            {user.username ? user.username : centerEllipses(user.address, 8)}
          </Text>
          <Flex direction="row">
            {user.powerUserLvl > 0 ? (
              <Image
                src={`/images/badges/lvl${user.powerUserLvl}_poweruser.png`}
                width="20px"
                height="20px"
                mr="5px"
              />
            ) : null}
            {user.videoSavantLvl > 0 ? (
              <Image
                src={`/images/badges/lvl${user.videoSavantLvl}_host.png`}
                width="20px"
                height="20px"
                mr="5px"
              />
            ) : null}
            {user.isFCUser ? (
              <Image
                src="/images/farcaster_logo.png"
                width="20px"
                height="20px"
                mr="5px"
              />
            ) : null}
          </Flex>
        </Flex>
      </>
    );
  };
  return (
    <>
      {user ? (
        <>
          <Tooltip label={toolTipMessage(user)} hasArrow arrowSize={14}>
            <Avatar
              name={user.username ? user.username : user.address}
              src={ipfsUrl}
              size="md"
            />
          </Tooltip>
        </>
      ) : (
        <Tooltip label="mysterious anon👀" hasArrow arrowSize={14}>
          <Avatar name="anon" src={anonUrl} bg="grey" size="md" />
        </Tooltip>
      )}
    </>
  );
};

export default Participant;
