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
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Line,
  Tooltip,
  Brush,
  ReferenceLine,
} from "recharts";
import { truncateValue } from "../../../utils/tokenDisplayFormatting";
import { useTradeTempTokenState } from "../../../hooks/internal/temp-token/useTradeTempTokenState";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { FaMagnifyingGlassChart, FaPause } from "react-icons/fa6";
import { useInterfaceChartMarkers } from "../../../hooks/internal/temp-token/useInterfaceChartMarkers";
import { useInterfaceChartData } from "../../../hooks/internal/temp-token/useInterfaceChartData";
import {
  blockNumberDaysAgo,
  blockNumberHoursAgo,
} from "../../../hooks/internal/useVibesCheck";
import { useCacheContext } from "../../../hooks/context/useCache";
import { AblyChannelPromise, NULL_ADDRESS } from "../../../constants";
import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";
import { useWindowSize } from "../../../hooks/internal/useWindowSize";
import { useNetworkContext } from "../../../hooks/context/useNetwork";
import { SendRemainingFundsFromCurrentInactiveTokenModal } from "./SendRemainingFundsFromCurrentInactiveTokenModal";
import { TempTokenExchange } from "./TempTokenExchange";
import { TempTokenTimerView } from "./TempTokenTimer";
import { usePublicClient } from "wagmi";
const ZONE_BREADTH = 0.05;
const NUMBER_OF_HOURS_IN_DAY = 24;
const NUMBER_OF_DAYS_IN_MONTH = 30;

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
  const { ethPriceInUsd } = useCacheContext();
  const windowSize = useWindowSize();
  const { network } = useNetworkContext();
  const publicClient = usePublicClient();
  const { matchingChain } = network;
  const {
    channelQueryData,
    realTimeChannelDetails,
    currentActiveTokenAddress,
    currentActiveTokenSymbol,
    currentActiveTokenHasHitTotalSupplyThreshold,
    currentActiveTokenHighestTotalSupply,
    currentActiveTokenTotalSupply,
    currentActiveTokenTotalSupplyThreshold,
    currentTempTokenContract,
    isOwner,
    canPlayToken,
    tempTokenChartTimeIndexes,
    tempTokenLoading,
    currentBlockNumberForTempTokenChart,
    isFailedGameState,
    isSuccessGameModalOpen,
    isFailedGameModalOpen,
    isPermanentGameModalOpen,
    handleIsFailedGameModalOpen,
    handleIsSuccessGameModalOpen,
    handleIsPermanentGameModalOpen,
    handleCanPlayToken,
    onSendRemainingFundsToWinnerEvent,
  } = channel;

  const tradeTempTokenState = useTradeTempTokenState();

  const {
    isChartPaused,
    formattedData,
    pausedDataForAllTime,
    pausedData_1h,
    pausedData_1d,
    timeFilter,
    handleTimeFilter,
    handleIsChartPaused,
  } = useInterfaceChartData({
    chartTimeIndexes: tempTokenChartTimeIndexes,
    txs: tradeTempTokenState.chartTxs,
  });

  const [tempTokenDisclaimerModalOpen, setTempTokenDisclaimerModalOpen] =
    useState<boolean>(false);
  const [
    sendRemainingFundsFromActiveTokenModuleOpen,
    setSendRemainingFundsFromActiveTokenModuleOpen,
  ] = useState<boolean>(false);
  const [ownerNeedsToSendFunds, setOwnerNeedsToSendFunds] =
    useState<boolean>(false);

  const priceOfHighestTotalSupply = useMemo(() => {
    if (currentActiveTokenHighestTotalSupply === BigInt(0)) return 0;
    const n = Number(currentActiveTokenHighestTotalSupply);
    const n_ = Math.max(n - 1, 0);
    const priceForCurrent = Math.floor((n * (n + 1) * (2 * n + 1)) / 6);
    const priceForPrevious = Math.floor((n_ * (n_ + 1) * (2 * n_ + 1)) / 6);
    const newPrice = priceForCurrent - priceForPrevious;
    return newPrice;
  }, [currentActiveTokenHighestTotalSupply]);

  const priceOfHighestTotalSupplyInUsd = useMemo(
    () =>
      ethPriceInUsd === undefined
        ? undefined
        : truncateValue(
            Number(formatUnits(BigInt(priceOfHighestTotalSupply), 18)) *
              Number(ethPriceInUsd),
            4
          ),
    [priceOfHighestTotalSupply, ethPriceInUsd]
  );

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
      ethPriceInUsd === undefined
        ? undefined
        : truncateValue(
            Number(formatUnits(BigInt(priceOfThreshold), 18)) *
              Number(ethPriceInUsd),
            4
          ),
    [priceOfThreshold, ethPriceInUsd]
  );

  const formattedCurrentPrice = useMemo(
    () =>
      formattedData.length > 0
        ? formatUnits(BigInt(formattedData[formattedData.length - 1].price), 18)
        : "0",
    [formattedData]
  );

  const currentPriceInUsd = useMemo(
    () =>
      ethPriceInUsd === undefined
        ? undefined
        : truncateValue(
            Number(formattedCurrentPrice) * Number(ethPriceInUsd),
            4
          ),
    [formattedCurrentPrice, ethPriceInUsd]
  );

  const {
    CustomDot,
    CustomTooltip,
    formatYAxisTick,
    CustomLabel,
    customBrushFormatter,
  } = useInterfaceChartMarkers(tradeTempTokenState.chartTxs, timeFilter);

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
    };
    if (isFailedGameState && isOwner) checkBalanceAfterExpiration();
  }, [currentTempTokenContract, isFailedGameState, publicClient, isOwner]);

  return (
    <>
      {tempTokenLoading || customLoading ? (
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
      ) : currentActiveTokenAddress === NULL_ADDRESS ? (
        <Flex
          direction="column"
          alignItems="center"
          width="100%"
          gap="5px"
          justifyContent={"center"}
        >
          <Text>
            No active token detected for this channel, please try again later
          </Text>
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
          <TransactionModalTemplate
            title="You are joining the token game"
            isOpen={tempTokenDisclaimerModalOpen}
            handleClose={() => setTempTokenDisclaimerModalOpen(false)}
            hideFooter
          >
            <Flex direction="column" gap="10px">
              <Flex direction="column" gap="10px">
                <Text fontFamily={"LoRes15"} fontSize="1.5rem">
                  How it works
                </Text>
                <Flex direction="column" gap="5px">
                  <Text fontSize="12px">
                    Streamer has launched a "30 minute token" (ERC20 on a
                    bonding curve).
                  </Text>
                  <Text fontSize="12px">
                    There is a timer attached to the current game. If the token
                    does not hit the price goal by the time the timer hits 0,
                    this token will end and liquidity will disappear.
                  </Text>
                  <Text fontSize="12px">
                    If token hits the price goal, another 24 hours will be added
                    to the timer.
                  </Text>
                </Flex>
                <Text fontFamily={"LoRes15"} fontSize="1.5rem">
                  Disclaimer
                </Text>
                <Text fontSize="12px">
                  YOU COULD LOSE YOUR FUNDS. Make sure to sell before the token
                  dies.
                </Text>
              </Flex>
              <Flex justifyContent={"space-evenly"} gap="5px">
                <Button
                  onClick={() => {
                    setTempTokenDisclaimerModalOpen(false);
                    handleCanPlayToken(true);
                  }}
                >
                  Continue
                </Button>
                <Button onClick={() => setTempTokenDisclaimerModalOpen(false)}>
                  Exit
                </Button>
              </Flex>
            </Flex>
          </TransactionModalTemplate>
          <TransactionModalTemplate
            title="Token expired!"
            isOpen={isFailedGameModalOpen}
            handleClose={() => handleIsFailedGameModalOpen(false)}
            hideFooter
          >
            <Text>This token couldn't reach the price goal</Text>
            <Flex justifyContent={"space-evenly"} gap="5px">
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
            title="Token survived!"
            isOpen={isSuccessGameModalOpen}
            handleClose={() => handleIsSuccessGameModalOpen(false)}
            hideFooter
          >
            <Text>
              This token reached the price goal and survives another 24 hours!
              Thanks for playing!
            </Text>
            <Flex justifyContent={"space-evenly"} gap="5px">
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
            {isFullChart && <TempTokenTimerView />}
            {!isFullChart && (
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
                <PopoverContent bg="#008d75" border="none" width="100%" p="2px">
                  <PopoverArrow bg="#008d75" />
                  <Text fontSize="12px" textAlign={"center"}>
                    pop out chart in a new window!
                  </Text>
                </PopoverContent>
              </Popover>
            )}
          </Flex>
          {canPlayToken && (
            <Flex gap="5px" alignItems={"center"}>
              <Button
                bg={timeFilter === "1h" ? "#7874c9" : "#403c7d"}
                p={3}
                height="20px"
                _focus={{}}
                _active={{}}
                _hover={{}}
                onClick={() => handleTimeFilter("1h")}
              >
                1h
              </Button>
              <Button
                bg={timeFilter === "1d" ? "#7874c9" : "#403c7d"}
                p={3}
                height="20px"
                _focus={{}}
                _active={{}}
                _hover={{}}
                onClick={() => handleTimeFilter("1d")}
              >
                1d
              </Button>
              <Button
                bg={timeFilter === "all" ? "#7874c9" : "#403c7d"}
                p={3}
                height="20px"
                _focus={{}}
                _active={{}}
                _hover={{}}
                onClick={() => handleTimeFilter("all")}
              >
                all
              </Button>
              <ChakraTooltip
                label="toggle chart zooming, will pause live updates when enabled"
                shouldWrapChildren
                openDelay={300}
              >
                <Button
                  color="#ffffff"
                  bg={isChartPaused ? "rgb(173, 169, 249)" : "#4741c1"}
                  _hover={{
                    transform: "scale(1.15)",
                  }}
                  _focus={{}}
                  _active={{}}
                  p={3}
                  height={"20px"}
                  onClick={() => handleIsChartPaused(!isChartPaused)}
                  boxShadow={
                    isChartPaused
                      ? "0px 0px 25px rgba(173, 169, 249, 0.847)"
                      : undefined
                  }
                >
                  {<FaMagnifyingGlassChart />}
                </Button>
              </ChakraTooltip>
            </Flex>
          )}
          <Flex gap="10px" flex="1" h="100%" direction="column">
            <Flex direction="column" w="100%" position="relative" h="60%">
              {noChannelData && (
                <Text
                  textAlign="center"
                  position="absolute"
                  color="gray"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                >
                  could not fetch channel data
                </Text>
              )}
              {pausedData_1h.length === 0 &&
                timeFilter === "1h" &&
                matchingChain && (
                  <Text
                    textAlign="center"
                    position="absolute"
                    color="gray"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                  >
                    no txs in the past hour
                  </Text>
                )}
              {pausedData_1d.length === 0 &&
                timeFilter === "1d" &&
                matchingChain && (
                  <Text
                    textAlign="center"
                    position="absolute"
                    color="gray"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                  >
                    no txs in the past 24 hours
                  </Text>
                )}
              {formattedData.length === 0 &&
                timeFilter === "all" &&
                matchingChain && (
                  <Text
                    textAlign="center"
                    position="absolute"
                    color="gray"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                  >
                    no txs
                  </Text>
                )}
              {isChartPaused && (
                <Text
                  position="absolute"
                  color="#626262"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  fontSize={"6rem"}
                  fontWeight={"bold"}
                  textAlign={"center"}
                  opacity="0.5"
                >
                  <FaPause />
                </Text>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={
                    isChartPaused
                      ? timeFilter === "all"
                        ? pausedDataForAllTime
                        : timeFilter === "1h"
                        ? pausedData_1h
                        : pausedData_1d
                      : formattedData
                  }
                >
                  <XAxis
                    hide
                    dataKey="blockNumber"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    allowDataOverflow={false}
                  />
                  <YAxis
                    tickFormatter={formatYAxisTick}
                    domain={
                      currentActiveTokenTotalSupplyThreshold >
                      currentActiveTokenTotalSupply
                        ? ["dataMin", priceOfThreshold * (1 + ZONE_BREADTH)]
                        : ["dataMin", "dataMax"]
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {timeFilter === "all" && (
                    <>
                      {Array.from(tempTokenChartTimeIndexes.keys())
                        .filter((i) => i.includes("d"))
                        .map((key) => {
                          return (
                            <ReferenceLine
                              key={key}
                              strokeDasharray="3 3"
                              x={
                                tempTokenChartTimeIndexes.get(key)
                                  ?.blockNumber as number
                              }
                              stroke="rgb(0, 211, 193)"
                              label={<CustomLabel value={`~${key}`} />}
                            />
                          );
                        })}
                      {[...Array(NUMBER_OF_DAYS_IN_MONTH).keys()]
                        .map((i) => i + 1)
                        .filter(
                          (d) =>
                            tempTokenChartTimeIndexes.get(`${d}d`)
                              ?.blockNumber === undefined
                        )
                        .map((key) => {
                          return (
                            <ReferenceLine
                              key={key}
                              strokeDasharray="1 1"
                              x={Number(
                                blockNumberDaysAgo(
                                  key,
                                  currentBlockNumberForTempTokenChart
                                )
                              )}
                              stroke="rgba(0, 211, 193, 0.2)"
                            />
                          );
                        })}
                    </>
                  )}
                  {timeFilter === "1d" && (
                    <>
                      {Array.from(tempTokenChartTimeIndexes.keys())
                        .filter((i) => i.includes("h"))
                        .map((key) => {
                          return (
                            <ReferenceLine
                              key={key}
                              strokeDasharray="3 3"
                              x={
                                tempTokenChartTimeIndexes.get(key)
                                  ?.blockNumber as number
                              }
                              stroke="#00d3c1"
                              label={<CustomLabel value={`~${key}`} />}
                            />
                          );
                        })}
                      {[...Array(NUMBER_OF_HOURS_IN_DAY).keys()]
                        .map((i) => i + 1)
                        .filter(
                          (h) =>
                            tempTokenChartTimeIndexes.get(`${h}h`)
                              ?.blockNumber === undefined
                        )
                        .map((key) => {
                          return (
                            <ReferenceLine
                              key={key}
                              strokeDasharray="1 1"
                              x={Number(
                                blockNumberHoursAgo(
                                  key,
                                  currentBlockNumberForTempTokenChart
                                )
                              )}
                              stroke="rgba(0, 211, 193, 0.2)"
                            />
                          );
                        })}
                    </>
                  )}
                  <ReferenceLine
                    y={priceOfThreshold}
                    stroke="#ff0000"
                    strokeDasharray="3 3"
                    label={
                      <CustomLabel value={`goal: $${priceOfThresholdInUsd}`} />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={
                      currentActiveTokenHasHitTotalSupplyThreshold
                        ? "#ffd014"
                        : "#8884d8"
                    }
                    strokeWidth={2}
                    animationDuration={200}
                    dot={<CustomDot />}
                  />
                  {isChartPaused && (
                    <Brush
                      dataKey="blockNumber"
                      height={30}
                      fill={isChartPaused ? "#2c2970" : "transparent"}
                      stroke={isChartPaused ? "#ada9f9" : "#5e5e6a"}
                      tickFormatter={(tick) => customBrushFormatter(tick)}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Flex>
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
                            />
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
            {canPlayToken && (
              <Flex
                direction="column"
                justifyContent={"space-between"}
                gap="5px"
              >
                <Flex gap="10px" justifyContent={"space-evenly"}>
                  <Flex direction="column">
                    <Text fontSize={"12px"} color="#c6c3fc">
                      Current Price
                    </Text>
                    {currentPriceInUsd !== undefined ? (
                      <>
                        <Text color="#f3d584" fontSize="2rem">
                          ${currentPriceInUsd}
                        </Text>
                        <Text
                          whiteSpace={"nowrap"}
                          opacity="0.3"
                          fontSize="14px"
                        >
                          {formattedCurrentPrice} ETH
                        </Text>
                      </>
                    ) : (
                      <Text whiteSpace={"nowrap"} fontSize="1rem">
                        {formattedCurrentPrice} ETH
                      </Text>
                    )}
                  </Flex>
                  <Flex direction="column">
                    <Text fontSize={"12px"} color="#c6c3fc">
                      Highest Price Reached
                    </Text>
                    {priceOfHighestTotalSupplyInUsd !== undefined ? (
                      <>
                        <Text color="#f3d584" fontSize="2rem">
                          ${priceOfHighestTotalSupplyInUsd}
                        </Text>
                        <Text
                          whiteSpace={"nowrap"}
                          opacity="0.3"
                          fontSize="14px"
                        >
                          {formatUnits(BigInt(priceOfHighestTotalSupply), 18)}{" "}
                          ETH
                        </Text>
                      </>
                    ) : (
                      <Text whiteSpace={"nowrap"} fontSize="1rem">
                        {formatUnits(BigInt(priceOfHighestTotalSupply), 18)} ETH
                      </Text>
                    )}
                  </Flex>
                  <Flex direction="column">
                    {currentActiveTokenHasHitTotalSupplyThreshold ? (
                      <Text fontSize={"12px"} color="#ffd014">
                        Target Price Reached
                      </Text>
                    ) : (
                      <Text fontSize={"12px"} color="#c6c3fc">
                        tokens to reach goal
                      </Text>
                    )}
                    {!currentActiveTokenHasHitTotalSupplyThreshold && (
                      <>
                        <Text color="#f3d584" fontSize="2rem">
                          {String(
                            currentActiveTokenTotalSupplyThreshold -
                              currentActiveTokenTotalSupply
                          )}
                        </Text>
                      </>
                    )}
                  </Flex>
                </Flex>
                <TempTokenExchange tradeTempTokenState={tradeTempTokenState} />
              </Flex>
            )}
          </Flex>
        </Flex>
      )}
    </>
  );
};
