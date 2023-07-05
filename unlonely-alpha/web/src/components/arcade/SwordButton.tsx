import { IconButton, Image } from "@chakra-ui/react";
import { useState } from "react";

type Props = {
  noHover?: boolean;
  callback?: () => void;
};

const SwordButton: React.FunctionComponent<Props> = ({ noHover, callback }) => {
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
        isHovered && !noHover ? (
          <Image
            alt="sword-hover"
            src="/svg/arcade/sword-hover.svg"
            width="100%"
          />
        ) : (
          <Image alt="sword" src="/svg/arcade/sword.svg" width="100%" />
        )
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={callback}
    />
  );
};

export default SwordButton;
