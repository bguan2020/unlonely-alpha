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
    <>
      {!small ? (
        <Flex position="relative" justifyContent={"center"}>
          <IconButton
            aria-label={`${tokenName}-buy`}
            icon={
              isHovered && !noHover ? (
                <Image src="/svg/arcade/buy-hover.svg" width="100%" />
              ) : (
                <Image src="/svg/arcade/buy.svg" width="100%" />
              )
            }
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
            width={"250px"}
            ml={"20px"}
            pointerEvents="none"
          >
            <Text
              lineHeight={1}
              fontSize={"30px"}
              fontWeight={"bold"}
              textAlign="center"
            >
              buy {tokenName ? tokenName : "token"}
            </Text>
          </Flex>
        </Flex>
      ) : (
        <IconButton
          aria-label="buy"
          icon={<Image src="/svg/arcade/buy-mobile.svg" />}
          bg="transparent"
          _hover={{}}
          _active={{}}
          _focus={{}}
          h="100%"
          onClick={callback}
        />
      )}
    </>
  );
};

export default BuyButton;
