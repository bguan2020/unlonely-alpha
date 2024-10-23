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
  PackageNameToModalTitle,
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
        setLoadingText("...checking $BOO balance...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const balance = await balanceData.fetchTokenBalance();
        console.log("balance", balance);
        if (balance !== undefined && balance < Number(interactionData.price)) {
          triggerGlowingEffect();
        }
        setLoadingText(null);
      }
    };
    checkSolanaTokenBalance();
  }, [isOpen]);

  return (
    <Modal isCentered isOpen={isOpen} onClose={handleClose} size="xs">
      <ModalOverlay backgroundColor="#230f6683" />
      <ModalContent
        maxW="500px"
        boxShadow="0px 8px 28px #0a061c40"
        padding="12px"
        borderRadius="5px"
        bg="#7EFB97"
        color="black"
      >
        <Flex direction="column">
          {loadingText !== null ? (
            <Flex direction="column" gap="22px">
              <Text fontWeight={"bold"} textAlign="center">
                {PackageNameToModalTitle[interactionData.name]}
              </Text>
              <Flex justifyContent={"center"}>
                <Spinner />
              </Flex>
              {loadingText && (
                <Text fontWeight={"bold"} textAlign="center">
                  {loadingText}
                </Text>
              )}
            </Flex>
          ) : balanceData.balance === null ||
            (balanceData.balance !== null &&
              balanceData.balance < Number(interactionData.price)) ? (
            <Flex
              direction="column"
              gap="22px"
              alignItems="center"
              width="100%"
            >
              <Text textAlign={"center"} fontWeight={"bold"}>
                {"you don’t hold enough $BOO rn :("}
              </Text>
              <Text width="200px" textAlign="center">
                buy at least{" "}
                {addCommasToNumber(
                  Math.ceil(
                    Number(interactionData.price) - (balanceData.balance ?? 0)
                  )
                )}{" "}
                to unlock this action!
              </Text>
            </Flex>
          ) : (
            <Flex direction="column" gap="10px">
              <Text textAlign="center" fontWeight={"bold"}>
                {PackageNameToModalTitle[interactionData.name]}
              </Text>
              {interactionData.name !== RESET_COOLDOWNS_NAME && (
                <Textarea
                  id="text"
                  placeholder={
                    isTts ? "Enter message to broadcast" : "Enter message"
                  }
                  bg="#18162D"
                  color="white"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              )}
              <Flex justifyContent={"flex-end"}>
                <Button
                  width="fit-content"
                  bg="#003EDA"
                  color={"white"}
                  _hover={{
                    bg: "#4683fd",
                  }}
                  fontSize={"25px"}
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
                  SEND NOW
                </Button>
              </Flex>
              {interactionData.name !== RESET_COOLDOWNS_NAME && (
                <>
                  {text.length > 200 ? (
                    <Text h="20px" color={"red"} fontSize="10px">
                      message must be 200 characters or under
                    </Text>
                  ) : containsSwears(text) ? (
                    <Text h="20px" color={"red"} fontSize="10px">
                      message contains strong swear words
                    </Text>
                  ) : null}
                </>
              )}
            </Flex>
          )}
        </Flex>
      </ModalContent>
    </Modal>
  );
};
