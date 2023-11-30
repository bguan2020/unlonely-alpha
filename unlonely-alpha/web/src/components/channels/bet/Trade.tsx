import Link from "next/link";
import { decodeEventLog, formatUnits } from "viem";
import {
  Flex,
  Box,
  Text,
  Button,
  useToast,
  Input,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useBalance, useBlockNumber } from "wagmi";

import { InteractionType, NULL_ADDRESS } from "../../../constants";
import { ChatReturnType } from "../../../hooks/chat/useChat";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { useNetworkContext } from "../../../hooks/context/useNetwork";
import {
  useBuyVotes,
  useGetPriceAfterFee,
  useReadMappings,
  useGenerateKey,
  useSellVotes,
  useGetHolderBalances,
  useClaimVotePayout,
} from "../../../hooks/contracts/useSharesContractV2";
import usePostBetTrade from "../../../hooks/server/gamblable/usePostBetTrade";
import { getContractFromNetwork } from "../../../utils/contract";
import { truncateValue } from "../../../utils/tokenDisplayFormatting";
import { filteredInput } from "../../../utils/validation/input";
import { useUser } from "../../../hooks/context/useUser";
import centerEllipses from "../../../utils/centerEllipses";
import { getTimeFromMillis } from "../../../utils/time";
import { GamblableEvent, SharesEventState } from "../../../generated/graphql";
import { CreateBet } from "./CreateBet";
import { JudgeBet } from "./JudgeBet";
import useUpdateSharesEvent from "../../../hooks/server/useUpdateSharesEvent";

