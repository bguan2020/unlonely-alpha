import { Box, HStack, Button, Image, Flex, Text } from "@chakra-ui/react";

export const Navbar = () => {
  return (
    <Box position="fixed" bottom="0" left="0" width="100%" height="68px">
      <HStack justifyContent={"space-evenly"}>
        <Button bg="transparent" _hover={{}} _focus={{}} _active={{}}>
          <Flex direction="column">
            <Image src="/svg/mobile/channels-nav.svg" h="60px" />
            <Text fontFamily="Neue Pixel Sans" fontWeight={"light"}>
              channels
            </Text>
          </Flex>
        </Button>
        <Button bg="transparent" _hover={{}} _focus={{}} _active={{}}>
          <Flex direction="column">
            <Image src="/svg/mobile/nfcs-nav.svg" h="60px" />
            <Text fontFamily="Neue Pixel Sans" fontWeight={"light"}>
              NFCs
            </Text>
          </Flex>
        </Button>
        <Button bg="transparent" _hover={{}} _focus={{}} _active={{}}>
          <Flex direction="column">
            <Image src="/svg/mobile/schedule-nav.svg" h="60px" />
            <Text fontFamily="Neue Pixel Sans" fontWeight={"light"}>
              schedule
            </Text>
          </Flex>
        </Button>
      </HStack>
    </Box>
  );
};
