import { IconButton, Image } from "@chakra-ui/react";
import { useState } from "react";

type Props = {
  callback?: () => void;
};

const DiceButton: React.FunctionComponent<Props> = ({ callback }) => {
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
        isHovered ? (
          <Image alt="dice-hover" src="/svg/dice-hover.svg" width="100%" />
        ) : (
          <Image alt="dice" src="/svg/dice.svg" width="100%" />
        )
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={callback}
    />
  );
};

export default DiceButton;
