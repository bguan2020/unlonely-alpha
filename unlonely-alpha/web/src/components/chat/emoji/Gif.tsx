import { Image, Tooltip } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";

import { useUser } from "../../../hooks/context/useUser";

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
  const { user } = useUser();

  const handleClick = () => {
    setButtonDisabled(true);
    if (timeserial) {
      channel.publish("add-reaction", {
        body: gif,
        name: "add-reaction",
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
      {user ? (
        <>
          {user.powerUserLvl > 0 ? (
            <Button
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
          ) : (
            <Tooltip
              label={
                "You must have an Unlonely Power User badge to gain access to these gifs."
              }
            >
              <span>
                <Button
                  type="button"
                  padding={padding}
                  isDisabled={true}
                  as={onClick !== null ? "button" : "div"}
                  textAlign="center"
                  maxHeight={size}
                  w={size}
                  minW={size}
                >
                  <Image src={gif} />
                </Button>
              </span>
            </Tooltip>
          )}
        </>
      ) : (
        <Tooltip
          label={
            "You must have an Unlonely Power User badge to gain access to these gifs."
          }
        >
          <span>
            <Button
              type="button"
              padding={padding}
              isDisabled={true}
              as={onClick !== null ? "button" : "div"}
              textAlign="center"
              maxHeight={size}
              w={size}
              minW={size}
            >
              <Image src={gif} />
            </Button>
          </span>
        </Tooltip>
      )}
    </>
  );
};

export default Gif;
