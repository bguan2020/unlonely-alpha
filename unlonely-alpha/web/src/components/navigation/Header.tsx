import {
  IconButton,
  Flex,
  Divider,
  Box,
  Heading,
  Spacer,
  Button,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { useState } from "react";

import SignIn from "../SignIn";

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
      <IconButton
        display={["inline-flex", "inline-flex", "none"]}
        aria-label="Open Menu"
        size="xs"
        width="32px"
        height="32px"
        marginLeft="0px"
        fontSize="24px"
        borderRadius="4px"
        background="transparent"
        _hover={{ opacity: 0.8 }}
        _active={{ opacity: 0.6 }}
        icon={<HamburgerIcon />}
        onClick={() => setDisplayMobileMenu(true)}
      />

      {/* Mobile Nav */}
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
        <Flex width="100%" justifyContent="space-between" mb="5px">
          <IconButton
            aria-label="Close Menu"
            size="xs"
            width="32px"
            height="32px"
            marginLeft="0px"
            fontSize="20px"
            borderRadius="4px"
            background="transparent"
            _hover={{ opacity: 0.8 }}
            _active={{ opacity: 0.6 }}
            icon={<CloseIcon color="gray.900" />}
            onClick={() => setDisplayMobileMenu(false)}
          />
        </Flex>

        <Flex width="100%" justifyContent="center">
          <Button
            mr="18px"
            bg="white"
            color="#2C3A50"
            borderRadius="15px"
            _hover={{ bg: "#C1CBD9" }}
            // onClick={(e) => handleMobileClick(e, "/post")}
          >
            <Flex fontSize="15px" fontWeight="bold">
              Mint HNTR
            </Flex>
          </Button>
        </Flex>

        <Flex width="100%" justifyContent="center"></Flex>

        <Flex width="100%" justifyContent="center">
          <SignIn />
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
            color="#2C3A50"
            paddingRight="10px"
            paddingLeft="6px"
            m="auto"
          >
            Unlonely
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
            <SignIn />
          </Flex>
        </Spacer>
      </Flex>
    </Flex>
  );
};

export default Header;
