import { Flex, IconButton, Image, Text } from "@chakra-ui/react";
import { useState } from "react";

type Props = {
  tokenName: string;
  callback?: () => void;
};

const BuyButton: React.FunctionComponent<Props> = ({ tokenName, callback }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Flex position="relative">
      <IconButton
        aria-label={`${tokenName}-buy`}
        icon={
          isHovered ? (
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
        position="relative"
      />
      <Flex
        direction="column"
        align="left"
        top="50%"
        left="60%"
        transform="translate(-50%, -50%)"
        position="absolute"
        width={"80%"}
        pointerEvents="none"
      >
        <Text lineHeight={1} fontSize="30px" textAlign={"left"}>
          Buy {tokenName}
        </Text>
      </Flex>
    </Flex>
  );
};

export default BuyButton;
