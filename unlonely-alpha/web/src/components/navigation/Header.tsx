import {
  Flex,
  Spacer,
  useBreakpointValue,
  Text,
  // Button,
  // PopoverContent,
  // Popover,
  // PopoverTrigger,
  // PopoverArrow,
} from "@chakra-ui/react";
import NextLink from "next/link";
import NextImage from "next/image";

import { ConnectWallet } from "./ConnectWallet";

const Header: React.FC = () => {
  const logo = useBreakpointValue({
    base: false,
    sm: true,
    md: true,
    xl: true,
  });

  const redirectToNewChannelPage = () => {
    window.open(`${window.location.origin}/onboard`, "_self");
  };

  return (
    <Flex
      as="header"
      backgroundColor="transparent"
      minWidth="90%"
      alignItems="center"
      marginBottom={logo ? "5px" : "0px"}
      padding="1rem"
      paddingBottom={"5px"}
      paddingTop={logo ? "20px" : "5px"}
      justifyContent="space-between"
      left={["0px", "0px", "0px"]}
      right="0px"
      zIndex="1000"
    >
      <Flex as="nav" width="100%" justifyContent="center">
        {logo && (
          <NextLink href="/" style={{ margin: "auto" }}>
            <Flex direction="column">
              <NextImage
                src="/svg/unlonely.svg"
                priority
                alt="unlonely"
                width={120}
                height={120}
              />
              <Text
                fontSize={"10px"}
                className="gradient-text"
                textAlign="center"
              >
                your cozy space on the internet
              </Text>
            </Flex>
          </NextLink>
        )}
        <Spacer>
          <Flex
            justifyContent={logo ? "flex-end" : "center"}
            gap="12px"
            alignItems="center"
            margin="auto"
            width="100%"
          >
            {/* <Popover trigger="hover" placement="left" openDelay={300}>
              <PopoverTrigger>
                <Button
                  border="1px solid white"
                  borderRadius="0"
                  color="white"
                  bg="rgba(70, 168, 0, 1)"
                  px="12px"
                  onClick={redirectToNewChannelPage}
                  _hover={{
                    bg: "rgba(70, 168, 0, 0.8)",
                  }}
                  _active={{}}
                  _focus={{}}
                >
                  <Text fontFamily="LoRes15">create</Text>
                </Button>
              </PopoverTrigger>
              <PopoverContent bg="#343dbb" border="none" width="100%" p="2px">
                <PopoverArrow bg="#343dbb" />
                <Text fontSize="12px" textAlign={"center"}>
                  create new channel
                </Text>
              </PopoverContent>
            </Popover> */}
            <ConnectWallet />
          </Flex>
        </Spacer>
      </Flex>
    </Flex>
  );
};

export default Header;
