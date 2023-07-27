import { Flex, Divider, Box, Heading, Spacer } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
// import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { useState } from "react";

import ConnectWallet from "./ConnectWalletButton";

const Header: React.FC = () => {
  const router = useRouter();
  const [displayMobileMenu, setDisplayMobileMenu] = useState(false);
  const handleMobileClick = (e: any, route: string) => {
    e.preventDefault;
    router.push(route);
    setDisplayMobileMenu(false);
  };

  return (
    <Flex
      as="header"
      backgroundColor="transparent"
      minWidth="90%"
      alignItems="center"
      marginBottom="20px"
      padding="16px"
      paddingBottom="10px"
      paddingTop="20px"
      paddingLeft="40px"
      paddingRight="40px"
      justifyContent="space-between"
      position="fixed"
      left={["0px", "0px", "0px"]}
      right="0px"
      zIndex="1000"
    >
      <Flex
        as="nav"
        position="fixed"
        overflowY="scroll"
        width="100%"
        minHeight="100vh"
        top="0"
        left="0"
        background="white"
        zIndex="1000"
        flexDirection="column"
        display={displayMobileMenu ? ["flex", "flex", "none"] : "none"}
        padding="16px"
      >
        <Flex width="100%" justifyContent="space-between" mb="5px"></Flex>

        <Flex width="100%" justifyContent="center"></Flex>

        <Flex width="100%" justifyContent="center"></Flex>

        <Flex width="100%" justifyContent="center">
          <ConnectWallet />
        </Flex>

        <Divider
          marginY="20px"
          orientation="horizontal"
          bg="gray.400"
          opacity="1"
          height="1px"
        />

        <Box>
          <Flex
            justifyContent="space-between"
            mb="18px"
            color="gray.600"
            fontSize="15px"
            fontWeight="semibold"
          >
            <div />
          </Flex>
        </Box>
      </Flex>

      {/* Desktop Nav */}
      <Flex as="nav" width="100%" justifyContent="center">
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
        <Spacer>
          <Flex
            justifyContent="flex-end"
            gap="12px"
            alignItems="center"
            margin="auto"
            width="100%"
          >
            <ConnectWallet />
          </Flex>
        </Spacer>
      </Flex>
    </Flex>
  );
};

export default Header;
