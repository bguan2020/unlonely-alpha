import {
  Button,
  Flex,
  Heading,
  Spacer,
  useBreakpointValue,
  Image,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
// import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";

import ConnectWallet from "./ConnectWallet";

const Header: React.FC = () => {
  const logo = useBreakpointValue({
    base: false,
    sm: true,
    md: true,
    xl: true,
  });
  const router = useRouter();

  const openChatPopout = () => {
    const windowFeatures = "width=400,height=600,menubar=yes,toolbar=yes";
    window.open(`${window.location.origin}//bridge`, "_blank", windowFeatures);
  };

  return (
    <Flex
      as="header"
      backgroundColor="transparent"
      minWidth="90%"
      alignItems="center"
      marginBottom={logo ? "20px" : "0px"}
      padding="16px"
      paddingBottom={logo ? "10px" : "5px"}
      paddingTop={logo ? "20px" : "5px"}
      px="40px"
      justifyContent="space-between"
      left={["0px", "0px", "0px"]}
      right="0px"
      zIndex="1000"
    >
      <Flex as="nav" width="100%" justifyContent="center">
        {logo && (
          <NextLink href="/">
            <Heading
              as="h1"
              aria-label="title"
              fontSize="30px"
              lineHeight="1.2em"
              mt="20px"
              mb="40px"
              pb="10px"
              color="#fff"
              paddingRight="10px"
              paddingLeft="6px"
              m="auto"
            >
              unlonely
            </Heading>
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
            {!router.pathname.startsWith("/bridge") && (
              <Button
                _hover={{ transform: "scale(1.1)" }}
                _focus={{}}
                _active={{}}
                bg="#1724d7"
                p="0"
                onClick={openChatPopout}
              >
                <Flex gap="0.5rem" height={"100%"} p="5px">
                  <Image src="/svg/Base_Network_Logo.svg" />
                  <Text alignSelf={"center"}>Bridge</Text>
                </Flex>
              </Button>
            )}
            <ConnectWallet />
          </Flex>
        </Spacer>
      </Flex>
    </Flex>
  );
};

export default Header;
