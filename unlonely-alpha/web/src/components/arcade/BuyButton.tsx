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
    <Flex position="relative" justifyContent={"center"}>
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
        // align="left"
        // top="7px"
        // left="55px"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        position="absolute"
        width={"250px"}
        ml={"20px"}
        pointerEvents="none"
      >
        <Text
          lineHeight={1}
          fontSize="30px"
          fontWeight={"bold"}
          textAlign="center"
        >
          buy {tokenName ? tokenName : "token"}
        </Text>
      </Flex>
    </Flex>
  );
};

export default BuyButton;
