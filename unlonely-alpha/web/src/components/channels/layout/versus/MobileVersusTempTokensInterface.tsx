import {
  Box,
  Button,
  Flex,
  Spinner,
  Step,
  StepIcon,
  StepIndicator,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Text,
} from "@chakra-ui/react";
import {
  AblyChannelPromise,
  PRESALE_NOTIFICATION_URL_QUERY_PARAM,
} from "../../../../constants";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { TransactionModalTemplate } from "../../../transactions/TransactionModalTemplate";
import { useVersusTempTokenContext } from "../../../../hooks/context/useVersusTempToken";
import { isAddressEqual } from "viem";
import { VersusTempTokenChart } from "./VersusTempTokenChart";
import { MobileVersusTokenExchange } from "../../versus/MobileVersusTokenExchange";

const steps = [{ title: "streamer must select winner" }];

export const MobileVersusTempTokensInterface = ({
  ablyChannel,
  customHeight,
}: {
  ablyChannel?: AblyChannelPromise;
  customHeight?: string;
}) => {
  const router = useRouter();

  const { gameState } = useVersusTempTokenContext();

  const {
    isPreSaleOngoing,
    isGameFinishedModalOpen,
    handleIsGameFinishedModalOpen,
    focusedTokenToTrade,
    tokenA,
    tokenB,
    ownerMustMakeWinningTokenTradeable,
    handleFocusedTokenToTrade,
    isGameOngoing,
  } = gameState;
  const { loadingOnMount } = useVersusTempTokenContext();
  const [presaleWelcomeModalOpen, setPresaleWelcomeModalOpen] = useState(false);

  useEffect(() => {
    if (router.query[PRESALE_NOTIFICATION_URL_QUERY_PARAM]) {
      setPresaleWelcomeModalOpen(true);
      const newPath = router.pathname;
      const newQuery = { ...router.query };
      delete newQuery[PRESALE_NOTIFICATION_URL_QUERY_PARAM];

      router.replace(
        {
          pathname: newPath,
          query: newQuery,
        },
        undefined,
        { shallow: true }
      );
    }
  }, [router]);

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
          isOpen={presaleWelcomeModalOpen}
          handleClose={() => setPresaleWelcomeModalOpen(false)}
          cannotClose={loadingOnMount}
          hideFooter
        >
          {loadingOnMount ? (
            <Flex justifyContent="center">
              <Spinner />
            </Flex>
          ) : isPreSaleOngoing ? (
            <Flex direction="column" gap="10px">
              <Text fontSize="25px" textAlign={"center"}>
                hurray!
              </Text>
              <Text>
                you made it here early enough to claim 1000 tokens. select a
                token to redeem and make sure your wallet is connected before
                time runs out
              </Text>
            </Flex>
          ) : (
            <Flex direction="column" gap="10px">
              <Text fontSize="25px" textAlign={"center"}>
                too late, but...
              </Text>
              <Text>you can still join this VERSUS game!</Text>
              <Text>
                come early next time a token launches to claim your tokens!
              </Text>
            </Flex>
          )}
        </TransactionModalTemplate>
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
            <MobileVersusTokenExchange />
          )}
        </Flex>
      </Flex>
    </>
  );
};
