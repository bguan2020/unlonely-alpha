import { Flex, IconButton, Image, Text } from "@chakra-ui/react";
import { useState } from "react";

type Props = {
  tokenName: string;
  callback?: () => void;
  noHover?: boolean;
  small?: boolean;
};

const BuyButton: React.FunctionComponent<Props> = ({
  tokenName,
  callback,
  noHover,
  small,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Flex position="relative" justifyContent={"center"}>
      <IconButton
        aria-label={`${tokenName}-buy`}
        icon={
          isHovered && !noHover ? (
            <Image
              src="/svg/arcade/buy-hover.svg"
              width="100%"
              h={small ? "100%" : undefined}
            />
          ) : (
            <Image
              src="/svg/arcade/buy.svg"
              width="100%"
              h={small ? "100%" : undefined}
            />
          )
        }
        width={small ? undefined : "300px"}
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
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        position="absolute"
        width={small ? "100px" : "250px"}
        ml={small ? "5px" : "20px"}
        pointerEvents="none"
      >
        <Text
          lineHeight={1}
          fontSize={small ? "1rem" : "30px"}
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
