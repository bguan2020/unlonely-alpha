import { useMemo, useState } from "react";
import {
  Button,
  Flex,
  Spinner,
  Text,
  Tooltip as ChakraTooltip,
} from "@chakra-ui/react";
import { formatUnits, isAddress, parseUnits } from "viem";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  YAxis,
  ReferenceArea,
} from "recharts";

import { useCacheContext } from "../../hooks/context/useCache";
import centerEllipses from "../../utils/centerEllipses";
import { useChannelContext } from "../../hooks/context/useChannel";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { useUser } from "../../hooks/context/useUser";
import { AblyChannelPromise } from "../../constants";
import VibesTokenZoneModal from "../channels/VibesTokenZoneModal";
import VibesTokenExchange from "./VibesTokenExchange";

const ZONE_BREADTH = 0.05;

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <Flex
        direction="column"
        bg="rgba(0, 0, 0, 0.5)"
        p="5px"
        borderRadius="15px"
      >
        <Text>{`${
          isAddress(payload[0].payload.user)
            ? centerEllipses(payload[0].payload.user, 13)
            : payload[0].payload.user
        }`}</Text>
        <Text
          color={payload[0].payload.event === "Mint" ? "#46a800" : "#fe2815"}
        >{`${
          payload[0].payload.event === "Mint" ? "Bought" : "Sold"
        } ${truncateValue(payload[0].payload.amount, 0)}`}</Text>
        <Text>{`New price: ${truncateValue(
          formatUnits(payload[0].payload.price, 18),
          10
        )} ETH`}</Text>
      </Flex>
    );
  }

  return null;
};

