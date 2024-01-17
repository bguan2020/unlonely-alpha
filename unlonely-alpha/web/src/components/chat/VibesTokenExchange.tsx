import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Spinner,
  Text,
  useToast,
  Tooltip as ChakraTooltip,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  IconButton,
} from "@chakra-ui/react";
import { decodeEventLog, formatUnits, isAddress, parseUnits } from "viem";
import Link from "next/link";
import { FaCopy } from "react-icons/fa6";
import { useBalance, useBlockNumber } from "wagmi";
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
import { filteredInput } from "../../utils/validation/input";
import {
  useBurn,
  useGetMintCostAfterFees,
  useMint,
  useReadPublic,
} from "../../hooks/contracts/useVibesToken";
import useDebounce from "../../hooks/internal/useDebounce";
import { getContractFromNetwork } from "../../utils/contract";
import { useNetworkContext } from "../../hooks/context/useNetwork";
import { useChannelContext } from "../../hooks/context/useChannel";
import {
  convertSciNotaToPrecise,
  truncateValue,
} from "../../utils/tokenDisplayFormatting";
import { useUser } from "../../hooks/context/useUser";
import {
  InteractionType,
  MAX_VIBES_PRICE,
  NULL_ADDRESS,
} from "../../constants";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";

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

const VibesTokenExchange = ({
  defaultTimeFilter,
  allStreams,
}: {
  defaultTimeFilter?: "1h" | "1d" | "all";
  allStreams?: boolean;
}) => {
  const { walletIsConnected, userAddress, user } = useUser();
  const { vibesTokenTxs, vibesTokenLoading, chartTimeIndexes } =
    useCacheContext();
  const toast = useToast();
  const { network } = useNetworkContext();
  const { matchingChain, localNetwork, explorerUrl } = network;
  const contract = getContractFromNetwork("vibesTokenV1", localNetwork);
  const { chat, channel } = useChannelContext();
  const { channelQueryData } = channel;
  const { addToChatbot } = chat;

  const [timeFilter, setTimeFilter] = useState<"1h" | "1d" | "all">(
    defaultTimeFilter ?? "1d"
  );

  const blockNumber = useBlockNumber({
    watch: true,
  });

  const { data: vibesBalance, refetch: refetchVibesBalance } = useBalance({
    address: userAddress,
    token: contract.address,
    enabled:
      isAddress(userAddress as `0x${string}`) &&
      isAddress(contract.address ?? NULL_ADDRESS),
  });

  const { protocolFeeDestination, refetch: refetchDest } =
    useReadPublic(contract);

  const formattedHourData = useMemo(() => {
    const res = vibesTokenTxs.map((tx) => {
      return {
        user: tx.user,
        event: tx.eventName,
        amount: Number(tx.amount),
        price: tx.price,
        blockNumber: tx.blockNumber,
      };
    });
    return res.slice(chartTimeIndexes.get("hour") as number);
  }, [vibesTokenTxs, chartTimeIndexes]);

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
    if (timeFilter === "1h") return formattedHourData;
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
  }, [timeFilter, formattedHourData, formattedDayData, vibesTokenTxs]);

  const formattedCurrentPrice = useMemo(
    () =>
      formattedData.length > 0
        ? formatUnits(BigInt(formattedData[formattedData.length - 1].price), 18)
        : "0",
    [formattedData]
  );

  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [sliderValue, setSliderValue] = useState<string[]>([
    formattedCurrentPrice,
    formattedCurrentPrice,
  ]);

  const [amountOfVibes, setAmountOfVibes] = useState<string>("10000");
  const debouncedAmountOfVotes = useDebounce(amountOfVibes, 300);
  const amount_votes_bigint = useMemo(
    () => BigInt(debouncedAmountOfVotes as `${number}`),
    [debouncedAmountOfVotes]
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const canAddToChatbot_mint = useRef(false);
  const canAddToChatbot_burn = useRef(false);

  const isFetching = useRef(false);
  const { mintCostAfterFees, refetch: refetchMintCostAfterFees } =
    useGetMintCostAfterFees(amount_votes_bigint, contract);

  // const { burnProceedsAfterFees, refetch: refetchBurnProceedsAfterFees } =
  //   useGetBurnProceedsAfterFees(amount_votes_bigint, contract);

  const {
    mint,
    refetch: refetchMint,
    isRefetchingMint,
  } = useMint(
    {
      streamer:
        (channelQueryData?.owner.address as `0x${string}`) ??
        protocolFeeDestination,
      amount: amount_votes_bigint,
      value: mintCostAfterFees,
    },
    contract,
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
                mint pending, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        canAddToChatbot_mint.current = true;
      },
      onWriteError: (error) => {
        toast({
          duration: 9000,
          isClosable: true,
          position: "top-right",
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              mint cancelled
            </Box>
          ),
        });
        canAddToChatbot_mint.current = false;
      },
      onTxSuccess: async (data) => {
        if (!canAddToChatbot_mint.current) return;
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                mint success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        if (channelQueryData) {
          const topics = decodeEventLog({
            abi: contract.abi,
            data: data.logs[1].data,
            topics: data.logs[1].topics,
          });
          const args: any = topics.args;
          const title = `${
            user?.username ?? centerEllipses(args.account, 15)
          } bought ${args.amount} $VIBES!`;
          addToChatbot({
            username: user?.username ?? "",
            address: userAddress ?? "",
            taskType: InteractionType.BUY_VIBES,
            title,
            description: `${
              user?.username ?? centerEllipses(userAddress, 15)
            }:${args.amount}`,
          });
        }
        canAddToChatbot_mint.current = false;
        setAmountOfVibes("10000");
      },
      onTxError: (error) => {
        console.log("mint error", error);
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4}>
              <Flex direction="column">
                <Text>mint error</Text>
                <Text fontSize="15px">{error?.message ?? "unknown error"}</Text>
              </Flex>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        canAddToChatbot_mint.current = false;
      },
    }
  );

  const {
    burn,
    refetch: refetchBurn,
    isRefetchingBurn,
  } = useBurn(
    {
      streamer:
        (channelQueryData?.owner.address as `0x${string}`) ??
        protocolFeeDestination,
      amount: amount_votes_bigint,
    },
    contract,
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
                burn pending, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        canAddToChatbot_burn.current = true;
      },
      onWriteError: (error) => {
        toast({
          duration: 9000,
          isClosable: true,
          position: "top-right",
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              burn cancelled
            </Box>
          ),
        });
        canAddToChatbot_burn.current = false;
      },
      onTxSuccess: async (data) => {
        if (!canAddToChatbot_burn.current) return;
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                burn success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        const topics = decodeEventLog({
          abi: contract.abi,
          data: data.logs[1].data,
          topics: data.logs[1].topics,
        });
        const args: any = topics.args;
        const title = `${
          user?.username ?? centerEllipses(args.account, 15)
        } sold ${args.amount} $VIBES!`;
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.SELL_VIBES,
          title,
          description: `${user?.username ?? centerEllipses(userAddress, 15)}:${
            args.amount
          }`,
        });
        canAddToChatbot_burn.current = false;
        setAmountOfVibes("10000");
      },
      onTxError: (error) => {
        console.log("burn error", error);
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4}>
              <Flex direction="column">
                <Text>burn error</Text>
                <Text fontSize="15px">{error?.message ?? "unknown error"}</Text>
              </Flex>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        canAddToChatbot_burn.current = false;
      },
    }
  );

  const handleInputChange = (event: any) => {
    const input = event.target.value;
    const filtered = filteredInput(input);
    setAmountOfVibes(filtered);
  };

  useEffect(() => {
    if (
      !blockNumber.data ||
      isFetching.current ||
      !contract.address ||
      !userAddress ||
      !walletIsConnected
    )
      return;
    const fetch = async () => {
      isFetching.current = true;
      const startTime = Date.now();
      let endTime = 0;
      try {
        await Promise.all([
          refetchMint(),
          refetchBurn(),
          refetchMintCostAfterFees(),
          // refetchBurnProceedsAfterFees(),
          refetchVibesBalance(),
          refetchDest(),
        ]).then(() => {
          endTime = Date.now();
        });
      } catch (err) {
        endTime = Date.now();
        console.log("vibes fetching error", err);
      }
      const MILLIS = 3000;
      const timeToWait =
        endTime >= startTime + MILLIS ? 0 : MILLIS - (endTime - startTime);
      await new Promise((resolve) => {
        setTimeout(resolve, timeToWait);
      });
      isFetching.current = false;
    };
    fetch();
  }, [blockNumber.data]);

  useEffect(() => {
    if (!walletIsConnected) {
      setErrorMessage("connect wallet first");
    } else if (!matchingChain) {
      setErrorMessage("wrong network");
    } else {
      setErrorMessage("");
    }
  }, [walletIsConnected, matchingChain, amountOfVibes]);

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
        <Flex direction="column" justifyContent={"space-between"}>
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
              bg={timeFilter === "1h" ? "#7874c9" : "#403c7d"}
              color="#c6c3fc"
              p={2}
              height={"20px"}
              _focus={{}}
              _active={{}}
              _hover={{}}
              onClick={() => setTimeFilter("1h")}
            >
              1h
            </Button>
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
            {!allStreams && (
              <>
                <TransactionModalTemplate
                  isOpen={isZoneModalOpen}
                  handleClose={() => setIsZoneModalOpen(false)}
                  title="set zones"
                  hideFooter
                  loadingText="setting zones..."
                >
                  <Flex direction="column" gap="16px">
                    <Flex
                      direction={"column"}
                      gap="15px"
                      bg="rgba(0, 0, 0, 0.6)"
                      p="20px"
                      borderRadius="10px"
                    >
                      <Text fontSize="14px" color="#bababa" textAlign="center">
                        you can set green and red price range indicators to
                        track $VIBES performance
                      </Text>
                      <Flex justifyContent={"space-between"}>
                        <IconButton
                          border={
                            Number(formattedCurrentPrice) ===
                            Number(sliderValue[0])
                              ? undefined
                              : "1px solid #ff3d3d"
                          }
                          aria-label="copy price to lower"
                          icon={<FaCopy />}
                          bg="transparent"
                          _hover={{
                            transform: "scale(1.1)",
                          }}
                          color={
                            Number(formattedCurrentPrice) ===
                            Number(sliderValue[0])
                              ? "#636363"
                              : "#ff3d3d"
                          }
                          _focus={{}}
                          _active={{}}
                          onClick={() =>
                            setSliderValue((prev) => {
                              return [formattedCurrentPrice, prev[1]];
                            })
                          }
                        />
                        <Text fontSize="20px" textAlign={"center"}>
                          Current price in ETH
                          <Text color="#f8f53b">{formattedCurrentPrice}</Text>
                        </Text>
                        <IconButton
                          border={
                            Number(formattedCurrentPrice) ===
                            Number(sliderValue[1])
                              ? undefined
                              : "1px solid #46a800"
                          }
                          aria-label="copy price to higher"
                          icon={<FaCopy />}
                          bg="transparent"
                          _hover={{
                            transform: "scale(1.1)",
                          }}
                          color={
                            Number(formattedCurrentPrice) ===
                            Number(sliderValue[1])
                              ? "#636363"
                              : "#46a800"
                          }
                          _focus={{}}
                          _active={{}}
                          onClick={() =>
                            setSliderValue((prev) => {
                              return [prev[0], formattedCurrentPrice];
                            })
                          }
                        />
                      </Flex>
                    </Flex>
                    <RangeSlider
                      aria-label={["min", "max"]}
                      value={sliderValue.map((str) =>
                        Number(
                          parseUnits(
                            convertSciNotaToPrecise(str) as `${number}`,
                            18
                          )
                        )
                      )}
                      onChange={(val) =>
                        setSliderValue(
                          val.map((num) => formatUnits(BigInt(num), 18))
                        )
                      }
                      min={0}
                      max={MAX_VIBES_PRICE}
                    >
                      <RangeSliderTrack bg={"#403c7d"}>
                        <RangeSliderFilledTrack bg={"#c4c1f5"} />
                      </RangeSliderTrack>
                      <RangeSliderThumb
                        index={0}
                        boxSize={"6"}
                        sx={{ bg: "#ff3d3d" }}
                      />
                      <RangeSliderThumb
                        index={1}
                        boxSize={"6"}
                        sx={{ bg: "#46a800" }}
                      />
                    </RangeSlider>
                    <Flex gap="20px">
                      <Flex direction="column">
                        <Text>lower price zone</Text>
                        <Text
                          textAlign={"center"}
                          fontSize="25px"
                          noOfLines={1}
                          color="#ff6161"
                        >
                          {truncateValue(
                            formattedData.length > 0
                              ? (Number(
                                  parseUnits(
                                    convertSciNotaToPrecise(
                                      sliderValue[0]
                                    ) as `${number}`,
                                    18
                                  )
                                ) /
                                  formattedData[formattedData.length - 1]
                                    .price) *
                                  100
                              : 0,
                            2
                          )}
                          %
                        </Text>
                        <Input
                          variant={"redGlow"}
                          value={sliderValue[0]}
                          onChange={(e) =>
                            setSliderValue((prev) => {
                              return [
                                filteredInput(e.target.value, true),
                                prev[1],
                              ];
                            })
                          }
                        />
                        <Flex
                          justifyContent={"space-between"}
                          gap="10px"
                          mt="5px"
                        >
                          <Button
                            p={2}
                            height={"20px"}
                            w="100%"
                            color="white"
                            bg="#133a75"
                            _focus={{}}
                            _active={{}}
                            _hover={{}}
                            onClick={() =>
                              setSliderValue((prev) => {
                                return [
                                  convertSciNotaToPrecise(
                                    String(
                                      Math.max(
                                        Number(prev[0]) -
                                          Number(formattedCurrentPrice) * 0.05,
                                        0
                                      )
                                    )
                                  ),
                                  prev[1],
                                ];
                              })
                            }
                          >
                            -5%
                          </Button>
                          <Button
                            p={2}
                            height={"20px"}
                            w="100%"
                            color="white"
                            bg="#133a75"
                            _focus={{}}
                            _active={{}}
                            _hover={{}}
                            onClick={() =>
                              setSliderValue((prev) => {
                                return [
                                  convertSciNotaToPrecise(
                                    String(
                                      Math.min(
                                        Number(prev[0]) +
                                          Number(formattedCurrentPrice) * 0.05,
                                        Number(
                                          formatUnits(
                                            BigInt(MAX_VIBES_PRICE),
                                            18
                                          )
                                        )
                                      )
                                    )
                                  ),
                                  prev[1],
                                ];
                              })
                            }
                          >
                            +5%
                          </Button>
                        </Flex>
                      </Flex>
                      <Flex direction="column">
                        <Text>higher price zone</Text>
                        <Text
                          textAlign={"center"}
                          fontSize="25px"
                          noOfLines={1}
                          color="#60e601"
                        >
                          {truncateValue(
                            formattedData.length > 0
                              ? (Number(
                                  parseUnits(
                                    convertSciNotaToPrecise(
                                      sliderValue[1]
                                    ) as `${number}`,
                                    18
                                  )
                                ) /
                                  formattedData[formattedData.length - 1]
                                    .price) *
                                  100
                              : 0,
                            2
                          )}
                          %
                        </Text>
                        <Input
                          variant={"greenGlow"}
                          value={sliderValue[1]}
                          onChange={(e) =>
                            setSliderValue((prev) => {
                              return [
                                prev[0],
                                filteredInput(e.target.value, true),
                              ];
                            })
                          }
                        />
                        <Flex
                          justifyContent={"space-between"}
                          gap="10px"
                          mt="5px"
                        >
                          <Button
                            p={2}
                            height={"20px"}
                            w="100%"
                            color="white"
                            bg="#133a75"
                            _focus={{}}
                            _active={{}}
                            _hover={{}}
                            onClick={() =>
                              setSliderValue((prev) => {
                                return [
                                  prev[0],
                                  convertSciNotaToPrecise(
                                    String(
                                      Math.max(
                                        Number(prev[1]) -
                                          Number(formattedCurrentPrice) * 0.05,
                                        0
                                      )
                                    )
                                  ),
                                ];
                              })
                            }
                          >
                            -5%
                          </Button>
                          <Button
                            p={2}
                            height={"20px"}
                            w="100%"
                            color="white"
                            bg="#133a75"
                            _focus={{}}
                            _active={{}}
                            _hover={{}}
                            onClick={() =>
                              setSliderValue((prev) => {
                                return [
                                  prev[0],
                                  convertSciNotaToPrecise(
                                    String(
                                      Math.min(
                                        Number(prev[1]) +
                                          Number(formattedCurrentPrice) * 0.05,
                                        Number(
                                          formatUnits(
                                            BigInt(MAX_VIBES_PRICE),
                                            18
                                          )
                                        )
                                      )
                                    )
                                  ),
                                ];
                              })
                            }
                          >
                            +5%
                          </Button>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Flex>
                </TransactionModalTemplate>
                <Button
                  color="white"
                  bg="#CB520E"
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
              {formattedHourData.length === 0 && timeFilter === "1h" && (
                <Text position="absolute" color="gray" top="50%">
                  no txs in last hour
                </Text>
              )}
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
                  <YAxis hide domain={["dataMin", "dataMax"]} />
                  <Tooltip content={<CustomTooltip />} />
                  {!allStreams && (
                    <ReferenceArea
                      fill="green"
                      fillOpacity={0.2}
                      y1={5804607846912}
                      y2={Number.MAX_SAFE_INTEGER}
                      ifOverflow="hidden"
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={false}
                  />
                  {!allStreams && (
                    <ReferenceArea
                      fill="red"
                      fillOpacity={0.2}
                      y1={0}
                      y2={4904607846912}
                      ifOverflow="hidden"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Flex>
            <Flex direction="column" justifyContent={"flex-end"} gap="10px">
              <Flex position="relative" gap="5px" alignItems={"center"}>
                <Input
                  variant="glow"
                  textAlign="center"
                  value={amountOfVibes}
                  onChange={handleInputChange}
                  mx="auto"
                  p="1"
                  fontSize={"14px"}
                />
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
                    vibesBalance && setAmountOfVibes(vibesBalance.formatted);
                  }}
                >
                  max
                </Button>
              </Flex>
              <Button
                color="white"
                _focus={{}}
                _hover={{}}
                _active={{}}
                bg="#46a800"
                isDisabled={!mint}
                onClick={mint}
              >
                BUY
              </Button>
              <Button
                color="white"
                _focus={{}}
                _hover={{}}
                _active={{}}
                bg="#fe2815"
                isDisabled={!burn}
                onClick={burn}
              >
                SELL
              </Button>
            </Flex>
          </Flex>
        </Flex>
      )}
    </>
  );
};

export default VibesTokenExchange;
