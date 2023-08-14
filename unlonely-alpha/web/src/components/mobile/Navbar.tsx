import { Box, HStack, Button, Image, Flex, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";

export const Navbar = () => {
  const router = useRouter();

  return (
    <Box position="fixed" bottom="0" left="0" width="100%" height="77px">
      <HStack justifyContent={"space-evenly"}>
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
                router.pathname.startsWith("/channels") ||
                router.pathname === "/"
                  ? "-selected"
                  : ""
              }.svg`}
              h="60px"
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
              h="60px"
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
              h="60px"
            />
            <Text fontFamily="Neue Pixel Sans" fontWeight={"light"}>
              schedule
            </Text>
          </Flex>
        </Button>
      </HStack>
    </Box>
  );
};
