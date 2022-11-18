import React from "react";
import { Avatar, Flex, Text, Image } from "@chakra-ui/react";
import { User } from "../../generated/graphql";
import centerEllipses from "../../utils/centerEllipses";

type Props = {
  user: User;
};

const ExcessTooltip = ({ user }: Props) => {
  return (
    <>
      <Flex direction="column" justifyContent="center">
        <Avatar
          src={user.FCImageUrl ? user.FCImageUrl : ""}
          name={user.username ? user.username : user.address}
          size="sm"
        />
        <Text fontSize="12px">
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
              src="https://searchcaster.xyz/img/logo.png"
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

export default ExcessTooltip;
