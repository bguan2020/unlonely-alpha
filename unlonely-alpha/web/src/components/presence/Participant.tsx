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
import Link from "next/link";
import { ExternalLinkIcon } from "@chakra-ui/icons";

import { anonUrl } from "./AnonUrl";
import centerEllipses from "../../utils/centerEllipses";
import { CustomUser } from "../../constants/types";
import { useGetBadges } from "../../hooks/internal/useGetBadges";

type Props = {
  user?: CustomUser;
  mobile?: boolean;
};
const Participant = ({ user, mobile }: Props) => {
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
          <Popover trigger="hover">
            <PopoverTrigger>
              <Avatar
                name={user.username ? user.username : user.address}
                src={ipfsUrl}
                size={"sm"}
              />
            </PopoverTrigger>
            <PopoverContent bg="gray.800" border="none" width="min" p="5px">
              <PopoverArrow bg="gray.800" />
              <Link
                target="_blank"
                href={`https://etherscan.io/address/${
                  user?.address ? user.address : ""
                }`}
                passHref
              >
                <Flex gap="5px">
                  <Text fontSize="12px" textAlign={"center"}>
                    {user.username
                      ? user.username
                      : centerEllipses(user.address, 8)}
                  </Text>
                  <ExternalLinkIcon />
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
              </Link>
            </PopoverContent>
          </Popover>
        </>
      ) : (
        <Tooltip label="mysterious anon👀" hasArrow arrowSize={14}>
          <Avatar
            name="anon"
            src={anonUrl}
            bg="grey"
            size={"sm"}
          />
        </Tooltip>
      )}
    </>
  );
};

export default Participant;