const Trade = ({ chat }: { chat: ChatReturnType }) => {
  const { userAddress, walletIsConnected, user } = useUser();
  const { channel, chat: chatContext } = useChannelContext();
  const { channelQueryData } = channel;
  const { addToChatbot } = chatContext;

  const { network } = useNetworkContext();
  const { matchingChain, localNetwork, explorerUrl } = network;

  const [isBuying, setIsBuying] = useState<boolean>(true);
  const [isYay, setIsYay] = useState<boolean>(true);
  const [viewState, setViewState] = useState<
    "normal" | "create" | "choose winner"
  >("normal");
  const [amountOfVotes, setAmountOfVotes] = useState<string>("0");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [dateNow, setDateNow] = useState<number>(Date.now());
  const isFetching = useRef(false);
  const amount_bigint = useMemo(
    () => BigInt(amountOfVotes as `${number}`),
    [amountOfVotes]
  );

  const { data: userEthBalance, refetch: refetchUserEthBalance } = useBalance({
    address: userAddress as `0x${string}`,
  });

  const toast = useToast();

  const handleInputChange = (event: any) => {
    const input = event.target.value;
    const filtered = filteredInput(input);
    setAmountOfVotes(filtered);
  };

  const { postBetTrade } = usePostBetTrade({
    onError: (err) => {
      console.log(err);
    },
  });

  const v2contract = getContractFromNetwork("unlonelySharesV2", localNetwork);

  const {
    refetch: refetchBalances,
    yayVotesBalance,
    nayVotesBalance,
  } = useGetHolderBalances(
    (channelQueryData?.sharesEvent?.[0]
      ?.sharesSubjectAddress as `0x${string}`) ?? NULL_ADDRESS,
    Number(channelQueryData?.sharesEvent?.[0]?.id ?? "0"),
    userAddress as `0x${string}`,
    isYay,
    v2contract
  );

  const { priceAfterFee: votePrice, refetch: refetchVotePrice } =
    useGetPriceAfterFee(
      channelQueryData?.owner?.address as `0x${string}`,
      Number(channelQueryData?.sharesEvent?.[0]?.id ?? "0"),
      BigInt(amountOfVotes),
      isYay,
      isBuying,
      v2contract
    );

  const { key: generatedKey } = useGenerateKey(
    channelQueryData?.owner?.address as `0x${string}`,
    Number(channelQueryData?.sharesEvent?.[0]?.id ?? "0"),
    v2contract
  );

  const {
    yayVotesSupply,
    nayVotesSupply,
    eventEndTimestamp,
    votingPooledEth,
    userPayout,
    eventVerified,
    eventResult,
    refetch: refetchMappings,
  } = useReadMappings(
    generatedKey,
    (channelQueryData?.sharesEvent?.[0]
      ?.sharesSubjectAddress as `0x${string}`) ?? NULL_ADDRESS,
    Number(channelQueryData?.sharesEvent?.[0]?.id ?? "0"),
    v2contract
  );

  const {
    buyVotes,
    refetch: refetchBuyVotes,
    isRefetchingBuyVotes,
  } = useBuyVotes(
    {
      eventAddress:
        (channelQueryData?.sharesEvent?.[0]
          ?.sharesSubjectAddress as `0x${string}`) ?? NULL_ADDRESS,
      eventId: Number(channelQueryData?.sharesEvent?.[0]?.id ?? "0"),
      isYay,
      amountOfVotes: amount_bigint,
      value: votePrice,
    },
    v2contract,
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
                buyVotes pending, click to view
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
              buyVotes cancelled
            </Box>
          ),
        });
      },
      onTxSuccess: async (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                buyVotes success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        setAmountOfVotes("0");
        const topics = decodeEventLog({
          abi: v2contract.abi,
          data: data.logs[0].data,
          topics: data.logs[0].topics,
        });
        const args: any = topics.args;
        const title = `${user?.username ?? centerEllipses(userAddress, 15)} ${
          args.trade.isBuy ? "bought" : "sold"
        } ${args.trade.shareAmount} ${args.trade.isYay ? "yes" : "no"} votes!`;
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.BUY_VOTES,
          title,
          description: `${
            user?.username ?? centerEllipses(userAddress ?? "", 15)
          }:${args.trade.shareAmount}:${args.trade.isYay ? "yay" : "nay"}`,
        });
        await postBetTrade({
          channelId: channelQueryData?.id as string,
          userAddress: userAddress as `0x${string}`,
          chainId: localNetwork.config.chainId,
          type: args.trade.isYay
            ? GamblableEvent.BetYesBuy
            : GamblableEvent.BetNoBuy,
          sharesEventId: Number(channelQueryData?.sharesEvent?.[0]?.id ?? "0"),
          fees: Number(formatUnits(args.trade.subjectEthAmount, 18)),
        });
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              buyVotes error
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
    }
  );

  const {
    sellVotes,
    refetch: refetchSellVotes,
    isRefetchingSellVotes,
  } = useSellVotes(
    {
      eventAddress: channelQueryData?.sharesEvent?.[0]
        ?.sharesSubjectAddress as `0x${string}`,
      eventId: Number(channelQueryData?.sharesEvent?.[0]?.id ?? "0"),
      isYay,
      amountOfVotes: amount_bigint,
    },
    v2contract,
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
                sellVotes pending, click to view
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
              sellVotes cancelled
            </Box>
          ),
        });
      },
      onTxSuccess: async (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                sellVotes success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        setAmountOfVotes("0");
        const topics = decodeEventLog({
          abi: v2contract.abi,
          data: data.logs[0].data,
          topics: data.logs[0].topics,
        });
        const args: any = topics.args;
        const title = `${user?.username ?? centerEllipses(userAddress, 15)} ${
          args.trade.isBuy ? "bought" : "sold"
        } ${args.trade.shareAmount} ${args.trade.isYay ? "yes" : "no"} votes!`;
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.SELL_VOTES,
          title,
          description: `${
            user?.username ?? centerEllipses(userAddress ?? "", 15)
          }:${args.trade.shareAmount}:${args.trade.isYay ? "yay" : "nay"}`,
        });
        await postBetTrade({
          channelId: channelQueryData?.id as string,
          userAddress: userAddress as `0x${string}`,
          chainId: localNetwork.config.chainId,
          type: args.trade.isYay
            ? GamblableEvent.BetYesSell
            : GamblableEvent.BetNoSell,
          fees: Number(formatUnits(args.trade.subjectEthAmount, 18)),
        });
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              sellVotes error
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
    }
  );

  const { claimVotePayout, refetch: refetchClaimVotePayout } =
    useClaimVotePayout(
      {
        eventAddress: channelQueryData?.sharesEvent?.[0]
          ?.sharesSubjectAddress as `0x${string}`,
        eventId: Number(channelQueryData?.sharesEvent?.[0]?.id ?? "0"),
      },
      v2contract,
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
                  claimVotePayout pending, click to view
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
                claimVotePayout cancelled
              </Box>
            ),
          });
        },
        onTxSuccess: async (data) => {
          toast({
            render: () => (
              <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
                <Link
                  target="_blank"
                  href={`${explorerUrl}/tx/${data.transactionHash}`}
                  passHref
                >
                  claimVotePayout success, click to view
                </Link>
              </Box>
            ),
            duration: 9000,
            isClosable: true,
            position: "top-right",
          });
        },
        onTxError: (error) => {
          toast({
            render: () => (
              <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
                claimVotePayout error
              </Box>
            ),
            duration: 9000,
            isClosable: true,
            position: "top-right",
          });
        },
      }
    );

  const blockNumber = useBlockNumber({
    watch: true,
  });
  const { updateSharesEvent, loading: updateSharesEventLoading } =
    useUpdateSharesEvent({});
  const doesEventExist = useMemo(() => {
    if (!channelQueryData?.sharesEvent) return false;
    if (!channelQueryData?.sharesEvent?.[0]?.sharesSubjectAddress) return false;
    if (!channelQueryData?.sharesEvent?.[0]?.id) return false;
    return true;
  }, [channelQueryData?.sharesEvent]);

  const isSharesEventLive =
    channelQueryData?.sharesEvent?.[0]?.eventState === SharesEventState.Live;
  const isSharesEventLock =
    channelQueryData?.sharesEvent?.[0]?.eventState === SharesEventState.Lock;
  const isSharesEventPayout =
    channelQueryData?.sharesEvent?.[0]?.eventState === SharesEventState.Payout;
  const isOwner = userAddress === channelQueryData?.owner.address;
  const eventEndTimestampPassed = Number(eventEndTimestamp) * 1000 <= dateNow;
  const isEventOver =
    eventEndTimestampPassed ||
    channelQueryData?.sharesEvent?.[0]?.eventState === SharesEventState.Payout;

  const _updateSharesEvent = useCallback(
    async (eventState: SharesEventState) => {
      await updateSharesEvent({
        id: channelQueryData?.sharesEvent?.[0]?.id ?? "",
        sharesSubjectQuestion:
          channelQueryData?.sharesEvent?.[0]?.sharesSubjectQuestion ?? "",
        sharesSubjectAddress:
          channelQueryData?.sharesEvent?.[0]?.sharesSubjectAddress ?? "",
        eventState,
      });
      if (eventState === SharesEventState.Live) {
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.EVENT_LIVE,
          title: "Event is live!",
          description: "event-live",
        });
      }
      if (eventState === SharesEventState.Lock) {
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.EVENT_LOCK,
          title: "Event is locked!",
          description: "event-lock",
        });
      }
    },
    [channelQueryData, user, userAddress]
  );

  useEffect(() => {
    if (!blockNumber.data || isFetching.current) return;
    const fetch = async () => {
      isFetching.current = true;
      try {
        await Promise.all([
          refetchBalances(),
          refetchVotePrice(),
          refetchBuyVotes(),
          refetchSellVotes(),
          refetchMappings(),
          refetchClaimVotePayout(),
          refetchUserEthBalance(),
        ]);
      } catch (err) {
        console.log("vote fetching error", err);
      }
      setDateNow(Date.now());
      isFetching.current = false;
    };
    fetch();
  }, [blockNumber.data]);

  useEffect(() => {
    if (!walletIsConnected) {
      setErrorMessage("connect wallet first");
    } else if (!matchingChain) {
      setErrorMessage("wrong network");
    } else if (
      !isBuying &&
      ((isYay && Number(yayVotesBalance) < Number(amountOfVotes)) ||
        (!isYay && Number(nayVotesBalance) < Number(amountOfVotes))) &&
      doesEventExist &&
      !isEventOver
    ) {
      setErrorMessage("insufficient votes to sell");
    } else if (
      isBuying &&
      userEthBalance?.value &&
      votePrice > userEthBalance?.value &&
      doesEventExist &&
      !isEventOver
    ) {
      setErrorMessage("insufficient ETH to spend");
    } else if (
      isBuying &&
      Number(amountOfVotes) === 0 &&
      doesEventExist &&
      !isEventOver
    ) {
      setErrorMessage("enter amount first");
    } else {
      setErrorMessage("");
    }
  }, [
    walletIsConnected,
    matchingChain,
    userEthBalance,
    isBuying,
    votePrice,
    yayVotesBalance,
    nayVotesBalance,
    amountOfVotes,
    dateNow,
    eventEndTimestamp,
    doesEventExist,
    isEventOver,
  ]);

  return (
    <Flex direction="column" height="100%">
      {isOwner && walletIsConnected && (
        <Flex
          justifyContent={"space-between"}
          gap="5px"
          p="5px"
          bg={"rgba(255, 255, 255, 0.1)"}
          borderRadius="5px"
        >
          {(isSharesEventPayout || votingPooledEth === BigInt(0)) && (
            <>
              <Button
                _hover={{}}
                _focus={{}}
                _active={{}}
                bg={"#E09025"}
                p="5px !important"
                w="100%"
                onClick={() =>
                  setViewState((prev) =>
                    prev === "create" ? "normal" : "create"
                  )
                }
              >
                <Text fontSize={"18px"} fontFamily="LoRes15">
                  create bet
                </Text>
              </Button>
            </>
          )}
          {doesEventExist && isSharesEventLive && !eventEndTimestampPassed && (
            <>
              <Button
                _hover={{}}
                _focus={{}}
                _active={{}}
                bg={"#E09025"}
                p="5px !important"
                w="100%"
                onClick={async () =>
                  await _updateSharesEvent(SharesEventState.Lock)
                }
              >
                <Text fontSize={"18px"} fontFamily="LoRes15">
                  lock bet
                </Text>
              </Button>
              <Button
                _hover={{}}
                _focus={{}}
                _active={{}}
                bg={"#E09025"}
                p="5px !important"
                w="100%"
                onClick={() =>
                  setViewState((prev) =>
                    prev === "choose winner" ? "normal" : "choose winner"
                  )
                }
              >
                <Text fontSize={"18px"} fontFamily="LoRes15">
                  select winner
                </Text>
              </Button>
              {votingPooledEth === BigInt(0) && (
                <Button
                  _hover={{}}
                  _focus={{}}
                  _active={{}}
                  bg={"#E09025"}
                  p="5px !important"
                  w="100%"
                  onClick={() =>
                    setViewState((prev) =>
                      prev === "create" ? "normal" : "create"
                    )
                  }
                >
                  <Text fontSize={"18px"} fontFamily="LoRes15">
                    create bet
                  </Text>
                </Button>
              )}
            </>
          )}
          {doesEventExist && (isSharesEventLock || eventEndTimestampPassed) && (
            <>
              {!eventEndTimestampPassed && (
                <Button
                  _hover={{}}
                  _focus={{}}
                  _active={{}}
                  bg={"#E09025"}
                  p="5px !important"
                  w="100%"
                  onClick={async () =>
                    await _updateSharesEvent(SharesEventState.Live)
                  }
                >
                  <Text fontSize={"18px"} fontFamily="LoRes15">
                    resume bet
                  </Text>
                </Button>
              )}
              {!isSharesEventPayout && (
                <Button
                  _hover={{}}
                  _focus={{}}
                  _active={{}}
                  bg={"#E09025"}
                  p="5px !important"
                  w="100%"
                  onClick={() =>
                    setViewState((prev) =>
                      prev === "choose winner" ? "normal" : "choose winner"
                    )
                  }
                >
                  <Text fontSize={"18px"} fontFamily="LoRes15">
                    select winner
                  </Text>
                </Button>
              )}
            </>
          )}
        </Flex>
      )}
      {doesEventExist && viewState !== "create" && (
        <>
          <Text textAlign={"center"} fontSize={"20px"} fontWeight={"bold"}>
            {channelQueryData?.sharesEvent?.[0]?.sharesSubjectQuestion}
          </Text>
          <Text textAlign={"center"} fontSize="14px" color="#f8f53b">
            {truncateValue(formatUnits(votingPooledEth, 18), 4)} ETH in the pool
          </Text>
        </>
      )}
      {!doesEventExist && errorMessage && (
        <Text textAlign={"center"} color="red.400">
          {errorMessage}
        </Text>
      )}
      {viewState === "normal" && (
        <>
          {!doesEventExist ? (
            <>
              {isOwner ? (
                <CreateBet handleClose={() => setViewState("normal")} />
              ) : (
                <Text textAlign={"center"}>
                  there is no event at the moment
                </Text>
              )}
            </>
          ) : (
            <>
              {!eventEndTimestampPassed &&
                channelQueryData?.sharesEvent?.[0]?.eventState === "LIVE" && (
                  <>
                    <Flex justifyContent={"space-around"} gap="5px">
                      <Flex gap="5px" w="100%">
                        <Button
                          bg={isYay ? "#46a800" : "transparent"}
                          border={!isYay ? "1px solid #46a800" : undefined}
                          _focus={{}}
                          _hover={{}}
                          _active={{}}
                          onClick={() => setIsYay(true)}
                          w="100%"
                        >
                          <Flex alignItems={"center"} gap="2px">
                            <Text>
                              {channelQueryData.sharesEvent?.[0]
                                ?.answers?.[0] ?? "YES"}
                            </Text>
                          </Flex>
                        </Button>
                        <Button
                          bg={!isYay ? "#fe2815" : "transparent"}
                          border={isYay ? "1px solid #fe2815" : undefined}
                          _focus={{}}
                          _hover={{}}
                          _active={{}}
                          onClick={() => setIsYay(false)}
                          w="100%"
                        >
                          <Flex alignItems={"center"} gap="2px">
                            <Text>
                              {channelQueryData.sharesEvent?.[0]
                                ?.answers?.[1] ?? "NO"}
                            </Text>
                          </Flex>
                        </Button>
                      </Flex>
                    </Flex>
                    <Flex direction="column" borderRadius="15px" pt="0.5rem">
                      <Flex justifyContent={"space-between"}>
                        <Flex direction="column">
                          <Text fontSize="14px" textAlign="center">
                            #
                          </Text>
                          <Flex alignItems={"center"}>
                            <Input
                              textAlign="center"
                              width={"70px"}
                              value={amountOfVotes}
                              onChange={handleInputChange}
                            />
                          </Flex>
                        </Flex>
                        <Flex direction="column">
                          <Text fontSize="14px" textAlign="center">
                            ETH {isBuying ? "price" : "return"}
                          </Text>
                          <Text whiteSpace={"nowrap"} margin="auto">
                            {truncateValue(formatUnits(votePrice, 18), 4)}
                          </Text>
                        </Flex>
                        <Flex direction="column">
                          <Text fontSize="14px" textAlign="center">
                            own
                          </Text>
                          <Text whiteSpace={"nowrap"} margin="auto">
                            {isYay ? yayVotesBalance : nayVotesBalance}
                          </Text>
                        </Flex>
                      </Flex>
                      <Text>
                        Time to close:{" "}
                        {getTimeFromMillis(
                          Number(eventEndTimestamp) * 1000 - dateNow
                        )}
                      </Text>
                      {errorMessage && (
                        <Text textAlign={"center"} color="red.400">
                          {errorMessage}
                        </Text>
                      )}
                      <Button
                        bg={
                          isBuying && isYay
                            ? "#46a800"
                            : isBuying && !isYay
                            ? "#fe2815"
                            : !isBuying && !isYay
                            ? "#46a800"
                            : "#fe2815"
                        }
                        _focus={{}}
                        _hover={{}}
                        _active={{}}
                        onClick={() =>
                          isBuying ? buyVotes?.() : sellVotes?.()
                        }
                        disabled={
                          (isBuying && !buyVotes) ||
                          (!isBuying && !sellVotes) ||
                          isRefetchingBuyVotes ||
                          isRefetchingSellVotes
                        }
                      >
                        {isRefetchingBuyVotes || isRefetchingSellVotes ? (
                          <Spinner />
                        ) : isBuying ? (
                          "BUY"
                        ) : (
                          "SELL"
                        )}
                      </Button>
                    </Flex>
                  </>
                )}
              {eventEndTimestampPassed &&
                channelQueryData?.sharesEvent?.[0]?.eventState === "LIVE" && (
                  <>
                    <Flex justifyContent={"space-evenly"} my="10px">
                      <Text color="#35b657" fontWeight="bold" fontSize="25px">
                        {truncateValue(String(yayVotesSupply), 0, true)} YES
                      </Text>
                      <Text color="#ff623b" fontWeight="bold" fontSize="25px">
                        {truncateValue(String(nayVotesSupply), 0, true)} NO
                      </Text>
                    </Flex>
                    <Text textAlign={"center"} fontSize="14px">
                      The time for voting has ended
                    </Text>
                  </>
                )}
              {channelQueryData?.sharesEvent?.[0]?.eventState === "LOCK" && (
                <>
                  <Flex justifyContent={"space-evenly"} my="10px">
                    <Text color="#35b657" fontWeight="bold" fontSize="25px">
                      {truncateValue(String(yayVotesSupply), 0, true)} YES
                    </Text>
                    <Text color="#ff623b" fontWeight="bold" fontSize="25px">
                      {truncateValue(String(nayVotesSupply), 0, true)} NO
                    </Text>
                  </Flex>
                  <Text textAlign={"center"} fontSize="14px" color="#e49c16">
                    voting disabled
                  </Text>
                </>
              )}
              {channelQueryData?.sharesEvent?.[0]?.eventState === "PAYOUT" &&
                eventVerified && (
                  <>
                    <Flex justifyContent="space-between">
                      <Text fontSize="18px">event outcome</Text>
                      <Text
                        fontSize="18px"
                        fontWeight="bold"
                        color={eventResult === true ? "#02f042" : "#ee6204"}
                      >
                        {eventResult ? "Yes" : "No"}
                      </Text>
                    </Flex>
                    <Flex justifyContent="space-between">
                      <Text fontSize="18px">your winnings</Text>
                      <Text fontSize="18px">
                        {truncateValue(formatUnits(userPayout, 18))} ETH
                      </Text>
                    </Flex>
                    {userPayout > BigInt(0) && (
                      <Button
                        _hover={{}}
                        _focus={{}}
                        _active={{}}
                        bg={"#E09025"}
                        borderRadius="25px"
                        isDisabled={!claimVotePayout}
                        onClick={claimVotePayout}
                        width="100%"
                      >
                        <Text fontSize="20px">get payout</Text>
                      </Button>
                    )}
                  </>
                )}
            </>
          )}
        </>
      )}
      {viewState === "create" && (
        <CreateBet handleClose={() => setViewState("normal")} />
      )}
      {viewState === "choose winner" && (
        <JudgeBet handleClose={() => setViewState("normal")} />
      )}
    </Flex>
  );
};

export default Trade;
