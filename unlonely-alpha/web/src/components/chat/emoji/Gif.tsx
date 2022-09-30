import { Image, Tooltip } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";

import { useUser } from "../../../hooks/useUser";

type Props = {
  gif: string;
  onClick?: (gif: string) => void;
  buttonDisabled: boolean;
  setButtonDisabled: (disabled: boolean) => void;
};

const Gif = ({ gif, onClick, buttonDisabled, setButtonDisabled }: Props) => {
  const { user } = useUser();

  const handleClick = () => {
    setButtonDisabled(true);
    if (onClick) onClick(gif);
    setTimeout(() => {
      setButtonDisabled(false);
    }, 5000);
  };

  return (
    <>
      {user ? (
        <>
          {user.powerUserLvl > 0 ? (
            <Button
              type="button"
              padding="5px"
              as={onClick !== null ? "button" : "div"}
              textAlign="center"
              isDisabled={buttonDisabled}
              onClick={() => handleClick()}
            >
              <Image src={gif} h="40px" />
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
                  padding="5px"
                  isDisabled={true}
                  as={onClick !== null ? "button" : "div"}
                  textAlign="center"
                >
                  <Image src={gif} h="40px" />
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
              padding="5px"
              isDisabled={true}
              as={onClick !== null ? "button" : "div"}
              textAlign="center"
            >
              <Image src={gif} h="40px" />
            </Button>
          </span>
        </Tooltip>
      )}
    </>
  );
};

export default Gif;
