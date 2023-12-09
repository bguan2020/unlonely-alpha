import { Image } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";

import { ADD_REACTION_EVENT } from "../../../constants";

type Props = {
  gif: string;
  onClick?: (gif: string) => void;
  buttonDisabled: boolean;
  setButtonDisabled: (disabled: boolean) => void;
  size: string;
  padding: string;
  channel?: any;
  timeserial?: string;
};

const Gif = ({
  gif,
  onClick,
  buttonDisabled,
  setButtonDisabled,
  size,
  padding,
  channel,
  timeserial,
}: Props) => {
  const handleClick = () => {
    setButtonDisabled(true);
    if (timeserial) {
      channel.publish(ADD_REACTION_EVENT, {
        body: gif,
        name: ADD_REACTION_EVENT,
        extras: {
          reference: { type: "com.ably.reaction", timeserial },
        },
      });
    } else {
      if (onClick) onClick(gif);
    }

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
