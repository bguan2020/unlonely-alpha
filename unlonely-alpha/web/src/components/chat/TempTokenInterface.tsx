import { useState, useEffect, useMemo } from "react";
import { decodeEventLog, formatUnits, isAddress } from "viem";
import {
  Flex,
  Text,
  Image,
  Spinner,
  Button,
  Tooltip as ChakraTooltip,
  Input,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  IconButton,
  useToast,
  Box,
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
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { useTradeTempTokenState } from "../../hooks/internal/temp-token/useTradeTempTokenState";
import { useChannelContext } from "../../hooks/context/useChannel";
import { formatIncompleteNumber } from "../../utils/validation/input";
import { FaMagnifyingGlassChart, FaPause } from "react-icons/fa6";
import { useInterfaceChartMarkers } from "../../hooks/internal/temp-token/useInterfaceChartMarkers";
import { useInterfaceChartData } from "../../hooks/internal/temp-token/useInterfaceChartData";
import {
  blockNumberDaysAgo,
  blockNumberHoursAgo,
} from "../../hooks/internal/useVibesCheck";
import { useCacheContext } from "../../hooks/context/useCache";
import { AblyChannelPromise, NULL_ADDRESS } from "../../constants";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";
import { useWindowSize } from "../../hooks/internal/useWindowSize";
import { useNetworkContext } from "../../hooks/context/useNetwork";
import Link from "next/link";
import { useSendRemainingFundsToWinnerAfterTokenExpiration } from "../../hooks/contracts/useTempTokenV1";

const ZONE_BREADTH = 0.05;
const NUMBER_OF_HOURS_IN_DAY = 24;
const NUMBER_OF_DAYS_IN_MONTH = 30;

export const TempTokenInterface = ({
  canPlayToken,
  handleCanPlayToken,
  customHeight,
  isFullChart,
  ablyChannel,
  customLoading,
  noChannelData,
}: {
  canPlayToken: boolean;
  handleCanPlayToken: (canPlay: boolean) => void;
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
  const { matchingChain } = network;
  const {
    channelQueryData,
    realTimeChannelDetails,
    durationLeftForTempToken,
    currentActiveTokenAddress,
    currentActiveTokenSymbol,
    currentActiveTokenHasHitTotalSupplyThreshold,
    currentActiveTokenHighestTotalSupply,
    currentActiveTokenTotalSupply,
    currentActiveTokenTotalSupplyThreshold,
    isOwner,
    tempTokenChartTimeIndexes,
    tempTokenLoading,
    currentBlockNumberForTempTokenChart,
    userTempTokenBalance,
    handleIsGameFailed,
    handleIsFailedGameModalOpen,
  } = channel;

  const {
    chartTxs,
    amount,
    handleAmount,
    handleAmountDirectly,
    mint,
    burn,
    errorMessage,
    mintCostAfterFees,
    mintCostAfterFeesLoading,
    burnProceedsAfterFees,
    burnProceedsAfterFeesLoading,
  } = useTradeTempTokenState();

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
    txs: chartTxs,
  });

  const [tempTokenDisclaimerModalOpen, setTempTokenDisclaimerModalOpen] =
    useState<boolean>(false);
  const [
    sendRemainingFundsFromActiveTokenModuleOpen,
    setSendRemainingFundsFromActiveTokenModuleOpen,
  ] = useState<boolean>(false);

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
  } = useInterfaceChartMarkers(chartTxs, timeFilter);

  useEffect(() => {
    if (durationLeftForTempToken === undefined) {
      handleCanPlayToken(false);
      handleIsGameFailed(true);
      handleIsFailedGameModalOpen(true);
    }
  }, [durationLeftForTempToken]);

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
            <Text>Rules rules rules</Text>
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
          </TransactionModalTemplate>
          <Flex justifyContent={"space-between"} alignItems={"center"}>
            <Text fontSize={"20px"} color="#c6c3fc" fontWeight="bold">
              ${currentActiveTokenSymbol}
            </Text>
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
            <Flex direction="column" w="100%" position="relative" h="70%">
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
                    stroke={"#8884d8"}
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
                {realTimeChannelDetails.isLive ? (
                  <>
                    {durationLeftForTempToken === undefined ? (
                      <>
                        {isOwner ? (
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
                          <Text>Time's up!</Text>
                        )}
                      </>
                    ) : (
                      <Button
                        _focus={{}}
                        _active={{}}
                        _hover={{}}
                        bg="#02b263"
                        h="30%"
                        isDisabled={durationLeftForTempToken === undefined}
                        onClick={() => setTempTokenDisclaimerModalOpen(true)}
                      >
                        <Text color="white">PLAY NOW</Text>
                      </Button>
                    )}
                  </>
                ) : (
                  <Text>
                    Cannot play when stream is offline, please refresh and try
                    again
                  </Text>
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
                      <Text fontSize={"12px"} color="#c6c3fc">
                        Target Price Reached
                      </Text>
                    ) : (
                      <Text fontSize={"12px"} color="#c6c3fc">
                        tokens to reach goal
                      </Text>
                    )}
                    <>
                      <Text color="#f3d584" fontSize="2rem">
                        {String(
                          currentActiveTokenTotalSupplyThreshold -
                            currentActiveTokenTotalSupply
                        )}
                      </Text>
                    </>
                  </Flex>
                </Flex>
                <Flex direction="column" justifyContent={"center"} gap="10px">
                  <Flex position="relative" gap="5px" alignItems={"center"}>
                    <ChakraTooltip
                      label={errorMessage}
                      placement="bottom-start"
                      isOpen={errorMessage !== undefined}
                      bg="red.600"
                    >
                      <Input
                        variant={errorMessage.length > 0 ? "redGlow" : "glow"}
                        textAlign="center"
                        value={amount}
                        onChange={handleAmount}
                        mx="auto"
                        p="1"
                        fontSize={"14px"}
                      />
                    </ChakraTooltip>
                    <Popover trigger="hover" placement="top" openDelay={500}>
                      <PopoverTrigger>
                        <Button
                          bg={"#403c7d"}
                          color="white"
                          p={2}
                          height={"20px"}
                          _focus={{}}
                          _active={{}}
                          _hover={{
                            bg: "#8884d8",
                          }}
                          onClick={() => {
                            userTempTokenBalance &&
                              handleAmountDirectly(
                                userTempTokenBalance.formatted
                              );
                          }}
                        >
                          max
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        bg="#6c3daf"
                        border="none"
                        width="100%"
                        p="2px"
                      >
                        <PopoverArrow bg="#6c3daf" />
                        <Text fontSize="12px" textAlign={"center"}>
                          click to show max temp tokens u currently own
                        </Text>
                      </PopoverContent>
                    </Popover>
                  </Flex>
                  <Flex gap="2px" justifyContent={"center"} direction="column">
                    <Button
                      color="white"
                      _focus={{}}
                      _hover={{}}
                      _active={{}}
                      bg="#46a800"
                      isDisabled={
                        !mint ||
                        mintCostAfterFeesLoading ||
                        Number(formatIncompleteNumber(amount)) <= 0
                      }
                      onClick={mint}
                      p={"0px"}
                      w="100%"
                    >
                      <Flex direction="column">
                        <Text>BUY</Text>
                        <Text fontSize={"12px"} noOfLines={1} color="#eeeeee">
                          {`(${truncateValue(
                            formatUnits(mintCostAfterFees, 18),
                            4
                          )} ETH)`}
                        </Text>
                      </Flex>
                    </Button>
                    <Button
                      color="white"
                      _focus={{}}
                      _hover={{}}
                      _active={{}}
                      bg="#fe2815"
                      isDisabled={
                        !burn ||
                        burnProceedsAfterFeesLoading ||
                        Number(formatIncompleteNumber(amount)) <= 0
                      }
                      onClick={burn}
                      p={undefined}
                      w="100%"
                    >
                      <Flex direction="column">
                        <Text>SELL</Text>
                        <Text fontSize={"12px"} noOfLines={1} color="#eeeeee">
                          {`(${truncateValue(
                            formatUnits(burnProceedsAfterFees, 18),
                            4
                          )} ETH)`}
                        </Text>
                      </Flex>
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
            )}
          </Flex>
        </Flex>
      )}
    </>
  );
};

