import {
  Box,
  Button,
  Flex,
  Step,
  StepIcon,
  StepIndicator,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Text,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";
import { useVersusTempTokenContext } from "../../../hooks/context/useVersusTempToken";
import { isAddressEqual } from "viem";
import { VersusTempTokenChart } from "./VersusTempTokenChart";
import { MobileVersusTokenExchange } from "../versus/MobileVersusTokenExchange";
import { useUser } from "../../../hooks/context/useUser";

const steps = [{ title: "streamer must select winner" }];

export const MobileVersusTempTokensInterface = ({
  customHeight,
}: {
  customHeight?: string;
}) => {
  const { walletIsConnected, privyUser, login, connectWallet, user } =
    useUser();
  const { gameState } = useVersusTempTokenContext();

  const {
    isGameFinishedModalOpen,
    handleIsGameFinishedModalOpen,
    focusedTokenToTrade,
    tokenA,
    tokenB,
    ownerMustMakeWinningTokenTradeable,
    handleFocusedTokenToTrade,
    isGameOngoing,
  } = gameState;

  useEffect(() => {
    if (ownerMustMakeWinningTokenTradeable)
      handleFocusedTokenToTrade(undefined);
  }, [ownerMustMakeWinningTokenTradeable]);

  return (
    <>
      <Flex
        direction={"column"}
        justifyContent={"space-between"}
        width="100%"
        gap={"5px"}
        h={customHeight ?? "100%"}
        p="10px"
      >
        <TransactionModalTemplate
          title={"Time's up!"}
          isOpen={isGameFinishedModalOpen}
          handleClose={() => handleIsGameFinishedModalOpen(false)}
          bg={"#18162F"}
          hideFooter
        >
          <Text textAlign={"center"}>
            The game is finished! The streamer will now decide the winner.
          </Text>
          <Flex justifyContent={"space-evenly"} gap="5px">
            <Button onClick={() => handleIsGameFinishedModalOpen(false)}>
              Continue
            </Button>
          </Flex>
        </TransactionModalTemplate>
        <Flex justifyContent={"center"} gap="5px">
          <Button
            color="white"
            _hover={{}}
            _focus={{}}
            _active={{}}
            bg={
              focusedTokenToTrade?.address === undefined ||
              isAddressEqual(
                focusedTokenToTrade?.address as `0x${string}`,
                tokenA.address as `0x${string}`
              )
                ? "rgba(255, 36, 36, 1)"
                : "#8f3636"
            }
            onClick={() => handleFocusedTokenToTrade(tokenA.contractData)}
          >
            ${tokenA.symbol}
          </Button>
          <Button
            color="white"
            _hover={{}}
            _focus={{}}
            _active={{}}
            bg={
              focusedTokenToTrade?.address === undefined ||
              isAddressEqual(
                focusedTokenToTrade?.address as `0x${string}`,
                tokenB.address as `0x${string}`
              )
                ? "rgba(42, 217, 255, 1)"
                : "#4d99aa"
            }
            onClick={() => handleFocusedTokenToTrade(tokenB.contractData)}
          >
            ${tokenB.symbol}
          </Button>
        </Flex>
        <Flex direction={"column"} flex="1" height="100%">
          <VersusTempTokenChart />
        </Flex>
        <Flex direction={"column"} height="150px">
          {ownerMustMakeWinningTokenTradeable && !isGameOngoing ? (
            <Stepper orientation="vertical" index={0}>
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepIndicator>
                    <StepStatus complete={<StepIcon />} />
                  </StepIndicator>
                  <Box>
                    <StepTitle>
                      <Text fontFamily="LoRes15">{step.title}</Text>
                    </StepTitle>
                  </Box>
                  <StepSeparator />
                </Step>
              ))}
            </Stepper>
          ) : (
            <>
              {walletIsConnected && user?.address ? (
                <MobileVersusTokenExchange />
              ) : (
                <Flex direction="column">
                  <Text>you must sign in to trade</Text>
                  <Button
                    color="white"
                    bg="#2562db"
                    _hover={{
                      bg: "#1c4d9e",
                    }}
                    _focus={{}}
                    _active={{}}
                    onClick={() => {
                      privyUser ? connectWallet() : login();
                    }}
                  >
                    {privyUser ? "Connect" : "Sign in"}
                  </Button>
                </Flex>
              )}
            </>
          )}
        </Flex>
      </Flex>
    </>
  );
};
