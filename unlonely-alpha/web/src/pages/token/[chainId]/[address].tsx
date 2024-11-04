import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GET_TEMP_TOKENS_QUERY } from "../../../constants/queries";
import { GetTempTokensQuery, TempToken } from "../../../generated/graphql";
import { NULL_ADDRESS } from "../../../constants";
import { ContractData } from "../../../constants/types";
import TempTokenAbi from "../../../constants/abi/TempTokenV1.json";
import {
  UseReadTempTokenTxsType,
  useReadTempTokenTxs,
} from "../../../hooks/internal/temp-token/read/useReadTempTokenTxs";
import {
  Flex,
  Text,
  Button,
  Tooltip as ChakraTooltip,
  Input,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  IconButton,
} from "@chakra-ui/react";
import { useInterfaceChartData } from "../../../hooks/internal/temp-token/ui/useInterfaceChartData";
import { FaMagnifyingGlassChart, FaPause } from "react-icons/fa6";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  ReferenceLine,
  Line,
  Brush,
  Tooltip,
} from "recharts";
import {
  blockNumberDaysAgo,
  blockNumberHoursAgo,
} from "../../../hooks/internal/useVibesCheck";
import {
  NUMBER_OF_DAYS_IN_MONTH,
  NUMBER_OF_HOURS_IN_DAY,
} from "../../../components/channels/temp/TempTokenChart";
import { useInterfaceChartMarkers } from "../../../hooks/internal/temp-token/ui/useInterfaceChartMarkers";
import { useCacheContext } from "../../../hooks/context/useCache";
import { createPublicClient, formatUnits, http } from "viem";
import { truncateValue } from "../../../utils/tokenDisplayFormatting";
import { useTradeTempTokenState } from "../../../hooks/internal/temp-token/write/useTradeTempTokenState";
import { formatIncompleteNumber } from "../../../utils/validation/input";
import AppLayout from "../../../components/layout/AppLayout";
import Link from "next/link";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useNetworkContext } from "../../../hooks/context/useNetwork";
import centerEllipses from "../../../utils/centerEllipses";
import Header from "../../../components/navigation/Header";
import { WavyText } from "../../../components/general/WavyText";
import { bondingCurveBigInt } from "../../../utils/contract";
import { base } from "viem/chains";
import { safeIncludes } from "../../../utils/safeFunctions";

const TokenTradePage = () => {
  const router = useRouter();
  const { chainId, address } = router.query;

  const [getTempTokensQuery, { loading: getTempTokensLoading }] =
    useLazyQuery<GetTempTokensQuery>(GET_TEMP_TOKENS_QUERY, {
      fetchPolicy: "network-only",
    });

  const [tempToken, setTempToken] = useState<TempToken | null>(null);

  const handleGetTempTokens = useCallback(async () => {
    try {
      const res = await getTempTokensQuery({
        variables: {
          data: {
            tokenAddress: address as string,
            chainId: Number(chainId),
            fulfillAllNotAnyConditions: true,
          },
        },
      });
      const tokens = res.data?.getTempTokens;
      if (!tokens) return;
      const nonNullTokens = tokens.filter(
        (token): token is TempToken => token !== null
      );
      const token = nonNullTokens[0];
      setTempToken(token);
    } catch (e) {
      console.error(e);
    }
  }, [address, chainId]);

  useEffect(() => {
    handleGetTempTokens();
  }, [handleGetTempTokens]);

  return (
    <AppLayout isCustomHeader={false} noHeader>
      <Flex bg="#131323" direction="column" height="100vh">
        <Header />
        {!getTempTokensLoading && tempToken ? (
          <TradeLayer tempToken={tempToken} />
        ) : (
          <Flex
            alignItems={"center"}
            justifyContent={"center"}
            width="100%"
            height="calc(100vh - 64px)"
            fontSize="50px"
          >
            {getTempTokensLoading ? (
              <WavyText text="loading..." />
            ) : (
              <Text fontFamily="LoRes15" textAlign={"center"} fontSize="50px">
                no token found
              </Text>
            )}
          </Flex>
        )}
      </Flex>
    </AppLayout>
  );
};

export default TokenTradePage;

