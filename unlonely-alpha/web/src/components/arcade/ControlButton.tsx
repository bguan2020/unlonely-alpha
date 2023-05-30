import { IconButton, Image } from "@chakra-ui/react";
import { useState } from "react";

type Props = {
  callback?: () => void;
};

const ControlButton: React.FunctionComponent<Props> = ({ callback }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <IconButton
      aria-label="Control"
      _hover={{}}
      _active={{}}
      _focus={{}}
      width="60px"
      height="60px"
      bg="transparent"
      icon={
        isHovered ? (
          <Image
            alt="control-hover"
            src="/svg/control-hover.svg"
            width="100%"
          />
        ) : (
          <Image alt="control" src="/svg/control.svg" width="100%" />
        )
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={callback}
    />
  );
};

export default ControlButton;
