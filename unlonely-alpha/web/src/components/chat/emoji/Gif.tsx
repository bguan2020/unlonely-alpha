import { Image } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";

type Props = {
  gif: string;
  onClick?: (gif: string) => void;
  buttonDisabled: boolean;
  setButtonDisabled: (disabled: boolean) => void;
  size: string;
  padding: string;
};

const Gif = ({
  gif,
  onClick,
  buttonDisabled,
  setButtonDisabled,
  size,
  padding,
}: Props) => {
  const handleClick = () => {
    setButtonDisabled(true);
    if (onClick) onClick(gif);

    setTimeout(() => {
      setButtonDisabled(false);
    }, 2000);
  };

  return (
    <>
      <Button
        color="white"
        type="button"
        padding={padding}
        as={onClick !== null ? "button" : "div"}
        textAlign="center"
        isDisabled={buttonDisabled}
        onClick={() => handleClick()}
        maxHeight={size}
        w={size}
        minW={size}
      >
        <Image src={gif} />
      </Button>
    </>
  );
};

export default Gif;