export const TradeLayer = ({ tempToken }: { tempToken: TempToken }) => {
  const { ethPriceInUsd } = useCacheContext();

  const baseClient = useMemo(
    () =>
      createPublicClient({
        chain: base,
        transport: http(
          `https://base-mainnet.g.alchemy.com/v2/${String(
            process.env.NEXT_PUBLIC_ALCHEMY_BASE_API_KEY
          )}`
        ),
      }),
    []
  );

  const [hasReachedTotalSupplyThreshold, setHasReachedTotalSupplyThreshold] =
    useState<boolean>(false);
  const [totalSupplyThreshold, setTotalSupplyThreshold] = useState<bigint>(
    BigInt(0)
  );
  const [isActive, setIsActive] = useState<boolean>(false);

  const { network } = useNetworkContext();
  const { explorerUrl } = network;

  const tempTokenContract: ContractData = useMemo(() => {
    if (tempToken.tokenAddress === NULL_ADDRESS) {
      return {
        address: NULL_ADDRESS,
        abi: undefined,
        chainId: tempToken.chainId,
      };
    }
    return {
      address: tempToken.tokenAddress as `0x${string}`,
      abi: TempTokenAbi,
      chainId: tempToken.chainId,
    };
  }, [tempToken]);

  const readTempTokenTxs = useReadTempTokenTxs({
    tokenCreationBlockNumber: BigInt(tempToken.creationBlockNumber),
    baseClient: baseClient,
    tempTokenContract,
  });

  const interfaceChartData = useInterfaceChartData({
    chartTimeIndexes: readTempTokenTxs.tempTokenChartTimeIndexes,
    txs: readTempTokenTxs.tempTokenTxs,
  });

  const {
    CustomDot,
    CustomTooltip,
    formatYAxisTick,
    CustomLabel,
    customBrushFormatter,
  } = useInterfaceChartMarkers(
    interfaceChartData.chartTxs,
    interfaceChartData.timeFilter
  );

  const priceOfThreshold = useMemo(() => {
    if (totalSupplyThreshold === BigInt(0)) return 0;

    const n = totalSupplyThreshold;
    const n_ = n > BigInt(0) ? n - BigInt(1) : BigInt(0);
    const priceForCurrent = bondingCurveBigInt(n);
    const priceForPrevious = bondingCurveBigInt(n_);
    const newPrice =
      priceForCurrent - priceForPrevious + BigInt(tempToken.minBaseTokenPrice);
    console.log(tempToken.minBaseTokenPrice);
    return Number(newPrice);
  }, [totalSupplyThreshold, tempToken]);

  const priceOfThresholdInUsd = useMemo(
    () =>
      truncateValue(
        Number(formatUnits(BigInt(priceOfThreshold), 18)) *
          Number(ethPriceInUsd),
        4
      ),
    [priceOfThreshold, ethPriceInUsd]
  );

  useEffect(() => {
    const init = async () => {
      if (!baseClient) return;
      const [_totalSupplyThreshold, _hasHitTotalSupplyThreshold, _getIsActive] =
        await Promise.all([
          baseClient.readContract({
            address: tempToken.tokenAddress as `0x${string}`,
            abi: TempTokenAbi,
            functionName: "totalSupplyThreshold",
          }),
          baseClient.readContract({
            address: tempToken.tokenAddress as `0x${string}`,
            abi: TempTokenAbi,
            functionName: "hasHitTotalSupplyThreshold",
          }),
          baseClient.readContract({
            address: tempToken.tokenAddress as `0x${string}`,
            abi: TempTokenAbi,
            functionName: "getIsActive",
          }),
        ]);
      setIsActive(_getIsActive as boolean);
      setTotalSupplyThreshold(_totalSupplyThreshold as bigint);
      setHasReachedTotalSupplyThreshold(_hasHitTotalSupplyThreshold as boolean);
    };
    init();
  }, [tempToken]);

  return (
    <Flex
      direction={"column"}
      justifyContent={"space-between"}
      width="100%"
      gap={"5px"}
      h={"100%"}
      p="10px"
    >
      <Flex justifyContent={"space-between"} alignItems={"center"}>
        <Flex direction={"column"}>
          <Text fontSize={"20px"} color="#c6c3fc" fontWeight="bold">
            ${tempToken.symbol}
          </Text>
          <Link
            target="_blank"
            href={`${explorerUrl}/address/${tempToken.tokenAddress}`}
            passHref
          >
            <Flex
              alignItems="center"
              _hover={{
                textDecoration: "underline",
              }}
            >
              <Text fontSize={"10px"}>
                {centerEllipses(tempToken.tokenAddress, 13)}
              </Text>
              <IconButton
                aria-label={`goto-${tempToken.tokenAddress}`}
                color="#b5b5b5"
                icon={<ExternalLinkIcon />}
                height="10px"
                minWidth={"10px"}
                bg="transparent"
                _focus={{}}
                _active={{}}
                _hover={{
                  color: "white",
                }}
              />
            </Flex>
          </Link>
        </Flex>
      </Flex>
      <Flex gap="10px" flex="1" h="100%" direction="column">
        <Flex gap="5px" alignItems={"center"}>
          <Button
            bg={interfaceChartData.timeFilter === "1h" ? "#7874c9" : "#403c7d"}
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
            bg={interfaceChartData.timeFilter === "1d" ? "#7874c9" : "#403c7d"}
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
            bg={interfaceChartData.timeFilter === "all" ? "#7874c9" : "#403c7d"}
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
        </Flex>
        <Flex direction="column" w="100%" position="relative" h="60%">
          {interfaceChartData.isChartPaused && (
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
          <ResponsiveContainer width="100%" height={600}>
            <LineChart
              data={
                interfaceChartData.isChartPaused
                  ? interfaceChartData.timeFilter === "all"
                    ? interfaceChartData.pausedDataForAllTime
                    : interfaceChartData.timeFilter === "1h"
                    ? interfaceChartData.pausedData_1h
                    : interfaceChartData.pausedData_1d
                  : interfaceChartData.formattedData
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
                domain={["dataMin", "dataMax"]}
                hide={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {interfaceChartData.timeFilter === "all" && (
                <>
                  {Array.from(readTempTokenTxs.tempTokenChartTimeIndexes.keys())
                    ?.filter((i) => safeIncludes(i, "d"))
                    .map((key) => {
                      return (
                        <ReferenceLine
                          key={key}
                          strokeDasharray="3 3"
                          x={
                            readTempTokenTxs.tempTokenChartTimeIndexes.get(key)
                              ?.blockNumber as number
                          }
                          stroke="rgb(0, 211, 193)"
                          label={<CustomLabel value={`~${key}`} />}
                        />
                      );
                    })}
                  {[...Array(NUMBER_OF_DAYS_IN_MONTH).keys()]
                    .map((i) => i + 1)
                    ?.filter(
                      (d) =>
                        readTempTokenTxs.tempTokenChartTimeIndexes.get(`${d}d`)
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
                              readTempTokenTxs.currentBlockNumberForTempTokenChart
                            )
                          )}
                          stroke="rgba(0, 211, 193, 0.2)"
                        />
                      );
                    })}
                </>
              )}
              {interfaceChartData.timeFilter === "1d" && (
                <>
                  {Array.from(readTempTokenTxs.tempTokenChartTimeIndexes.keys())
                    ?.filter((i) => safeIncludes(i, "h"))
                    .map((key) => {
                      return (
                        <ReferenceLine
                          key={key}
                          strokeDasharray="3 3"
                          x={
                            readTempTokenTxs.tempTokenChartTimeIndexes.get(key)
                              ?.blockNumber as number
                          }
                          stroke="#00d3c1"
                          label={<CustomLabel value={`~${key}`} />}
                        />
                      );
                    })}
                  {[...Array(NUMBER_OF_HOURS_IN_DAY).keys()]
                    .map((i) => i + 1)
                    ?.filter(
                      (h) =>
                        readTempTokenTxs.tempTokenChartTimeIndexes.get(`${h}h`)
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
                              readTempTokenTxs.currentBlockNumberForTempTokenChart
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
                stroke={hasReachedTotalSupplyThreshold ? "#ffd014" : "#8884d8"}
                strokeWidth={2}
                animationDuration={200}
                dot={<CustomDot />}
              />
              {interfaceChartData.isChartPaused && (
                <Brush
                  dataKey="blockNumber"
                  height={30}
                  fill={
                    interfaceChartData.isChartPaused ? "#2c2970" : "transparent"
                  }
                  stroke={
                    interfaceChartData.isChartPaused ? "#ada9f9" : "#5e5e6a"
                  }
                  tickFormatter={(tick) => customBrushFormatter(tick)}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
          <Flex
            h="150px"
            width="100%"
            justifyContent={"center"}
            alignItems="center"
          >
            {isActive ? (
              <Text fontSize="25px" textAlign="center">
                Token still active, please trade this token in its owner's
                channel
              </Text>
            ) : !tempToken.isAlwaysTradeable ? (
              <Text fontSize="25px" textAlign="center">
                Token not tradeable
              </Text>
            ) : (
              <Exchange
                tempToken={tempToken}
                tempTokenContract={tempTokenContract}
                readTempTokenTxs={readTempTokenTxs}
              />
            )}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

const Exchange = ({
  tempToken,
  tempTokenContract,
  readTempTokenTxs,
}: {
  tempToken: TempToken;
  tempTokenContract: ContractData;
  readTempTokenTxs: UseReadTempTokenTxsType;
}) => {
  const baseClient = useMemo(
    () =>
      createPublicClient({
        chain: base,
        transport: http(
          `https://base-mainnet.g.alchemy.com/v2/${String(
            process.env.NEXT_PUBLIC_ALCHEMY_BASE_API_KEY
          )}`
        ),
      }),
    []
  );

  const {
    tradeAmount,
    handleAmount,
    handleAmountDirectly,
    mint,
    burn,
    mintCostAfterFees,
    mintCostAfterFeesLoading,
    burnProceedsAfterFees,
    burnProceedsAfterFeesLoading,
    errorMessage,
  } = useTradeTempTokenState({
    tokenAddress: tempToken.tokenAddress,
    tokenSymbol: tempToken.symbol,
    tokenTxs: readTempTokenTxs.tempTokenTxs,
    isPreSaleOngoing: false,
    callbackOnMintTxSuccess: () => {
      readTempTokenTxs.refetchUserTempTokenBalance();
    },
    callbackOnBurnTxSuccess: () => {
      readTempTokenTxs.refetchUserTempTokenBalance();
    },
  });

  const getEvents = useCallback(async () => {
    if (readTempTokenTxs.tempTokenTxs.length > 0) {
      await readTempTokenTxs.getTempTokenEvents(
        tempTokenContract,
        BigInt(tempToken.minBaseTokenPrice),
        BigInt(
          readTempTokenTxs.tempTokenTxs[
            readTempTokenTxs.tempTokenTxs.length - 1
          ].blockNumber + 1
        ),
        BigInt(0)
      );
    }
  }, [
    baseClient,
    tempTokenContract,
    readTempTokenTxs.tempTokenTxs.length,
    tempToken,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("calling");
      getEvents();
    }, 9000);
    return () => clearInterval(interval);
  }, [getEvents]);

  return (
    <Flex
      direction="column"
      justifyContent={"center"}
      gap="10px"
      margin={"auto"}
    >
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
            value={tradeAmount}
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
                handleAmountDirectly(
                  readTempTokenTxs.userTempTokenBalance.toString()
                );
              }}
            >
              max
            </Button>
          </PopoverTrigger>
          <PopoverContent bg="#6c3daf" border="none" width="100%" p="2px">
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
          bg={"#46a800"}
          isDisabled={
            !mint ||
            mintCostAfterFeesLoading ||
            Number(formatIncompleteNumber(tradeAmount)) <= 0
          }
          onClick={mint}
          p={"0px"}
          w="100%"
        >
          <Flex direction="column">
            <Text>BUY</Text>
            <Text fontSize={"12px"} noOfLines={1} color="#eeeeee">
              {`(${truncateValue(formatUnits(mintCostAfterFees, 18), 4)} ETH)`}
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
            Number(formatIncompleteNumber(tradeAmount)) <= 0
          }
          onClick={burn}
          p={undefined}
          w="100%"
        >
          <Flex direction="column">
            <Text>{"SELL"}</Text>
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
  );
};
