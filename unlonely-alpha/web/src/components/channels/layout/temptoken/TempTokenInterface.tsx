import { useState, useMemo, useEffect } from "react";
import { formatUnits, isAddress } from "viem";
import {
  Flex,
  Text,
  Image,
  Spinner,
  Button,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  IconButton,
} from "@chakra-ui/react";
import { truncateValue } from "../../../../utils/tokenDisplayFormatting";
import { useChannelContext } from "../../../../hooks/context/useChannel";
import { useInterfaceChartData } from "../../../../hooks/internal/temp-token/ui/useInterfaceChartData";

import { useCacheContext } from "../../../../hooks/context/useCache";
import { AblyChannelPromise, NULL_ADDRESS } from "../../../../constants";
import { TransactionModalTemplate } from "../../../transactions/TransactionModalTemplate";
import { useWindowSize } from "../../../../hooks/internal/useWindowSize";
import { usePublicClient } from "wagmi";
import { TempTokenDisclaimerModal } from "../../temp/TempTokenDisclaimerModal";
import { useTempTokenContext } from "../../../../hooks/context/useTempToken";
import { TempTokenChart } from "./TempTokenChart";
import { TempTokenCreationModal } from "../../temp/TempTokenCreationModal";
import { SendRemainingFundsFromTokenModal } from "../../temp/SendRemainingFundsFromTokenModal";
import { SingleTempTokenTimerView } from "../../temp/TempTokenTimerView";
import useUserAgent from "../../../../hooks/internal/useUserAgent";
import { bondingCurve } from "../../../../utils/contract";
import { tempTokenMinBaseTokenPrices } from "../../../../constants/tempTokenMinBaseTokenPrices";

