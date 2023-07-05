import React from "react";
import { Avatar, Flex, Tooltip, Text, Image } from "@chakra-ui/react";
import { anonUrl } from "./AnonUrl";
import centerEllipses from "../../utils/centerEllipses";
import { CustomUser } from "../../constants/types";
import { useGetBadges } from "../../hooks/internal/useGetBadges";

type Props = {
  user?: CustomUser;
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

  const { rankUrl } = useGetBadges(user?.tokenHolderRank);

  const toolTipMessage = (user: CustomUser) => {
    return (
      <>
        <Flex direction="column">
          <Text>
            {user.username ? user.username : centerEllipses(user.address, 8)}
          </Text>
          <Flex direction="row">
            {rankUrl && (
              <Image src={rankUrl} width="20px" height="20px" mr="5px" />
            )}
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
              size="sm"
            />
          </Tooltip>
        </>
      ) : (
        <Tooltip label="mysterious anon👀" hasArrow arrowSize={14}>
          <Avatar name="anon" src={anonUrl} bg="grey" size="sm" />
        </Tooltip>
      )}
    </>
  );
};

export default Participant;
