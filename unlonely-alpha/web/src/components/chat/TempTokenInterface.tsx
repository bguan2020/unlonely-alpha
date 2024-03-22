import { useState, useEffect } from "react";
import { formatUnits, isAddress } from "viem";
import {
  Flex,
  Text,
  Spinner,
  Input,
  Tooltip as ChakraTooltip,
  Button,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import { getTimeFromMillis } from "../../utils/time";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Line,
  Tooltip,
} from "recharts";
import { GET_USER_QUERY } from "../../constants/queries";
import centerEllipses from "../../utils/centerEllipses";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { useApolloClient } from "@apollo/client";
import { useCacheContext } from "../../hooks/context/useCache";
import { useTradeTempTokenState } from "../../hooks/internal/temp-token/useTradeTempTokenState";
import { formatIncompleteNumber } from "../../utils/validation/input";

export const TempTokenInterface = ({
  currentActiveTokenEndTimestamp,
}: {
  currentActiveTokenEndTimestamp: bigint;
}) => {
  const client = useApolloClient();
  const { ethPriceInUsd } = useCacheContext();

  const [timeLeftForTempToken, setTimeLeftForTempToken] = useState<
    string | undefined
  >(undefined);

  const {
    txs,
    loading,
    amount,
    handleAmount,
    mint,
    burn,
    errorMessage,
    tempTokenBalance,
    mintCostAfterFees,
    mintCostAfterFeesLoading,
    burnProceedsAfterFees,
    burnProceedsAfterFeesLoading,
  } = useTradeTempTokenState();

  useEffect(() => {
    // Function to update the countdown
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const duration = Number(currentActiveTokenEndTimestamp) - now;

      if (duration < 0) {
        // If the duration is negative, the countdown is over
        setTimeLeftForTempToken(undefined);
        return;
      }

      // Convert duration to a readable format, e.g., HH:MM:SS
      const str = getTimeFromMillis(duration * 1000, true);

      setTimeLeftForTempToken(str);
    };

    // Initial update
    updateCountdown();

    // Set the interval to update the countdown every X seconds
    const interval = setInterval(updateCountdown, 5 * 1000);

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, [currentActiveTokenEndTimestamp]);

  const CustomDot = (props: any) => {
    const { cx, cy, stroke, payload } = props;
    // Change the dot stroke color based on the value
    const dotStroke =
      payload.event === "Mint"
        ? "#00ff0d"
        : payload.event === "Burn"
        ? "#ff0000"
        : "#ffffff";

    return (
      <circle
        cx={cx}
        cy={cy}
        r={3}
        fill={stroke}
        stroke={dotStroke}
        strokeWidth={2}
      />
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    const [asyncData, setAsyncData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastDataKey, setLastDataKey] = useState<`0x${string}` | null>(null);

    useEffect(() => {
      // Early return if not active or payload is not as expected
      if (!(active && payload && payload.length && payload[0].payload.user)) {
        setLoading(false);
        return;
      }
      const handler = setTimeout(async () => {
        setLoading(true);
        if (payload[0].payload.user === lastDataKey) {
          setLoading(false);
          return;
        }

        await client
          .query({
            query: GET_USER_QUERY,
            variables: { data: { address: payload[0].payload.user } },
          })
          .then(({ data }) => {
            setAsyncData(data?.getUser?.username ?? payload[0].payload.user);
            setLastDataKey(payload[0].payload.user);
            setLoading(false);
          });
      }, 300);

      return () => {
        clearTimeout(handler);
      };
    }, [active, payload, lastDataKey]);

    // Conditional rendering moved outside of hook logic
    if (!(active && payload && payload.length)) {
      return null;
    }

    const percentage = Number(
      truncateValue(payload[0].payload.priceChangePercentage, 2, true, 2, false)
    );
    return (
      <Flex
        direction="column"
        bg="rgba(0, 0, 0, 0.5)"
        p="5px"
        borderRadius="15px"
      >
        <>
          {loading ? (
            <Text color={"#ffffff"}>
              {centerEllipses(payload[0].payload.user, 10)}
            </Text>
          ) : (
            <>
              {asyncData !== null ? (
                <>
                  {isAddress(asyncData) ? (
                    <Text color={"#d7a7ff"}>
                      {centerEllipses(asyncData, 10)}
                    </Text>
                  ) : (
                    <Text color={"#d7a7ff"}>{asyncData}</Text>
                  )}
                </>
              ) : (
                <Text color={"#d7a7ff"}>
                  {centerEllipses(payload[0].payload.user, 10)}
                </Text>
              )}
            </>
          )}
        </>
        {payload[0].payload.event !== "" && (
          <>
            <Text
              color={
                payload[0].payload.event === "Mint" ? "#46a800" : "#fe2815"
              }
            >{`${
              payload[0].payload.event === "Mint" ? "Bought" : "Sold"
            } ${truncateValue(payload[0].payload.amount, 0)}`}</Text>
            {payload[0].payload.priceInUsd !== undefined ? (
              <>
                <Text>{`$${truncateValue(
                  payload[0].payload.priceInUsd,
                  4
                )}`}</Text>
                <Text fontSize="10px" opacity="0.75">{`${truncateValue(
                  formatUnits(payload[0].payload.price, 18),
                  10
                )} ETH`}</Text>
              </>
            ) : (
              <Text>{`${truncateValue(
                formatUnits(payload[0].payload.price, 18),
                10
              )} ETH`}</Text>
            )}
            {percentage !== 0 && (
              <Text
                color={
                  payload[0].payload.priceChangePercentage > 0
                    ? "#46a800"
                    : "#fe2815"
                }
              >{`${
                payload[0].payload.priceChangePercentage > 0 ? "+" : ""
              }${percentage}%`}</Text>
            )}
          </>
        )}
      </Flex>
    );
  };

  const formatYAxisTick = (tick: number) => {
    return `$${truncateValue(
      Number(formatUnits(BigInt(Math.floor(tick)), 18)) *
        Number(ethPriceInUsd ?? "0"),
      2
    )}`;
  };

  return (
    <>
      {loading ? (
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
        <Flex direction="column" justifyContent={"space-between"} width="100%">
          <Flex justifyContent={"space-between"} alignItems={"center"}>
            Trading time left: {timeLeftForTempToken ?? "00h 00m 00s"}
          </Flex>
          <Flex gap="10px" flex="1">
            <Flex direction="column" w="100%" position="relative" h="100%">
              {txs.length === 0 && (
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
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={txs}>
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
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={"#8884d8"}
                    strokeWidth={2}
                    animationDuration={200}
                    dot={<CustomDot />}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Flex>
            <Flex direction="column" justifyContent={"flex-end"} gap="10px">
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
                        tempTokenBalance &&
                          handleAmount(tempTokenBalance.formatted);
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
        </Flex>
      )}
    </>
  );
};
