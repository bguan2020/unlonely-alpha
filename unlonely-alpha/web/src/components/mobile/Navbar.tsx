import { Button, Image, Flex, Text, Avatar } from "@chakra-ui/react";
import { useRouter } from "next/router";

import { anonUrl } from "../../components/presence/AnonUrl";
import { useUser } from "../../hooks/context/useUser";

export const Navbar = () => {
  const router = useRouter();
  const { user } = useUser();

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
        bg="transparent"
        _hover={{}}
        _focus={{}}
        _active={{}}
        onClick={() => {
          router.push("/");
        }}
      >
        <Flex direction="column">
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
        bg="transparent"
        _hover={{}}
        _focus={{}}
        _active={{}}
        onClick={() => {
          router.push("/nfcs");
        }}
      >
        <Flex direction="column">
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
        bg="transparent"
        _hover={{}}
        _focus={{}}
        _active={{}}
        onClick={() => {
          router.push("/schedule");
        }}
      >
        <Flex direction="column">
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
        bg="transparent"
        _hover={{}}
        _focus={{}}
        _active={{}}
        onClick={() => {
          router.push("/profile");
        }}
      >
        <Flex direction="column" alignItems={"center"}>
          {user ? (
            <Avatar
              name={user?.username ?? user?.address}
              src={ipfsUrl}
              width="40px"
              height="40px"
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
            profile
          </Text>
        </Flex>
      </Button>
    </Flex>
  );
};
