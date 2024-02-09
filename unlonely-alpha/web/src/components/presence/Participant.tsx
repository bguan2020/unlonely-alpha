import React from "react";
import {
  Avatar,
  Flex,
  Tooltip,
  Text,
  Image,
  Popover,
  PopoverContent,
  PopoverArrow,
  PopoverTrigger,
} from "@chakra-ui/react";

import { anonUrl } from "./AnonUrl";
import centerEllipses from "../../utils/centerEllipses";
import { CustomUser } from "../../constants/types";
import { useGetBadges } from "../../hooks/internal/useGetBadges";
import { getColorFromString } from "../../styles/Colors";
import { useChannelContext } from "../../hooks/context/useChannel";

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

  const { rankUrl } = useGetBadges(user?.channelUserRank);
  const { ui } = useChannelContext();
  const { handleSelectedUserInChat } = ui;

  return (
    <>
      {user ? (
        <>
          <Popover trigger="hover">
            <PopoverTrigger>
              <Avatar
                name={user.username ? user.username : user.address}
                src={ipfsUrl}
                size={"sm"}
                bg={getColorFromString(
                  user.username ? user.username : user.address
                )}
              />
            </PopoverTrigger>
            <PopoverContent bg="gray.800" border="none" width="min" p="5px">
              <PopoverArrow bg="gray.800" />
              <Flex
                direction="column"
                onClick={() =>
                  handleSelectedUserInChat({
                    address: user.address,
                    username: user.username ?? undefined,
                  })
                }
                _hover={{
                  cursor: "pointer",
                  bg: "gray.700",
                }}
                borderRadius="5px"
                p="5px"
              >
                <Flex gap="5px">
                  <Text fontSize="12px" textAlign={"center"}>
                    {user.username
                      ? user.username
                      : centerEllipses(user.address, 8)}
                  </Text>
                </Flex>
                <Flex direction="row" justifyContent={"center"}>
                  {rankUrl && (
                    <Image src={rankUrl} width="20px" height="20px" mr="5px" />
                  )}
                  {user.isFCUser && (
                    <Image
                      src="/images/farcaster_logo.png"
                      width="20px"
                      height="20px"
                      mr="5px"
                    />
                  )}
                </Flex>
              </Flex>
            </PopoverContent>
          </Popover>
        </>
      ) : (
        <Tooltip label="mysterious anon👀" hasArrow arrowSize={14}>
          <Avatar name="anon" src={anonUrl} bg="grey" size={"sm"} />
        </Tooltip>
      )}
    </>
  );
};

export default Participant;
