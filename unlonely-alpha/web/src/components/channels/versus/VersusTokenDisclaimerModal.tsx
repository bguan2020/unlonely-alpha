import { Flex, Button, Text, ListItem, UnorderedList } from "@chakra-ui/react";
import { getTimeFromMillis } from "../../../utils/time";
import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";
import { useVersusTempTokenContext } from "../../../hooks/context/useVersusTempToken";
import { useVersusTempTokenTimerState } from "../../../hooks/internal/versus-token/ui/useVersusTempTokenTimerState";

export const VersusTokenDisclaimerModal = ({
  isOpen,
  handleClose,
}: {
  isOpen: boolean;
  handleClose: () => void;
}) => {
  const { gameState } = useVersusTempTokenContext();
  const { tokenA, tokenB, handleCanPlayToken, handleIsGameFinished } =
    gameState;
  const { endTimestamp: endTimestampA } = tokenA;
  const { endTimestamp: endTimestampB } = tokenB;
  const { durationLeftForTempToken } = useVersusTempTokenTimerState(
    endTimestampA || endTimestampB,
    () => {
      handleCanPlayToken(false);
      handleIsGameFinished(true);
    },
    true,
    `The $${tokenA} and $${tokenB} tokens will expire in 5 minutes!`,
    ""
  );

  return (
    <TransactionModalTemplate
      title="30 MINUTE TOKEN LAUNCHED!"
      isOpen={isOpen}
      handleClose={handleClose}
      bg={"#18162F"}
      hideFooter
    >
      <Flex direction="column" gap="10px">
        <Flex direction="column" gap="10px">
          {durationLeftForTempToken !== undefined && (
            <Text
              textAlign="center"
              fontSize="1rem"
              fontStyle={"italic"}
              mb="15px"
            >
              There is{" "}
              <Text as="span" color="#37FF8B" fontWeight="bold">
                {getTimeFromMillis(durationLeftForTempToken * 1000, true, true)}
              </Text>{" "}
              left to play!
            </Text>
          )}
          <Text fontFamily={"LoRes15"} fontSize="1.5rem" color="#37FF8B">
            How it works
          </Text>
          <Flex direction="column" gap="5px">
            <UnorderedList>
              <ListItem>
                <Text fontSize="12px">
                  The 30 minute token is an ERC20 token priced on a bonding
                  curve.
                </Text>
              </ListItem>
            </UnorderedList>
          </Flex>
          <Text fontFamily={"LoRes15"} fontSize="1.5rem" color="#37FF8B">
            Disclaimer
          </Text>
          <Text fontSize="12px">
            YOU COULD LOSE YOUR FUNDS. Try not to get caught with your bags
            full!
          </Text>
        </Flex>
        <Flex justifyContent={"space-evenly"} gap="5px" mb="15px" py={4}>
          <Button
            bg="#37FF8B"
            onClick={() => {
              handleCanPlayToken(true);
              handleClose();
            }}
          >
            <Text fontFamily={"LoRes15"} fontSize="1.5rem">
              I understand, let's play
            </Text>
          </Button>
        </Flex>
      </Flex>
    </TransactionModalTemplate>
  );
};
