import { Flex, Button, Text, ListItem, UnorderedList } from "@chakra-ui/react";
import { getTimeFromMillis } from "../../../utils/time";
import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";
import { useVersusTempTokenContext } from "../../../hooks/context/useVersusTempToken";
import { useTempTokenTimerState } from "../../../hooks/internal/temp-token/ui/useTempTokenTimerState";

export const VersusTokenDisclaimerModal = ({
  isOpen,
  handleClose,
}: {
  isOpen: boolean;
  handleClose: () => void;
}) => {
  const { gameState } = useVersusTempTokenContext();
  const {
    tokenA,
    tokenB,
    handleCanPlayToken,
    handleIsGameFinished,
    handleIsPreSaleOngoing,
  } = gameState;
  const { durationLeftForTempToken } = useTempTokenTimerState({
    tokenEndTimestamp: tokenA.endTimestamp,
    preSaleEndTimestamp: tokenA.preSaleEndTimestamp,
    callbackOnExpiration: () => {
      handleCanPlayToken(false);
      handleIsGameFinished(true);
    },
    callbackonPresaleEnd: () => {
      handleIsPreSaleOngoing(false);
    },
    chatbotMessages: {
      fiveMinuteWarningMessage: `The $${tokenA.symbol} and $${tokenB.symbol} tokens will expire in 5 minutes!`,
      presaleOverMessage: `The presale for $${tokenA.symbol} and $${tokenB.symbol} has ended!`,
      expirationMessage: "Game finished! Both tokens are now expired!",
    },
  });

  return (
    <TransactionModalTemplate
      title="YOU'RE JOINING THIS VERSUS GAME"
      isOpen={isOpen}
      handleClose={handleClose}
      bg={"#18162F"}
      hideFooter
    >
      <Flex direction="column" gap="10px">
        <Flex direction="column" gap="10px">
          {typeof durationLeftForTempToken === "number" && (
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
                  There are 2 competing tokens on this stream - ${tokenA.symbol}{" "}
                  VS ${tokenB.symbol}
                </Text>
              </ListItem>
              <ListItem>
                <Text fontSize="12px">
                  Once time runs out, the token with the highest price WINS.
                </Text>
              </ListItem>
              <ListItem>
                <Text fontSize="12px">
                  The liquidity from the LOSING token gets pumped into the
                  WINNING token.
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
