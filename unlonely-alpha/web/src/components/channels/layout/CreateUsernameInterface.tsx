import {
  Flex,
  InputGroup,
  Input,
  InputRightElement,
  Text,
  Button,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { alphanumericInput } from "../../../utils/validation/input";
import useUpdateUsername from "../../../hooks/server/useUpdateUsername";
import { useUser } from "../../../hooks/context/useUser";

const topLevelDomain = ".boo";

export const CreateUsernameInterface = ({
  handleClose,
}: {
  handleClose: () => void;
}) => {
  const { user, handleUser } = useUser();
  const [stagingUsername, setStagingUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { updateUsername } = useUpdateUsername({});
  const toast = useToast();

  const errorMessage = useMemo(() => {
    if (stagingUsername.length === 0) {
      return "";
    }
    if (stagingUsername.length < 4) {
      return "Must be at least 4 characters long";
    }
    if (stagingUsername.length > 15) {
      return "Must be at most 15 characters long";
    }
    return "";
  }, [stagingUsername]);

  const handleError = () => {
    toast({
      title: "error creating username",
      status: "error",
      duration: 4000,
      isClosable: true,
    });
  };

  const handleCreateUsername = async () => {
    setLoading(true);
    if (!user) return;
    try {
      const res = await updateUsername({
        username: stagingUsername.concat(topLevelDomain),
        address: user?.address,
      });
      if (res) {
        handleUser({
          ...user,
          username: res?.res?.username,
        });
        handleClose();
      }
    } catch (error) {
      console.error(error);
      handleError();
    }
    setLoading(false);
  };

  return (
    <Flex direction="column" gap="10px">
      {loading ? (
        <Flex justifyContent={"center"}>
          <Spinner />
        </Flex>
      ) : (
        <>
          <Text textAlign="center" color="#ff3b3b" fontWeight={"bold"}>
            heads up - you won’t be able to change your username once you’ve
            created one!
          </Text>
          <Flex justifyContent={"center"}>
            <InputGroup variant="glow" width="250px">
              <Input
                placeholder="enter username"
                value={stagingUsername}
                onChange={(e) =>
                  setStagingUsername(alphanumericInput(e.target.value))
                }
              />
              <InputRightElement
                pointerEvents="none"
                bg="transparent"
                right="20px"
              >
                {topLevelDomain}
              </InputRightElement>
            </InputGroup>
          </Flex>

          {errorMessage && (
            <Text textAlign="center" color="#ff3b3b" fontSize="15px">
              {errorMessage}
            </Text>
          )}
          <Flex justifyContent={"center"}>
            <Button
              width="250px"
              isDisabled={errorMessage !== "" || stagingUsername.length === 0}
              onClick={handleCreateUsername}
            >
              create
            </Button>
          </Flex>
        </>
      )}
    </Flex>
  );
};
