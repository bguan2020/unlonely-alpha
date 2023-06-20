import { Flex, IconButton, Image, Text } from "@chakra-ui/react";
import { useState } from "react";

type Props = {
  tokenName: string;
  callback?: () => void;
  noHover?: boolean;
};

const BuyButton: React.FunctionComponent<Props> = ({
  tokenName,
  callback,
  noHover,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Flex position="relative">
      <IconButton
        aria-label={`${tokenName}-buy`}
        icon={
          isHovered && !noHover ? (
            <Image src="/svg/buy-hover.svg" width="100%" />
          ) : (
            <Image src="/svg/buy.svg" width="100%" />
          )
        }
        width="300px"
        bg="transparent"
        _hover={{}}
        _active={{}}
        _focus={{}}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={callback}
        position="relative"
      />
      <Flex
        direction="column"
        align="left"
        top="7px"
        left="55px"
        position="absolute"
        width={"80%"}
        pointerEvents="none"
      >
        <Text lineHeight={1} fontSize="25px" textAlign={"left"}>
          buy {tokenName ? tokenName : "token"}
        </Text>
      </Flex>
    </Flex>
  );
};

export default BuyButton;
