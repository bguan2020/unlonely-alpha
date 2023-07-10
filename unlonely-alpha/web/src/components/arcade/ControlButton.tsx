import { IconButton, Image } from "@chakra-ui/react";
import { useState } from "react";

type Props = {
  noHover?: boolean;
  callback?: () => void;
};

const ControlButton: React.FunctionComponent<Props> = ({
  noHover,
  callback,
}) => {
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
        isHovered && !noHover ? (
          <Image
            alt="control-hover"
            src="/svg/arcade/control-hover.svg"
            width="100%"
          />
        ) : (
          <Image alt="control" src="/svg/arcade/control.svg" width="100%" />
        )
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={callback}
    />
  );
};

export default ControlButton;
