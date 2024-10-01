import {
  Flex,
  InputGroup,
  Input,
  InputRightElement,
  Text,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { alphanumericInput } from "../../../utils/validation/input";

export const CreateUsernameInterface = ({
  handleClose,
}: {
  handleClose: () => void;
}) => {
  const [stagingUsername, setStagingUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

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

  const handleCreateUsername = async () => {
    setLoading(true);
    try {
      // await createUsername({ username: stagingUsername });
      handleClose();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <Flex direction="column" gap="10px" justifyContent={"center"}>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <Text textAlign="center" color="#ff3b3b" fontWeight={"bold"}>
            Heads up! You can't change your username once you've created it!
          </Text>
          <InputGroup size="sm" variant="glow">
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
              .boo
            </InputRightElement>
          </InputGroup>
          {errorMessage && (
            <Text textAlign="center" color="#ff3b3b" fontSize="15px">
              {errorMessage}
            </Text>
          )}
          <Button
            isDisabled={errorMessage !== "" || stagingUsername.length === 0}
            onClick={handleCreateUsername}
          >
            create
          </Button>
        </>
      )}
    </Flex>
  );
};
