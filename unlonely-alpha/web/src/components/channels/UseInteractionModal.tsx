import {
  Modal,
  ModalOverlay,
  ModalContent,
  Flex,
  Spinner,
  Text,
  Button,
  Textarea,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { containsSwears } from "../../utils/validation/profanityFilter";
import {
  RESET_COOLDOWNS_NAME,
  TEXT_TO_SPEECH_PACKAGE_NAME,
} from "../../constants";
import { addCommasToNumber } from "../../utils/tokenDisplayFormatting";

export const UseInteractionModal = ({
  isOpen,
  handleClose,
  balanceData,
  interactionData,
  triggerGlowingEffect,
}: {
  isOpen: boolean;
  handleClose: () => void;
  balanceData: {
    balance: number | null;
    fetchTokenBalance: () => Promise<number | undefined>;
  };
  interactionData: {
    name: string;
    price: string;
    handleInteraction: (...args: any[]) => Promise<void>;
  };
  triggerGlowingEffect: () => void;
}) => {
  const [loadingText, setLoadingText] = useState<string | null>(null);
  const [text, setText] = useState("");

  const isTts = interactionData.name === TEXT_TO_SPEECH_PACKAGE_NAME;

  useEffect(() => {
    const checkSolanaTokenBalance = async () => {
      if (isOpen) {
        setLoadingText("Checking $BOO balance...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const balance = await balanceData.fetchTokenBalance();
        if (balance !== undefined && balance < Number(interactionData.price)) {
          triggerGlowingEffect();
        }
        setLoadingText(null);
      }
    };
    checkSolanaTokenBalance();
  }, [isOpen]);

  return (
    <Modal isCentered isOpen={isOpen} onClose={handleClose} size="sm">
      <ModalOverlay backgroundColor="#230f6683" />
      <ModalContent
        maxW="500px"
        boxShadow="0px 8px 28px #0a061c40"
        padding="12px"
        borderRadius="5px"
        bg="#281b5a"
      >
        <Flex direction="column">
          {loadingText !== null ? (
            <Flex direction="column">
              <Flex justifyContent={"center"}>
                <Spinner />
              </Flex>
              {loadingText && <Text textAlign="center">{loadingText}</Text>}
            </Flex>
          ) : balanceData.balance !== null &&
            balanceData.balance < Number(interactionData.price) ? (
            <Flex direction="column">
              <Text textAlign="center">
                need to hold at least {addCommasToNumber(interactionData.price)}{" "}
                $BOO
              </Text>
              <Text textAlign="center">
                you still need{" "}
                {addCommasToNumber(
                  Math.ceil(Number(interactionData.price) - balanceData.balance)
                )}{" "}
                $BOO
              </Text>
            </Flex>
          ) : (
            <Flex direction="column" gap="10px">
              <Text textAlign="center">disclaimer</Text>
              {interactionData.name !== RESET_COOLDOWNS_NAME && (
                <Textarea
                  id="text"
                  placeholder={
                    isTts ? "Enter message to broadcast" : "Enter message"
                  }
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              )}

              <Button
                bg="#2562db"
                color={"white"}
                _hover={{
                  bg: "#4683fd",
                }}
                onClick={async () => {
                  setLoadingText(
                    interactionData.name === RESET_COOLDOWNS_NAME
                      ? "resetting..."
                      : isTts
                      ? "sending message..."
                      : "using package..."
                  );
                  await interactionData.handleInteraction(text);
                  setText("");
                  setLoadingText(null);
                  handleClose();
                }}
                isDisabled={
                  (text.length === 0 ||
                    text.length > 200 ||
                    containsSwears(text)) &&
                  interactionData.name !== RESET_COOLDOWNS_NAME
                }
              >
                Send
              </Button>
              {interactionData.name !== RESET_COOLDOWNS_NAME && (
                <Text h="20px" color={"red"} fontSize="10px">
                  {text.length > 200
                    ? "message must be 200 characters or under"
                    : containsSwears(text)
                    ? "message contains strong swear words"
                    : ""}
                </Text>
              )}
            </Flex>
          )}
        </Flex>
      </ModalContent>
    </Modal>
  );
};