export const TempTokenInterface = ({
  customHeight,
  isFullChart,
  ablyChannel,
  customLoading,
  noChannelData,
}: {
  customHeight?: string;
  isFullChart?: boolean;
  ablyChannel?: AblyChannelPromise;
  customLoading?: boolean;
  noChannelData?: boolean;
}) => {
  const { isStandalone } = useUserAgent();
  const { channel } = useChannelContext();
  const { tempToken } = useTempTokenContext();
  const { ethPriceInUsd } = useCacheContext();
  const windowSize = useWindowSize();
  const publicClient = usePublicClient();
  const { channelQueryData, realTimeChannelDetails, isOwner } = channel;
  const {
    gameState,
    tempTokenChartTimeIndexes,
    initialTempTokenLoading,
    tempTokenTxs,
    currentTempTokenContract,
    lastInactiveTempTokenContract,
    onSendRemainingFundsToWinnerEvent,
  } = tempToken;
  const {
    currentActiveTokenEndTimestamp,
    currentActiveTokenAddress,
    currentActiveTokenSymbol,
    currentActiveTokenTotalSupplyThreshold,
    currentActiveTokenFactoryAddress,
    canPlayToken,
    isFailedGameState,
    isSuccessGameModalOpen,
    isPermanentGameModalOpen,
    lastInactiveTokenAddress,
    lastInactiveTokenBalance,
    lastInactiveTokenSymbol,
    handleIsGameFailed,
    handleIsSuccessGameModalOpen,
    handleIsPermanentGameModalOpen,
    handleCanPlayToken,
  } = gameState;

  const interfaceChartData = useInterfaceChartData({
    chartTimeIndexes: tempTokenChartTimeIndexes,
    txs: tempTokenTxs,
  });

  const [createTokenModalOpen, setCreateTokenModalOpen] = useState(false);
  const [tempTokenDisclaimerModalOpen, setTempTokenDisclaimerModalOpen] =
    useState<boolean>(false);
  const [
    sendRemainingFundsFromActiveTokenModalOpen,
    setSendRemainingFundsFromActiveTokenModalOpen,
  ] = useState<boolean>(false);
  const [ownerNeedsToSendFunds, setOwnerNeedsToSendFunds] =
    useState<boolean>(false);
  const [remainingFundsToSend, setRemainingFundsToSend] = useState<bigint>(
    BigInt(0)
  );

  const priceOfThreshold = useMemo(() => {
    if (currentActiveTokenTotalSupplyThreshold === BigInt(0)) return 0;

    const n = currentActiveTokenTotalSupplyThreshold;
    const n_ = n > BigInt(0) ? n - BigInt(1) : BigInt(0);
    const priceForCurrent = BigInt(Math.floor(bondingCurve(Number(n))));
    const priceForPrevious = BigInt(Math.floor(bondingCurve(Number(n_))));
    const basePrice =
      tempTokenMinBaseTokenPrices[
        `${currentActiveTokenFactoryAddress.toLowerCase()}:${
          currentTempTokenContract.chainId
        }`
      ] ?? BigInt(0);
    const newPrice = priceForCurrent - priceForPrevious + basePrice;
    return Number(newPrice);
  }, [
    currentActiveTokenTotalSupplyThreshold,
    currentActiveTokenFactoryAddress,
    currentTempTokenContract,
  ]);

  const priceOfThresholdInUsd = useMemo(
    () =>
      truncateValue(
        Number(formatUnits(BigInt(priceOfThreshold), 18)) *
          Number(ethPriceInUsd),
        4
      ),
    [priceOfThreshold, ethPriceInUsd]
  );

  const openTokenPopout = () => {
    if (!channelQueryData) return;
    const windowFeatures = `width=${windowSize[0] + 100},height=${
      windowSize[1] + 100
    },menubar=yes,toolbar=yes`;
    window.open(
      `${window.location.origin}/temptoken/${channelQueryData?.slug}`,
      "_blank",
      windowFeatures
    );
  };

  useEffect(() => {
    const checkBalanceAfterExpiration = async () => {
      const balance = await publicClient.readContract({
        address: currentTempTokenContract.address as `0x${string}`,
        abi: currentTempTokenContract.abi,
        functionName: "getBalance",
        args: [],
      });
      // if balance is greater then 0, streamer needs to send remaining funds to winner,
      // else streamer can continue creating a new token
      setOwnerNeedsToSendFunds(BigInt(String(balance)) > BigInt(0));
      setRemainingFundsToSend(BigInt(String(balance)));
    };
    if (isFailedGameState && isOwner) checkBalanceAfterExpiration();
  }, [currentTempTokenContract, isFailedGameState, publicClient, isOwner]);

  // if is viewer and game had just finished, remove current token info
  useEffect(() => {
    if (
      !isOwner &&
      isFailedGameState &&
      !canPlayToken &&
      isAddress(currentTempTokenContract.address as `0x${string}`)
    ) {
      onSendRemainingFundsToWinnerEvent(
        currentTempTokenContract.address as `0x${string}`,
        true
      );
      handleIsGameFailed(false);
    }
  }, [isOwner, isFailedGameState, canPlayToken, currentTempTokenContract]);

  return (
    <>
      {currentActiveTokenAddress === NULL_ADDRESS && !isOwner ? (
        <Flex
          direction="column"
          alignItems="center"
          width="100%"
          gap="5px"
          justifyContent={"center"}
        >
          <Text>No active token detected for this channel yet</Text>
        </Flex>
      ) : (initialTempTokenLoading || customLoading) &&
        currentActiveTokenAddress !== NULL_ADDRESS ? (
        <Flex
          direction="column"
          alignItems="center"
          width="100%"
          gap="5px"
          justifyContent={"center"}
        >
          <Text>loading Temp Token chart</Text>
          <Spinner size="md" />
        </Flex>
      ) : (
        <Flex
          direction={"column"}
          justifyContent={"space-between"}
          width="100%"
          gap={"5px"}
          h={customHeight ?? "100%"}
          p="10px"
        >
          {
            // have to make sure this modal only appears when no current token
          }
          {currentActiveTokenAddress === NULL_ADDRESS && (
            <TempTokenCreationModal
              title="Create Temp Token"
              isOpen={createTokenModalOpen}
              handleClose={() => setCreateTokenModalOpen(false)}
            />
          )}
          <TempTokenDisclaimerModal
            isOpen={tempTokenDisclaimerModalOpen}
            handleClose={() => setTempTokenDisclaimerModalOpen(false)}
            priceOfThresholdInUsd={priceOfThresholdInUsd}
          />
          <SendRemainingFundsFromTokenModal
            tempTokenContract={
              ownerNeedsToSendFunds
                ? currentTempTokenContract
                : lastInactiveTempTokenContract
            }
            isOpen={sendRemainingFundsFromActiveTokenModalOpen}
            title="Send remaining funds to winner"
            handleClose={() =>
              setSendRemainingFundsFromActiveTokenModalOpen(false)
            }
            callbackOnTxSuccess={() => {
              setOwnerNeedsToSendFunds(false);
              setRemainingFundsToSend(BigInt(0));
              setSendRemainingFundsFromActiveTokenModalOpen(false);
              handleIsGameFailed(false);
            }}
          />
          <TransactionModalTemplate
            title="Success - token lives to see another day"
            isOpen={isSuccessGameModalOpen}
            handleClose={() => handleIsSuccessGameModalOpen(false)}
            bg={"#18162F"}
            hideFooter
          >
            <Text>
              This token reached today's price goal and will survive another 24
              hours! Make sure to come back when the streamer goes live again
              tomorrow to keep the token alive.
            </Text>
            <Flex justifyContent={"space-evenly"} gap="5px" my="15px" p={4}>
              <Button
                onClick={() => {
                  handleIsSuccessGameModalOpen(false);
                }}
              >
                Continue
              </Button>
            </Flex>
          </TransactionModalTemplate>
          <TransactionModalTemplate
            title="Congratulations! This token is now tradable!"
            isOpen={isPermanentGameModalOpen}
            handleClose={() => handleIsPermanentGameModalOpen(false)}
            bg={"#18162F"}
            hideFooter
          >
            <Text>This token will now be tradable from now on by itself</Text>
            <Flex justifyContent={"space-evenly"} gap="5px">
              <Button
                onClick={() => {
                  handleIsPermanentGameModalOpen(false);
                }}
              >
                Continue
              </Button>
            </Flex>
          </TransactionModalTemplate>
          <Flex justifyContent={"space-between"} alignItems={"center"}>
            <Text fontSize={"20px"} color="#c6c3fc" fontWeight="bold">
              ${currentActiveTokenSymbol || lastInactiveTokenSymbol}
            </Text>
            {!isFullChart && (
              <Flex>
                {canPlayToken && (
                  <Popover trigger="hover" placement="top" openDelay={500}>
                    <PopoverTrigger>
                      <IconButton
                        aria-label="close"
                        _focus={{}}
                        _hover={{ transform: "scale(1.15)" }}
                        _active={{ transform: "scale(1.3)" }}
                        bg="transparent"
                        icon={
                          <Image
                            alt="close"
                            src="/svg/close.svg"
                            width="20px"
                          />
                        }
                        onClick={() => {
                          interfaceChartData.handleIsChartPaused(false);
                          handleCanPlayToken(false);
                        }}
                      />
                    </PopoverTrigger>
                    <PopoverContent
                      bg="#8d3b00"
                      border="none"
                      width="100%"
                      p="2px"
                    >
                      <PopoverArrow bg="#8d3b00" />
                      <Text fontSize="12px" textAlign={"center"}>
                        stop playing
                      </Text>
                    </PopoverContent>
                  </Popover>
                )}
                <Popover trigger="hover" placement="top" openDelay={500}>
                  <PopoverTrigger>
                    <IconButton
                      onClick={openTokenPopout}
                      aria-label="token-popout"
                      _focus={{}}
                      _hover={{ transform: "scale(1.15)" }}
                      _active={{ transform: "scale(1.3)" }}
                      icon={<Image src="/svg/pop-out.svg" height={"20px"} />}
                      bg="transparent"
                      minWidth="auto"
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    bg="#008d75"
                    border="none"
                    width="100%"
                    p="2px"
                  >
                    <PopoverArrow bg="#008d75" />
                    <Text fontSize="12px" textAlign={"center"}>
                      pop out chart in a new window!
                    </Text>
                  </PopoverContent>
                </Popover>
              </Flex>
            )}
          </Flex>
          <Flex justifyContent={"space-between"} alignItems={"center"}>
            {isFullChart && !isStandalone && (
              <SingleTempTokenTimerView disableChatbot={true} />
            )}
            {!isFullChart && !isOwner && !canPlayToken && !isStandalone && (
              <SingleTempTokenTimerView disableChatbot={true} fontSize={20} />
            )}
          </Flex>
          <Flex gap="10px" flex="1" h="100%" direction="column">
            {currentActiveTokenAddress !== NULL_ADDRESS && (
              <TempTokenChart
                interfaceChartData={interfaceChartData}
                priceOfThresholdInUsd={priceOfThresholdInUsd}
                priceOfThreshold={priceOfThreshold}
                noChannelData={noChannelData}
                customChartHeightInPx={
                  !canPlayToken && (!isFullChart || isStandalone)
                    ? 80
                    : undefined
                }
                isFullChart={isFullChart}
              />
            )}
            {!canPlayToken && (
              <>
                {isFailedGameState ? (
                  <>
                    {isOwner ? (
                      <>
                        {ownerNeedsToSendFunds ? (
                          <>
                            <Text>
                              Remaining ETH liquidity:{" "}
                              {truncateValue(
                                formatUnits(remainingFundsToSend, 18),
                                4
                              )}
                            </Text>
                            <Button
                              _focus={{}}
                              _active={{}}
                              _hover={{}}
                              bg="#02b263"
                              h="30%"
                              onClick={() =>
                                setSendRemainingFundsFromActiveTokenModalOpen(
                                  true
                                )
                              }
                            >
                              <Text color="white">send funds</Text>
                            </Button>
                          </>
                        ) : (
                          <Button
                            _focus={{}}
                            _active={{}}
                            _hover={{}}
                            bg="#02b263"
                            h="30%"
                            onClick={() => {
                              onSendRemainingFundsToWinnerEvent(
                                currentTempTokenContract.address as `0x${string}`,
                                true
                              );
                              handleIsGameFailed(false);
                            }}
                          >
                            <Text color="white">return to start</Text>
                          </Button>
                        )}
                      </>
                    ) : (
                      <Text>Time's up!</Text>
                    )}
                  </>
                ) : (
                  <>
                    {isOwner && !currentActiveTokenEndTimestamp ? (
                      <>
                        {lastInactiveTokenAddress === NULL_ADDRESS &&
                        lastInactiveTokenBalance === BigInt(0) ? (
                          <Button onClick={() => setCreateTokenModalOpen(true)}>
                            create temp token
                          </Button>
                        ) : (
                          <>
                            <Text>
                              Remaining ETH liquidity:{" "}
                              {truncateValue(
                                formatUnits(lastInactiveTokenBalance, 18),
                                4
                              )}
                            </Text>
                            <Button
                              _focus={{}}
                              _active={{}}
                              _hover={{}}
                              bg="#02b263"
                              h="30%"
                              onClick={() =>
                                setSendRemainingFundsFromActiveTokenModalOpen(
                                  true
                                )
                              }
                            >
                              <Text color="white">send funds</Text>
                            </Button>
                          </>
                        )}
                      </>
                    ) : realTimeChannelDetails.isLive ? (
                      <Button
                        _focus={{}}
                        _active={{}}
                        _hover={{}}
                        bg="#02b263"
                        h="30%"
                        onClick={() => setTempTokenDisclaimerModalOpen(true)}
                      >
                        <Text color="white">PLAY NOW</Text>
                      </Button>
                    ) : (
                      <Text>
                        Cannot play when stream is offline, please refresh and
                        try again
                      </Text>
                    )}
                  </>
                )}
              </>
            )}
          </Flex>
        </Flex>
      )}
    </>
  );
};
