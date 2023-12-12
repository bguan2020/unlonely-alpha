import { Button, Image, Flex, Text, Avatar, Badge } from "@chakra-ui/react";
import { useRouter } from "next/router";

import { anonUrl } from "../../components/presence/AnonUrl";
import { useCacheContext } from "../../hooks/context/useCache";
import { useUser } from "../../hooks/context/useUser";
import { getColorFromString } from "../../styles/Colors";

export const Navbar = () => {
  const router = useRouter();
  const { user } = useUser();
  const { claimableBets } = useCacheContext();

  const imageUrl = user?.FCImageUrl
    ? user.FCImageUrl
    : user?.lensImageUrl
    ? user.lensImageUrl
    : anonUrl;
  // if imageUrl begins with  ipfs://, convert to https://ipfs.io/ipfs/
  const ipfsUrl = imageUrl.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${imageUrl.slice(7)}`
    : imageUrl;

  return (
    <Flex
      width="100%"
      alignItems={"center"}
      justifyContent="space-between"
      height="95px"
    >
      <Button
        color="white"
        bg="transparent"
        _hover={{}}
        _focus={{}}
        _active={{}}
        onClick={() => {
          router.push("/");
        }}
      >
        <Flex direction="column" alignItems="center">
          <Image
            src={`/svg/mobile/channels-nav${
              router.pathname.startsWith("/channels") || router.pathname === "/"
                ? "-selected"
                : ""
            }.svg`}
            h="40px"
          />
          <Text fontFamily="LoRes15" fontWeight={"light"}>
            channels
          </Text>
        </Flex>
      </Button>
      <Button
        color="white"
        bg="transparent"
        _hover={{}}
        _focus={{}}
        _active={{}}
        onClick={() => {
          router.push("/nfcs");
        }}
      >
        <Flex direction="column" alignItems="center">
          <Image
            src={`/svg/mobile/nfcs-nav${
              router.pathname.startsWith("/nfcs") ? "-selected" : ""
            }.svg`}
            h="40px"
          />
          <Text fontFamily="LoRes15" fontWeight={"light"}>
            NFCs
          </Text>
        </Flex>
      </Button>
      <Button
        color="white"
        bg="transparent"
        _hover={{}}
        _focus={{}}
        _active={{}}
        onClick={() => {
          router.push("/schedule");
        }}
      >
        <Flex direction="column" alignItems="center">
          <Image
            src={`/svg/mobile/schedule-nav${
              router.pathname.startsWith("/schedule") ? "-selected" : ""
            }.svg`}
            h="40px"
          />
          <Text fontFamily="LoRes15" fontWeight={"light"}>
            schedule
          </Text>
        </Flex>
      </Button>
      <Button
        color="white"
        bg="transparent"
        _hover={{}}
        _focus={{}}
        _active={{}}
        onClick={() => {
          router.push("/profile");
        }}
      >
        <Flex
          direction="column"
          alignItems="center"
          borderRadius={"15px"}
          p={claimableBets.length > 0 ? "0.5rem" : undefined}
        >
          {user ? (
            <Avatar
              name={user?.username ?? user?.address}
              src={ipfsUrl}
              width="40px"
              height="40px"
              bg={getColorFromString(user?.username ?? user?.address)}
            />
          ) : (
            <Image
              src={`/svg/mobile/profile-nav${
                router.pathname.startsWith("/profile") ? "-selected" : ""
              }.svg`}
              h="40px"
            />
          )}
          <Text fontFamily="LoRes15" fontWeight={"light"}>
            profile{" "}
            {claimableBets.length > 0 && (
              <Badge
                className="hithere"
                variant="solid"
                ml="1"
                colorScheme={"red"}
                fontSize="0.8em"
              >
                {claimableBets.length > 99 ? "99+" : claimableBets.length}
              </Badge>
            )}
          </Text>
        </Flex>
      </Button>
    </Flex>
  );
};