const VibesTokenInterface = ({
  defaultTimeFilter,
  allStreams,
  previewMode,
  ablyChannel,
  disableExchange,
  customLowerPrice,
  customHigherPrice,
}: {
  defaultTimeFilter?: "1d" | "all";
  allStreams?: boolean;
  previewMode?: boolean;
  ablyChannel?: AblyChannelPromise;
  disableExchange?: boolean;
  customLowerPrice?: number;
  customHigherPrice?: number;
}) => {
  const { userAddress } = useUser();
  const { vibesTokenTxs, vibesTokenLoading, chartTimeIndexes } =
    useCacheContext();
  const { channel } = useChannelContext();
  const { channelQueryData } = channel;

  const [timeFilter, setTimeFilter] = useState<"1d" | "all">(
    defaultTimeFilter ?? "1d"
  );

  const [zonesOn, setZonesOn] = useState(true);

  // const formattedHourData = useMemo(() => {
  //   const res = vibesTokenTxs.map((tx) => {
  //     return {
  //       user: tx.user,
  //       event: tx.eventName,
  //       amount: Number(tx.amount),
  //       price: tx.price,
  //       blockNumber: tx.blockNumber,
  //     };
  //   });
  //   return res.slice(chartTimeIndexes.get("hour") as number);
  // }, [vibesTokenTxs, chartTimeIndexes]);

  const formattedDayData = useMemo(() => {
    const res = vibesTokenTxs.map((tx) => {
      return {
        user: tx.user,
        event: tx.eventName,
        amount: Number(tx.amount),
        price: tx.price,
        blockNumber: tx.blockNumber,
      };
    });
    return res.slice(chartTimeIndexes.get("day") as number);
  }, [vibesTokenTxs, chartTimeIndexes]);

  const formattedData = useMemo(() => {
    // if (timeFilter === "zones") return formattedHourData;
    if (timeFilter === "1d") return formattedDayData;
    const res = vibesTokenTxs.map((tx) => {
      return {
        user: tx.user,
        event: tx.eventName,
        amount: Number(tx.amount),
        price: tx.price,
        blockNumber: tx.blockNumber,
      };
    });
    return res;
  }, [timeFilter, formattedDayData, vibesTokenTxs]);

  const formattedCurrentPrice = useMemo(
    () =>
      formattedData.length > 0
        ? formatUnits(BigInt(formattedData[formattedData.length - 1].price), 18)
        : "0",
    [formattedData]
  );

  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);

  const isOwner = userAddress === channelQueryData?.owner.address;

  const lowerPrice = useMemo(() => {
    if (customLowerPrice !== undefined) return customLowerPrice;
    if (
      channelQueryData?.vibesTokenPriceRange?.[0] !== null &&
      channelQueryData?.vibesTokenPriceRange?.[0] !== undefined
    ) {
      return Number(
        parseUnits(
          channelQueryData?.vibesTokenPriceRange?.[0] as `${number}`,
          18
        )
      );
    }
    return 0;
  }, [channelQueryData?.vibesTokenPriceRange?.[0], customLowerPrice]);

  const higherPrice = useMemo(() => {
    if (customHigherPrice !== undefined) return customHigherPrice;
    if (
      channelQueryData?.vibesTokenPriceRange?.[1] !== null &&
      channelQueryData?.vibesTokenPriceRange?.[1] !== undefined
    ) {
      return Number(
        parseUnits(
          channelQueryData?.vibesTokenPriceRange?.[1] as `${number}`,
          18
        )
      );
    }
    return Number.MAX_SAFE_INTEGER;
  }, [channelQueryData?.vibesTokenPriceRange?.[1], customHigherPrice]);

  return (
    <>
      {vibesTokenLoading ? (
        <Flex
          direction="column"
          alignItems="center"
          width="100%"
          gap="5px"
          justifyContent={"center"}
        >
          <Text>loading $VIBES chart</Text>
          <Spinner size="md" />
        </Flex>
      ) : (
        <Flex direction="column" justifyContent={"space-between"} width="100%">
          <Flex gap="1rem" alignItems={"center"}>
            <ChakraTooltip
              label={`buy/sell this token depending on the vibes of ${
                allStreams ? "the app!" : "this stream!"
              }`}
              shouldWrapChildren
            >
              <Text fontSize={"20px"} color="#c6c3fc" fontWeight="bold">
                $VIBES
              </Text>
            </ChakraTooltip>

            <Button
              bg={timeFilter === "1d" ? "#7874c9" : "#403c7d"}
              color="#c6c3fc"
              p={2}
              height={"20px"}
              _focus={{}}
              _active={{}}
              _hover={{}}
              onClick={() => setTimeFilter("1d")}
            >
              1d
            </Button>
            <Button
              bg={timeFilter === "all" ? "#7874c9" : "#403c7d"}
              color="#c6c3fc"
              p={2}
              height={"20px"}
              _focus={{}}
              _active={{}}
              _hover={{}}
              onClick={() => setTimeFilter("all")}
            >
              all
            </Button>
            <Button
              bg={zonesOn ? "#1dc859" : "#004e1b"}
              color="#ffffff"
              p={2}
              height={"20px"}
              _focus={{}}
              _active={{}}
              _hover={{}}
              onClick={() => setZonesOn((prev) => !prev)}
              boxShadow={
                zonesOn ? "0px 0px 16px rgba(53, 234, 95, 0.4)" : undefined
              }
            >
              zones
            </Button>
            {!allStreams && !previewMode && isOwner && (
              <>
                <VibesTokenZoneModal
                  isOpen={isZoneModalOpen}
                  handleClose={() => setIsZoneModalOpen(false)}
                  formattedCurrentPrice={formattedCurrentPrice as `${number}`}
                  ablyChannel={ablyChannel}
                />
                <Button
                  color="white"
                  bg="#0299ad"
                  onClick={() => setIsZoneModalOpen(true)}
                  _hover={{}}
                  _focus={{}}
                  _active={{}}
                  p={2}
                  height={"20px"}
                >
                  set zones
                </Button>
              </>
            )}
          </Flex>
          <Flex direction={"row"} gap="10px" flex="1">
            <Flex direction="column" w="100%" position="relative">
              {/* {formattedHourData.length === 0 && timeFilter === "zones" && (
                <Text position="absolute" color="gray" top="50%">
                  no txs in last hour
                </Text>
              )} */}
              {formattedDayData.length === 0 && timeFilter === "1d" && (
                <Text position="absolute" color="gray" top="50%">
                  no txs in the past 24 hours
                </Text>
              )}
              {formattedData.length === 0 && timeFilter === "all" && (
                <Text position="absolute" color="gray" top="50%">
                  no txs
                </Text>
              )}
              <ResponsiveContainer width="100%" height={"100%"}>
                <LineChart data={formattedData}>
                  <YAxis
                    hide
                    domain={
                      !allStreams &&
                      zonesOn &&
                      lowerPrice > 0 &&
                      higherPrice > 0
                        ? [
                            lowerPrice * (1 - ZONE_BREADTH),
                            higherPrice * (1 + ZONE_BREADTH),
                          ]
                        : ["dataMin", "dataMax"]
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {(!allStreams || !previewMode) &&
                    higherPrice < Number.MAX_SAFE_INTEGER && (
                      <ReferenceArea
                        fill="green"
                        fillOpacity={0.2}
                        y1={higherPrice}
                        y2={Number.MAX_SAFE_INTEGER}
                        ifOverflow="hidden"
                      />
                    )}
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={
                      Number(formattedCurrentPrice) >
                        Number(formatUnits(BigInt(higherPrice), 18)) &&
                      higherPrice > 0
                        ? "green"
                        : Number(formattedCurrentPrice) <
                            Number(formatUnits(BigInt(lowerPrice), 18)) &&
                          lowerPrice > 0
                        ? "red"
                        : "#8884d8"
                    }
                    strokeWidth={2}
                    animationDuration={200}
                    dot={false}
                  />
                  {(!allStreams || !previewMode) && lowerPrice > 0 && (
                    <ReferenceArea
                      fill="red"
                      fillOpacity={0.2}
                      y1={0}
                      y2={lowerPrice}
                      ifOverflow="hidden"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Flex>
            {disableExchange !== true && <VibesTokenExchange />}
          </Flex>
        </Flex>
      )}
    </>
  );
};

export default VibesTokenInterface;
