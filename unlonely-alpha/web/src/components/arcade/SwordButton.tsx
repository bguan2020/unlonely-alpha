import { IconButton, Image } from "@chakra-ui/react";
import { useState } from "react";

type Props = {
  callback?: () => void;
};

const SwordButton: React.FunctionComponent<Props> = ({ callback }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <IconButton
      aria-label="sword"
      _hover={{}}
      _active={{}}
      _focus={{}}
      width="60px"
      height="60px"
      bg="transparent"
      icon={
        isHovered ? (
          <Image alt="sword-hover" src="/svg/sword-hover.svg" width="100%" />
        ) : (
          <Image alt="sword" src="/svg/sword.svg" width="100%" />
        )
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={callback}
    />
  );
};

export default SwordButton;
