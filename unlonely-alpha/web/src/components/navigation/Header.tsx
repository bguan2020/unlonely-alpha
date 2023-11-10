import { Flex, Spacer, useBreakpointValue } from "@chakra-ui/react";
import NextLink from "next/link";
import NextImage from "next/image";

import ConnectWallet from "./ConnectWallet";

const Header: React.FC = () => {
  const logo = useBreakpointValue({
    base: false,
    sm: true,
    md: true,
    xl: true,
  });

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
            <NextImage
              src="/svg/unlonely.svg"
              priority
              alt="unlonely"
              width={100}
              height={100}
            />
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
            <ConnectWallet />
          </Flex>
        </Spacer>
      </Flex>
    </Flex>
  );
};

export default Header;
