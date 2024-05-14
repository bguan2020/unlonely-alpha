import { useState, useMemo, useEffect } from "react";
import { formatUnits } from "viem";
import {
  Flex,
  Text,
  Image,
  Spinner,
  Button,
  Tooltip as ChakraTooltip,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  IconButton,
} from "@chakra-ui/react";
import { truncateValue } from "../../../utils/tokenDisplayFormatting";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { FaMagnifyingGlassChart } from "react-icons/fa6";
import { useInterfaceChartData } from "../../../hooks/internal/temp-token/ui/useInterfaceChartData";

import { useCacheContext } from "../../../hooks/context/useCache";
import { AblyChannelPromise, NULL_ADDRESS } from "../../../constants";
import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";
import { useWindowSize } from "../../../hooks/internal/useWindowSize";
import { SendRemainingFundsFromCurrentInactiveTokenModal } from "./SendRemainingFundsFromCurrentInactiveTokenModal";
import { SingleTempTokenTimerView } from "./TempTokenTimer";
import { usePublicClient } from "wagmi";
import { TempTokenDisclaimerModal } from "./TempTokenDisclaimerModal";
import { useOwnerUpdateTotalSupplyThresholdState } from "../../../hooks/internal/temp-token/write/useOwnerUpdateTotalSupplyThresholdState";
import { useTempTokenContext } from "../../../hooks/context/useTempToken";
import { TempTokenChart } from "../layout/temptoken/TempTokenChart";

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
  const { channel } = useChannelContext();
  const { tempToken } = useTempTokenContext();
  const { ethPriceInUsd } = useCacheContext();
  const windowSize = useWindowSize();
  const publicClient = usePublicClient();
  const { channelQueryData, realTimeChannelDetails, isOwner } = channel;
  const {
    currentActiveTokenAddress,
    currentActiveTokenSymbol,
    currentActiveTokenHasHitTotalSupplyThreshold,
    currentActiveTokenTotalSupplyThreshold,
    currentTempTokenContract,
    canPlayToken,
    tempTokenChartTimeIndexes,
    initialTempTokenLoading,
    isFailedGameState,
    isSuccessGameModalOpen,
    isFailedGameModalOpen,
    isPermanentGameModalOpen,
    tempTokenTxs,
    handleIsFailedGameModalOpen,
    handleIsSuccessGameModalOpen,
    handleIsPermanentGameModalOpen,
    handleCanPlayToken,
    onSendRemainingFundsToWinnerEvent,
  } = tempToken;

  const {
    callSetTotalSupplyThresholdForTokens,
    loading: setTotalSupplyThresholdForTokensLoading,
  } = useOwnerUpdateTotalSupplyThresholdState();

  const interfaceChartData = useInterfaceChartData({
    chartTimeIndexes: tempTokenChartTimeIndexes,
    txs: tempTokenTxs,
  });

  const [tempTokenDisclaimerModalOpen, setTempTokenDisclaimerModalOpen] =
    useState<boolean>(false);
  const [
    sendRemainingFundsFromActiveTokenModuleOpen,
    setSendRemainingFundsFromActiveTokenModuleOpen,
  ] = useState<boolean>(false);
  const [ownerNeedsToSendFunds, setOwnerNeedsToSendFunds] =
    useState<boolean>(false);
  const [remainingFundsToSend, setRemainingFundsToSend] = useState<bigint>(
    BigInt(0)
  );
  const [thresholdOn, setThresholdOn] = useState(true);

  const priceOfThreshold = useMemo(() => {
    if (currentActiveTokenTotalSupplyThreshold === BigInt(0)) return 0;
    const n = Number(currentActiveTokenTotalSupplyThreshold);
    const n_ = Math.max(n - 1, 0);
    const priceForCurrent = Math.floor((n * (n + 1) * (2 * n + 1)) / 6);
    const priceForPrevious = Math.floor((n_ * (n_ + 1) * (2 * n_ + 1)) / 6);
    const newPrice = priceForCurrent - priceForPrevious;
    return newPrice;
  }, [currentActiveTokenTotalSupplyThreshold]);

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
      `${window.location.origin}/token/${channelQueryData?.slug}`,
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

  return (
    <>
      {currentActiveTokenAddress === NULL_ADDRESS ? (
        <Flex
          direction="column"
          alignItems="center"
          width="100%"
          gap="5px"
          justifyContent={"center"}
        >
          <Text>No active token detected for this channel yet</Text>
          <Spinner size="md" />
        </Flex>
      ) : initialTempTokenLoading || customLoading ? (
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
          direction="column"
          justifyContent={"space-between"}
          width="100%"
          p={"10px"}
          h={customHeight ?? "100%"}
        >
          <TempTokenDisclaimerModal
            isOpen={tempTokenDisclaimerModalOpen}
            handleClose={() => setTempTokenDisclaimerModalOpen(false)}
            priceOfThresholdInUsd={priceOfThresholdInUsd}
          />
          <TransactionModalTemplate
            title="Token didn't make it this time :("
            isOpen={isFailedGameModalOpen}
            handleClose={() => handleIsFailedGameModalOpen(false)}
            bg={"#18162F"}
            hideFooter
          >
            <Text>
              {
                "This token couldn't reach the price goal. All remaining liquidity will be sent to the streamer. Better luck next time!"
              }
            </Text>
            <Flex justifyContent={"space-evenly"} gap="5px" my="15px" p={4}>
              <Button
                onClick={() => {
                  handleIsFailedGameModalOpen(false);
                }}
              >
                Continue
              </Button>
            </Flex>
          </TransactionModalTemplate>
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
              ${currentActiveTokenSymbol}
            </Text>
            {isFullChart && <SingleTempTokenTimerView disableChatbot={true} />}
            {!isFullChart && !isOwner && !canPlayToken && (
              <SingleTempTokenTimerView disableChatbot={true} fontSize={20} />
            )}
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
          {canPlayToken && (
            <Flex gap="5px" alignItems={"center"}>
              <Button
                bg={
                  interfaceChartData.timeFilter === "1h" ? "#7874c9" : "#403c7d"
                }
                color="#c6c3fc"
                p={3}
                height="20px"
                _focus={{}}
                _active={{}}
                _hover={{}}
                onClick={() => interfaceChartData.handleTimeFilter("1h")}
              >
                1h
              </Button>
              <Button
                bg={
                  interfaceChartData.timeFilter === "1d" ? "#7874c9" : "#403c7d"
                }
                color="#c6c3fc"
                p={3}
                height="20px"
                _focus={{}}
                _active={{}}
                _hover={{}}
                onClick={() => interfaceChartData.handleTimeFilter("1d")}
              >
                1d
              </Button>
              <Button
                bg={
                  interfaceChartData.timeFilter === "all"
                    ? "#7874c9"
                    : "#403c7d"
                }
                color="#c6c3fc"
                p={3}
                height="20px"
                _focus={{}}
                _active={{}}
                _hover={{}}
                onClick={() => interfaceChartData.handleTimeFilter("all")}
              >
                all
              </Button>
              <Button
                bg={thresholdOn ? "#00d3c1" : "#077158"}
                color="#ffffff"
                p={3}
                height={"20px"}
                _focus={{}}
                _active={{}}
                _hover={{}}
                onClick={() => setThresholdOn((prev) => !prev)}
                boxShadow={
                  thresholdOn
                    ? "0px 0px 16px rgba(53, 234, 95, 0.4)"
                    : undefined
                }
              >
                goal
              </Button>
              <ChakraTooltip
                label="toggle chart zooming, will pause live updates when enabled"
                shouldWrapChildren
                openDelay={300}
              >
                <Button
                  color="#ffffff"
                  bg={
                    interfaceChartData.isChartPaused
                      ? "rgb(173, 169, 249)"
                      : "#4741c1"
                  }
                  _hover={{
                    transform: "scale(1.15)",
                  }}
                  _focus={{}}
                  _active={{}}
                  p={3}
                  height={"20px"}
                  onClick={() =>
                    interfaceChartData.handleIsChartPaused(
                      !interfaceChartData.isChartPaused
                    )
                  }
                  boxShadow={
                    interfaceChartData.isChartPaused
                      ? "0px 0px 25px rgba(173, 169, 249, 0.847)"
                      : undefined
                  }
                >
                  <FaMagnifyingGlassChart />
                </Button>
              </ChakraTooltip>
              {isOwner && currentActiveTokenHasHitTotalSupplyThreshold && (
                <ChakraTooltip
                  label="increase the price goal"
                  shouldWrapChildren
                  openDelay={300}
                >
                  <Flex gap="2px" bg="#fdbf2f" px="3px" borderRadius="5px">
                    <Button
                      color="#ffffff"
                      bg={"rgba(0, 0, 0, 0.7)"}
                      _hover={{
                        bg: "rgba(0, 0, 0, 0.5)",
                      }}
                      _focus={{}}
                      _active={{}}
                      p={3}
                      height={"20px"}
                      onClick={() =>
                        callSetTotalSupplyThresholdForTokens(
                          BigInt(
                            Math.floor(
                              Number(currentActiveTokenTotalSupplyThreshold) *
                                1.05
                            )
                          )
                        )
                      }
                      isDisabled={
                        setTotalSupplyThresholdForTokensLoading ||
                        BigInt(
                          Math.floor(
                            Number(currentActiveTokenTotalSupplyThreshold) *
                              1.05
                          )
                        ) === currentActiveTokenTotalSupplyThreshold
                      }
                    >
                      +5%
                    </Button>
                    <Button
                      color="#ffffff"
                      bg={"rgba(0, 0, 0, 0.7)"}
                      _hover={{
                        bg: "rgba(0, 0, 0, 0.5)",
                      }}
                      _focus={{}}
                      _active={{}}
                      p={3}
                      height={"20px"}
                      onClick={() =>
                        callSetTotalSupplyThresholdForTokens(
                          BigInt(
                            Math.floor(
                              Number(currentActiveTokenTotalSupplyThreshold) *
                                1.5
                            )
                          )
                        )
                      }
                      isDisabled={setTotalSupplyThresholdForTokensLoading}
                    >
                      +50%
                    </Button>
                  </Flex>
                </ChakraTooltip>
              )}
            </Flex>
          )}
          <Flex gap="10px" flex="1" h="100%" direction="column">
            <TempTokenChart
              interfaceChartData={interfaceChartData}
              thresholdOn={thresholdOn}
              priceOfThresholdInUsd={priceOfThresholdInUsd}
              priceOfThreshold={priceOfThreshold}
              noChannelData={noChannelData}
              isFullChart={isFullChart}
            />
            {!canPlayToken && (
              <>
                {isFailedGameState ? (
                  <>
                    {isOwner ? (
                      <>
                        {ownerNeedsToSendFunds ? (
                          <>
                            <SendRemainingFundsFromCurrentInactiveTokenModal
                              isOpen={
                                sendRemainingFundsFromActiveTokenModuleOpen
                              }
                              title="Send remaining funds to winner"
                              handleClose={() =>
                                setSendRemainingFundsFromActiveTokenModuleOpen(
                                  false
                                )
                              }
                              callbackOnTxSuccess={() => {
                                setOwnerNeedsToSendFunds(false);
                                setRemainingFundsToSend(BigInt(0));
                                setSendRemainingFundsFromActiveTokenModuleOpen(
                                  false
                                );
                              }}
                            />
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
                                setSendRemainingFundsFromActiveTokenModuleOpen(
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
                            onClick={() =>
                              onSendRemainingFundsToWinnerEvent(
                                currentTempTokenContract.address as `0x${string}`,
                                true
                              )
                            }
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
                    {realTimeChannelDetails.isLive ? (
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
