import { IconButton, Image } from "@chakra-ui/react";
import { useState } from "react";

type Props = {
  noHover?: boolean;
  callback?: () => void;
};

const CoinButton: React.FunctionComponent<Props> = ({ noHover, callback }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <IconButton
      aria-label="Coin"
      _hover={{}}
      _active={{}}
      _focus={{}}
      width="60px"
      height="60px"
      bg="transparent"
      icon={
        isHovered && !noHover ? (
          <Image alt="coin-hover" src="/svg/coin-hover.svg" width="100%" />
        ) : (
          <Image alt="coin" src="/svg/coin.svg" width="100%" />
        )
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={callback}
    />
  );
};

export default CoinButton;
