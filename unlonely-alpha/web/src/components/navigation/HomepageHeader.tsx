import { Flex, Spacer, useBreakpointValue, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import NextImage from "next/image";

import Link from "next/link";

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
            <Flex direction="column">
              <NextImage
                src="/svg/unlonely-green.svg"
                priority
                alt="unlonely"
                width={120}
                height={120}
              />
            </Flex>
          </NextLink>
        )}
        <Spacer>
          <Flex
            justifyContent={logo ? "flex-end" : "center"}
            gap="20px"
            alignItems="center"
            margin="auto"
            width="100%"
          >
            <Link href="https://bit.ly/unlonelyFAQs" passHref target="_blank">
              <Text fontFamily="LoRes15" color="rgba(55, 255, 139, 1)">
                faq
              </Text>
            </Link>
            <Link
              href="https://t.me/+c19n9g-FxZszODIx"
              passHref
              target="_blank"
            >
              <Text fontFamily="LoRes15" color="rgba(55, 255, 139, 1)">
                telegram
              </Text>
            </Link>
            <Link
              href="https://twitter.com/unlonely_app"
              passHref
              target="_blank"
            >
              <Text fontFamily="LoRes15" color="rgba(55, 255, 139, 1)">
                twitter
              </Text>
            </Link>
          </Flex>
        </Spacer>
      </Flex>
    </Flex>
  );
};

export default Header;
