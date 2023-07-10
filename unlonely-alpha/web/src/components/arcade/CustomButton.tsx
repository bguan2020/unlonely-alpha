import { IconButton, Image } from "@chakra-ui/react";
import { useState } from "react";

type Props = {
  noHover?: boolean;
  callback?: () => void;
};

const CustomButton: React.FunctionComponent<Props> = ({
  noHover,
  callback,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <IconButton
      aria-label="Custom"
      _hover={{}}
      _active={{}}
      _focus={{}}
      width="60px"
      height="60px"
      bg="transparent"
      icon={
        isHovered && !noHover ? (
          <Image
            alt="custom-hover"
            src="/svg/arcade/custom-hover.svg"
            width="100%"
          />
        ) : (
          <Image alt="custom" src="/svg/arcade/custom.svg" width="100%" />
        )
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={callback}
    />
  );
};

export default CustomButton;