const SendRemainingFundsFromCurrentInactiveTokenModal = ({
  title,
  handleClose,
  isOpen,
}: {
  title: string;
  handleClose: () => void;
  isOpen: boolean;
}) => {
  const toast = useToast();
  const { channel } = useChannelContext();
  const { currentTempTokenContract, onSendRemainingFundsToWinner } = channel;
  const { network } = useNetworkContext();
  const { explorerUrl } = network;

  const [winnerAddress, setWinnerAddress] = useState("");

  const {
    sendRemainingFundsToWinnerAfterTokenExpiration,
    sendRemainingFundsToWinnerAfterTokenExpirationTxLoading,
  } = useSendRemainingFundsToWinnerAfterTokenExpiration(
    {
      winnerWalletAddress: winnerAddress,
    },
    currentTempTokenContract,
    {
      onWriteSuccess: (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#287ab0" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.hash}`}
                passHref
              >
                send remaining funds pending, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
      onWriteError: (error) => {
        toast({
          duration: 9000,
          isClosable: true,
          position: "top-right",
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              send remaining funds cancelled
            </Box>
          ),
        });
      },
      onTxSuccess: async (data) => {
        const topics = decodeEventLog({
          abi: currentTempTokenContract.abi,
          data: data.logs[0].data,
          topics: data.logs[0].topics,
        });
        console.log("send remaining funds success", data, topics.args);
        const tokenAddressInteracted = data.to as string;
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                send remaining funds success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        // todo: replace with actual token address from returned tx receipt
        onSendRemainingFundsToWinner(tokenAddressInteracted, true);
        handleClose();
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              send remaining funds error
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
    }
  );

  return (
    <TransactionModalTemplate
      title={title}
      handleClose={handleClose}
      isOpen={isOpen}
      hideFooter
    >
      <Flex direction="column" gap="5px">
        <Text>Please provide an address to send it</Text>
        <Input
          variant="glow"
          value={winnerAddress}
          onChange={(e) => setWinnerAddress(e.target.value)}
        />
        <Button
          isDisabled={
            !isAddress(winnerAddress) ||
            sendRemainingFundsToWinnerAfterTokenExpirationTxLoading ||
            !sendRemainingFundsToWinnerAfterTokenExpiration
          }
          onClick={sendRemainingFundsToWinnerAfterTokenExpiration}
        >
          {sendRemainingFundsToWinnerAfterTokenExpirationTxLoading ? (
            <Spinner />
          ) : (
            "send"
          )}
        </Button>
      </Flex>
    </TransactionModalTemplate>
  );
};
