import { Button, Image, Flex, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";

export const Navbar = () => {
  const router = useRouter();

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
          <Text fontFamily="Neue Pixel Sans" fontWeight={"light"}>
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
          <Text fontFamily="Neue Pixel Sans" fontWeight={"light"}>
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
          <Text fontFamily="Neue Pixel Sans" fontWeight={"light"}>
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
        <Flex direction="column">
          <Image
            src={`/svg/mobile/profile-nav${
              router.pathname.startsWith("/profile") ? "-selected" : ""
            }.svg`}
            h="40px"
          />
          <Text fontFamily="Neue Pixel Sans" fontWeight={"light"}>
            profile
          </Text>
        </Flex>
      </Button>
    </Flex>
  );
};
