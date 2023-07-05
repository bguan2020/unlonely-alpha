import { IconButton, Image } from "@chakra-ui/react";
import { useState } from "react";

type Props = {
  noHover?: boolean;
  callback?: () => void;
};

const DiceButton: React.FunctionComponent<Props> = ({ noHover, callback }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <IconButton
      aria-label="dice"
      _hover={{}}
      _active={{}}
      _focus={{}}
      width="60px"
      height="60px"
      bg="transparent"
      icon={
        isHovered && !noHover ? (
          <Image
            alt="dice-hover"
            src="/svg/arcade/dice-hover.svg"
            width="100%"
          />
        ) : (
          <Image alt="dice" src="/svg/arcade/dice.svg" width="100%" />
        )
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={callback}
    />
  );
};

export default DiceButton;
