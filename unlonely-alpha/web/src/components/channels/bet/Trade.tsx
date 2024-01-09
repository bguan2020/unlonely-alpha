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
import { AddIcon } from "@chakra-ui/icons";

import { InteractionType, NULL_ADDRESS } from "../../../constants";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { useNetworkContext } from "../../../hooks/context/useNetwork";
import {
  useBuyVotes,
  useGetPriceAfterFee,
  useReadMappings,
  useGenerateKey,
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
import {
  EventType,
  GamblableEvent,
  SharesEventState,
} from "../../../generated/graphql";
import { CreateBet } from "./CreateBet";
import { JudgeBet } from "./JudgeBet";
import useUpdateSharesEvent from "../../../hooks/server/useUpdateSharesEvent";
import usePostClaimPayout from "../../../hooks/server/usePostClaimPayout";
import useCloseSharesEvent from "../../../hooks/server/useCloseSharesEvent";
import useDebounce from "../../../hooks/internal/useDebounce";
import useUserAgent from "../../../hooks/internal/useUserAgent";

const Trade = () => {
  const { userAddress, walletIsConnected, user } = useUser();
  const { isStandalone } = useUserAgent();
  const { channel, chat: chatContext, ui } = useChannelContext();
  const { channelQueryData, ongoingBets, refetch } = channel;
  const { addToChatbot } = chatContext;
  const { tradeLoading } = ui;

  const { network } = useNetworkContext();
  const { matchingChain, localNetwork, explorerUrl } = network;

  const [isBuying, setIsBuying] = useState<boolean>(true);
  const [isYay, setIsYay] = useState<boolean>(true);
  const [viewState, setViewState] = useState<
    "normal" | "create" | "choose winner"
  >("normal");
  const [amountOfVotes, setAmountOfVotes] = useState<string>("1");
  const debouncedAmountOfVotes = useDebounce(amountOfVotes, 300);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [dateNow, setDateNow] = useState<number>(Date.now());
  const isFetching = useRef(false);
  const amount_bigint = useMemo(
    () => BigInt(debouncedAmountOfVotes as `${number}`),
    [debouncedAmountOfVotes]
  );

  const { data: userEthBalance } = useBalance({
    address: userAddress as `0x${string}`,
    watch: true,
  });

  const toast = useToast();

  useEffect(() => {
    if (
      userAddress === channelQueryData?.owner.address &&
      ongoingBets?.[0]?.eventState === SharesEventState.Pending
    ) {
      setViewState("create");
    } else {
      setViewState("normal");
    }
  }, [
    userAddress === channelQueryData?.owner.address,
    ongoingBets?.[0]?.eventState === SharesEventState.Pending,
  ]);

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
  const { postClaimPayout } = usePostClaimPayout({
    onError: (err) => {
      console.log(err);
    },
  });
  const { closeSharesEvents } = useCloseSharesEvent({
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
    (ongoingBets?.[0]?.sharesSubjectAddress as `0x${string}`) ?? NULL_ADDRESS,
    Number(ongoingBets?.[0]?.id ?? "0"),
    userAddress as `0x${string}`,
    isYay,
    v2contract
  );

  const { priceAfterFee: votePrice, refetch: refetchVotePrice } =
    useGetPriceAfterFee(
      channelQueryData?.owner?.address as `0x${string}`,
      Number(ongoingBets?.[0]?.id ?? "0"),
      amount_bigint,
      isYay,
      isBuying,
      v2contract
    );

  const { key: generatedKey } = useGenerateKey(
    channelQueryData?.owner?.address as `0x${string}`,
    Number(ongoingBets?.[0]?.id ?? "0"),
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
    isVerifier,
    refetch: refetchMappings,
  } = useReadMappings(
    generatedKey,
    (ongoingBets?.[0]?.sharesSubjectAddress as `0x${string}`) ?? NULL_ADDRESS,
    Number(ongoingBets?.[0]?.id ?? "0"),
    v2contract
  );

  const {
    buyVotes,
    refetch: refetchBuyVotes,
    isRefetchingBuyVotes,
  } = useBuyVotes(
    {
      eventAddress:
        (ongoingBets?.[0]?.sharesSubjectAddress as `0x${string}`) ??
        NULL_ADDRESS,
      eventId: Number(ongoingBets?.[0]?.id ?? "0"),
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
        setAmountOfVotes("1");
        const topics = decodeEventLog({
          abi: v2contract.abi,
          data: data.logs[0].data,
          topics: data.logs[0].topics,
        });
        const args: any = topics.args;
        const title = `${user?.username ?? centerEllipses(userAddress, 15)} ${
          args.trade.isBuy ? "bought" : "sold"
        } ${args.trade.shareAmount} ${
          args.trade.isYay
            ? ongoingBets?.[0]?.options?.[0] ?? "yes"
            : ongoingBets?.[0]?.options?.[1] ?? "no"
        } vote${Number(args.trade.shareAmount) > 1 ? "s" : ""}!`;
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.BUY_VOTES,
          title,
          description: `${
            user?.username ?? centerEllipses(userAddress ?? "", 15)
          }:${args.trade.shareAmount}:${
            args.trade.isYay
              ? ongoingBets?.[0]?.options?.[0] ?? "yay"
              : ongoingBets?.[0]?.options?.[1] ?? "nay"
          }`,
        });
        await postBetTrade({
          channelId: channelQueryData?.id as string,
          userAddress: userAddress as `0x${string}`,
          chainId: localNetwork.config.chainId,
          type: args.trade.isYay
            ? GamblableEvent.BetYesBuy
            : GamblableEvent.BetNoBuy,
          eventId: Number(ongoingBets?.[0]?.id ?? "0"),
          eventType: EventType.YayNayVote,
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

  // const {
  //   sellVotes,
  //   refetch: refetchSellVotes,
  //   isRefetchingSellVotes,
  // } = useSellVotes(
  //   {
  //     eventAddress: ongoingBets?.[0]?.sharesSubjectAddress as `0x${string}`,
  //     eventId: Number(ongoingBets?.[0]?.id ?? "0"),
  //     isYay,
  //     amountOfVotes: amount_bigint,
  //   },
  //   v2contract,
  //   {
  //     onWriteSuccess: (data) => {
  //       toast({
  //         render: () => (
  //           <Box as="button" borderRadius="md" bg="#287ab0" px={4} h={8}>
  //             <Link
  //               target="_blank"
  //               href={`${explorerUrl}/tx/${data.hash}`}
  //               passHref
  //             >
  //               sellVotes pending, click to view
  //             </Link>
  //           </Box>
  //         ),
  //         duration: 9000,
  //         isClosable: true,
  //         position: "top-right",
  //       });
  //     },
  //     onWriteError: (error) => {
  //       toast({
  //         duration: 9000,
  //         isClosable: true,
  //         position: "top-right",
  //         render: () => (
  //           <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
  //             sellVotes cancelled
  //           </Box>
  //         ),
  //       });
  //     },
  //     onTxSuccess: async (data) => {
  //       toast({
  //         render: () => (
  //           <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
  //             <Link
  //               target="_blank"
  //               href={`${explorerUrl}/tx/${data.transactionHash}`}
  //               passHref
  //             >
  //               sellVotes success, click to view
  //             </Link>
  //           </Box>
  //         ),
  //         duration: 9000,
  //         isClosable: true,
  //         position: "top-right",
  //       });
  //       setAmountOfVotes("1");
  //       const topics = decodeEventLog({
  //         abi: v2contract.abi,
  //         data: data.logs[0].data,
  //         topics: data.logs[0].topics,
  //       });
  //       const args: any = topics.args;
  //       const title = `${user?.username ?? centerEllipses(userAddress, 15)} ${
  //         args.trade.isBuy ? "bought" : "sold"
  //       } ${args.trade.shareAmount} ${args.trade.isYay ? "yes" : "no"} votes!`;
  //       addToChatbot({
  //         username: user?.username ?? "",
  //         address: userAddress ?? "",
  //         taskType: InteractionType.SELL_VOTES,
  //         title,
  //         description: `${
  //           user?.username ?? centerEllipses(userAddress ?? "", 15)
  //         }:${args.trade.shareAmount}:${args.trade.isYay ? "yay" : "nay"}`,
  //       });
  //       await postBetTrade({
  //         channelId: channelQueryData?.id as string,
  //         userAddress: userAddress as `0x${string}`,
  //         chainId: localNetwork.config.chainId,
  //         type: args.trade.isYay
  //           ? GamblableEvent.BetYesSell
  //           : GamblableEvent.BetNoSell,
  //         fees: Number(formatUnits(args.trade.subjectEthAmount, 18)),
  //       });
  //     },
  //     onTxError: (error) => {
  //       toast({
  //         render: () => (
  //           <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
  //             sellVotes error
  //           </Box>
  //         ),
  //         duration: 9000,
  //         isClosable: true,
  //         position: "top-right",
  //       });
  //     },
  //   }
  // );

  const { claimVotePayout, refetch: refetchClaimVotePayout } =
    useClaimVotePayout(
      {
        eventAddress: ongoingBets?.[0]?.sharesSubjectAddress as `0x${string}`,
        eventId: Number(ongoingBets?.[0]?.id ?? "0"),
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
          const topics = decodeEventLog({
            abi: v2contract.abi,
            data: data.logs[0].data,
            topics: data.logs[0].topics,
          });
          const args: any = topics.args;
          await postClaimPayout({
            channelId: channelQueryData?.id as string,
            userAddress: userAddress as `0x${string}`,
            eventId: Number(ongoingBets?.[0]?.id ?? "0"),
            eventType: EventType.YayNayVote,
          });
          if (args.votingPooledEth === BigInt(0)) {
            await closeSharesEvents({
              chainId: localNetwork.config.chainId,
              channelId: channelQueryData?.id as string,
              sharesEventIds: [Number(ongoingBets?.[0]?.id ?? "0")],
            });
          }
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
    if (!ongoingBets) return false;
    if (!ongoingBets?.[0]?.sharesSubjectAddress) return false;
    if (!ongoingBets?.[0]?.id) return false;
    return true;
  }, [ongoingBets]);

  const isSharesEventPending =
    ongoingBets?.[0]?.eventState === SharesEventState.Pending;
  const isSharesEventLive =
    ongoingBets?.[0]?.eventState === SharesEventState.Live;
  const isSharesEventLock =
    ongoingBets?.[0]?.eventState === SharesEventState.Lock;
  const isSharesEventPayout =
    ongoingBets?.[0]?.eventState === SharesEventState.Payout;
  const isSharesEventPayoutPrevious =
    ongoingBets?.[0]?.eventState === SharesEventState.PayoutPrevious;
  const isOwner = userAddress === channelQueryData?.owner.address;
  const eventEndTimestampPassed = Number(eventEndTimestamp) * 1000 <= dateNow;
  const isEventOver =
    eventEndTimestampPassed ||
    ongoingBets?.[0]?.eventState === SharesEventState.Payout;

  const _updateSharesEvent = useCallback(
    async (eventState: SharesEventState) => {
      await updateSharesEvent({
        id: ongoingBets?.[0]?.id ?? "",
        sharesSubjectQuestion: ongoingBets?.[0]?.sharesSubjectQuestion ?? "",
        sharesSubjectAddress: ongoingBets?.[0]?.sharesSubjectAddress ?? "",
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
      await refetch();
    },
    [ongoingBets, user, userAddress]
  );

  useEffect(() => {
    if (!blockNumber.data || isFetching.current) return;
    let calls: any[] = [refetchMappings()];
    if (doesEventExist && isSharesEventLive) {
      calls = calls.concat([
        refetchVotePrice(),
        refetchBuyVotes(),
        // refetchSellVotes(),
        refetchBalances(),
      ]);
    }
    if (doesEventExist && isSharesEventLock) {
      calls = calls.concat([refetchBalances()]);
    }
    if (doesEventExist && isSharesEventPayout) {
      calls = calls.concat([refetchBalances(), refetchClaimVotePayout()]);
    }
    const fetch = async () => {
      isFetching.current = true;
      try {
        await Promise.all(calls);
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
      ((isYay && Number(yayVotesBalance) < Number(debouncedAmountOfVotes)) ||
        (!isYay && Number(nayVotesBalance) < Number(debouncedAmountOfVotes))) &&
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
      Number(debouncedAmountOfVotes) === 0 &&
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
    debouncedAmountOfVotes,
    dateNow,
    eventEndTimestamp,
    doesEventExist,
    isEventOver,
  ]);

  return (
    <Flex
      direction="column"
      height="100%"
      position={"relative"}
      justifyContent="space-between"
    >
      {tradeLoading && (
        <Text fontSize="12px" color="#1cfff0" position="absolute" top="-15px">
          <Spinner size="xs" /> updating interface...
        </Text>
      )}
      {isOwner && walletIsConnected && (
        <Flex
          justifyContent={"space-between"}
          gap="5px"
          bg={"rgba(255, 255, 255, 0.1)"}
          borderRadius="5px"
          mb="10px"
        >
          {(isSharesEventPayout ||
            isSharesEventPayoutPrevious ||
            votingPooledEth === BigInt(0)) &&
            !isSharesEventPending && (
              <>
                <Button
                  color="white"
                  _hover={{}}
                  _focus={{}}
                  _active={{}}
                  bg={viewState === "create" ? "#1b9d9d" : "#E09025"}
                  p="5px !important"
                  w="100%"
                  isDisabled={tradeLoading}
                  onClick={() =>
                    setViewState((prev) =>
                      prev === "create" ? "normal" : "create"
                    )
                  }
                >
                  <Text fontSize={"20px"} fontFamily="LoRes15">
                    {doesEventExist ? (
                      <>
                        {(isSharesEventLive || isSharesEventLock) &&
                        votingPooledEth === BigInt(0)
                          ? "replace bet"
                          : "create bet"}
                      </>
                    ) : (
                      "create bet"
                    )}
                  </Text>
                </Button>
              </>
            )}
          {doesEventExist &&
            isSharesEventLive &&
            !eventEndTimestampPassed &&
            eventEndTimestamp > 0 && (
              <>
                <Button
                  color="white"
                  _hover={{}}
                  _focus={{}}
                  _active={{}}
                  p="5px !important"
                  w="100%"
                  bg={viewState === "choose winner" ? "#1b9d9d" : "#E09025"}
                  isDisabled={tradeLoading}
                  onClick={() =>
                    setViewState((prev) =>
                      prev === "choose winner" ? "normal" : "choose winner"
                    )
                  }
                >
                  <Text fontSize={"20px"} fontFamily="LoRes15">
                    select winner
                  </Text>
                </Button>
                <Button
                  color="white"
                  _hover={{}}
                  _focus={{}}
                  _active={{}}
                  bg={"#E09025"}
                  p="5px !important"
                  w="100%"
                  isLoading={updateSharesEventLoading}
                  isDisabled={tradeLoading}
                  onClick={async () =>
                    await _updateSharesEvent(SharesEventState.Lock)
                  }
                >
                  <Text fontSize={"20px"} fontFamily="LoRes15">
                    lock bet
                  </Text>
                </Button>
              </>
            )}
          {doesEventExist &&
            (isSharesEventLock ||
              (eventEndTimestamp > 0 && eventEndTimestampPassed)) && (
              <>
                {!isSharesEventPayout && !isSharesEventPayoutPrevious && (
                  <Button
                    color="white"
                    _hover={{}}
                    _focus={{}}
                    _active={{}}
                    bg={viewState === "choose winner" ? "#1b9d9d" : "#E09025"}
                    p="5px !important"
                    w="100%"
                    isDisabled={tradeLoading}
                    onClick={() =>
                      setViewState((prev) =>
                        prev === "choose winner" ? "normal" : "choose winner"
                      )
                    }
                  >
                    <Text fontSize={"20px"} fontFamily="LoRes15">
                      select winner
                    </Text>
                  </Button>
                )}
                {!eventEndTimestampPassed && eventEndTimestamp > 0 && (
                  <Button
                    color="white"
                    _hover={{}}
                    _focus={{}}
                    _active={{}}
                    bg={isSharesEventLock ? "#1b9d9d" : "#E09025"}
                    p="5px !important"
                    w="100%"
                    isLoading={updateSharesEventLoading}
                    isDisabled={tradeLoading}
                    onClick={async () =>
                      await _updateSharesEvent(SharesEventState.Live)
                    }
                  >
                    <Text fontSize={"20px"} fontFamily="LoRes15">
                      unlock bet
                    </Text>
                  </Button>
                )}
              </>
            )}
        </Flex>
      )}
      {doesEventExist &&
        viewState !== "create" &&
        ongoingBets?.[0].eventState !== SharesEventState.PayoutPrevious && (
          <Flex
            direction={"column"}
            gap="5px"
            p="5px"
            bg={"rgba(0, 0, 0, 0.4)"}
            borderRadius="15px"
            mb={"10px"}
          >
            <Text textAlign={"center"} fontSize={"20px"} fontWeight={"bold"}>
              {ongoingBets?.[0]?.sharesSubjectQuestion}
            </Text>
            <Text textAlign={"center"} fontSize="14px" color="#f8f53b">
              {truncateValue(formatUnits(votingPooledEth, 18), 4)} ETH in the
              pool
            </Text>
          </Flex>
        )}
      {!doesEventExist && errorMessage && !isOwner && (
        <Text textAlign={"center"} color="red.400">
          {errorMessage}
        </Text>
      )}
      {viewState === "normal" && (
        <>
          {!doesEventExist ||
          (doesEventExist &&
            ongoingBets?.[0].eventState === SharesEventState.PayoutPrevious) ? (
            <>
              <Text textAlign={"center"}>there is no event at the moment</Text>
              <Flex justifyContent={"center"}>
                <Link
                  href={"/claim"}
                  target={isStandalone ? "_self" : "_blank"}
                  style={{ textDecoration: "underline" }}
                >
                  <Text fontSize="12px"> go to claim page</Text>
                </Link>
              </Flex>
            </>
          ) : (
            <>
              {!eventEndTimestampPassed &&
              eventEndTimestamp > BigInt(0) &&
              ongoingBets?.[0]?.eventState === "LIVE" ? (
                <>
                  <Flex justifyContent={"space-around"} gap="5px">
                    <Flex gap="5px" w="100%">
                      <Button
                        color="white"
                        bg={isYay ? "#46a800" : "transparent"}
                        border={!isYay ? "1px solid #46a800" : undefined}
                        _focus={{}}
                        _hover={{}}
                        _active={{}}
                        onClick={() => setIsYay(true)}
                        w="100%"
                      >
                        <Flex alignItems={"center"} gap="2px">
                          <Text>{ongoingBets?.[0]?.options?.[0] ?? "YES"}</Text>
                        </Flex>
                      </Button>
                      <Button
                        color="white"
                        bg={!isYay ? "#fe2815" : "transparent"}
                        border={isYay ? "1px solid #fe2815" : undefined}
                        _focus={{}}
                        _hover={{}}
                        _active={{}}
                        onClick={() => setIsYay(false)}
                        w="100%"
                      >
                        <Flex alignItems={"center"} gap="2px">
                          <Text>{ongoingBets?.[0]?.options?.[1] ?? "NO"}</Text>
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
                        <Flex alignItems={"center"} gap="5px">
                          <Input
                            textAlign="center"
                            width={"70px"}
                            value={amountOfVotes}
                            onChange={handleInputChange}
                          />
                          <Button
                            color="white"
                            _focus={{}}
                            _hover={{}}
                            _active={{}}
                            p="2px !important"
                            bg="transparent"
                            borderRadius={"50%"}
                            borderWidth="1px"
                            borderColor="#5193bd"
                            height="auto"
                            minWidth="auto"
                            onClick={() =>
                              setAmountOfVotes((prev) =>
                                String(Number(prev) + 1)
                              )
                            }
                          >
                            <AddIcon color={"#51c0db"} />
                          </Button>
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
                      color="white"
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
                      onClick={() => (isBuying ? buyVotes?.() : undefined)}
                      isDisabled={
                        (isBuying && !buyVotes) ||
                        isRefetchingBuyVotes ||
                        tradeLoading
                      }
                    >
                      {(isBuying && !buyVotes) ||
                      isRefetchingBuyVotes ||
                      tradeLoading ? (
                        <Spinner />
                      ) : isBuying ? (
                        "BUY"
                      ) : (
                        "SELL"
                      )}
                    </Button>
                  </Flex>
                </>
              ) : eventEndTimestampPassed &&
                eventEndTimestamp > BigInt(0) &&
                ongoingBets?.[0]?.eventState === "LIVE" ? (
                <>
                  <Flex justifyContent={"space-evenly"} my="10px">
                    <Text
                      color="rgba(10, 179, 18, 1)"
                      fontWeight="bold"
                      fontSize="25px"
                    >
                      {truncateValue(String(yayVotesSupply), 0, true)}{" "}
                      {ongoingBets?.[0]?.options?.[0] ?? "YES"}
                    </Text>
                    <Text
                      color="rgba(218, 58, 19, 1)"
                      fontWeight="bold"
                      fontSize="25px"
                    >
                      {truncateValue(String(nayVotesSupply), 0, true)}{" "}
                      {ongoingBets?.[0]?.options?.[1] ?? "NO"}
                    </Text>
                  </Flex>
                  <Text textAlign={"center"} fontSize="14px">
                    The time for voting has ended, the streamer will select a
                    winner
                  </Text>
                </>
              ) : ongoingBets?.[0]?.eventState === "LOCK" ? (
                <>
                  <Flex justifyContent={"space-evenly"} my="10px">
                    <Text
                      color="rgba(10, 179, 18, 1)"
                      fontWeight="bold"
                      fontSize="25px"
                    >
                      {truncateValue(String(yayVotesSupply), 0, true)}{" "}
                      {ongoingBets?.[0]?.options?.[0] ?? "YES"}
                    </Text>
                    <Text
                      color="rgba(218, 58, 19, 1)"
                      fontWeight="bold"
                      fontSize="25px"
                    >
                      {truncateValue(String(nayVotesSupply), 0, true)}{" "}
                      {ongoingBets?.[0]?.options?.[1] ?? "NO"}
                    </Text>
                  </Flex>
                  <Text textAlign={"center"} fontSize="14px" color="#e49c16">
                    voting disabled
                  </Text>
                </>
              ) : ongoingBets?.[0]?.eventState === "PAYOUT" && eventVerified ? (
                <>
                  <Text textAlign={"center"} fontSize="14px" mt="10px">
                    This event is over
                  </Text>
                  <Flex justifyContent="space-between">
                    <Text fontSize="18px">outcome</Text>
                    <Text
                      fontSize="18px"
                      fontWeight="bold"
                      color={eventResult === true ? "#02f042" : "#ee6204"}
                    >
                      {eventResult
                        ? ongoingBets?.[0]?.options?.[0] ?? "Yes"
                        : ongoingBets?.[0]?.options?.[1] ?? "No"}
                    </Text>
                  </Flex>
                  <Flex justifyContent="space-between">
                    <Text fontSize="18px">your winnings</Text>
                    <Text fontSize="18px">
                      {truncateValue(formatUnits(userPayout, 18))} ETH
                    </Text>
                  </Flex>
                  <Flex direction={"column"} gap="10px">
                    {userPayout > BigInt(0) && (
                      <Button
                        color="white"
                        _hover={{}}
                        _focus={{}}
                        _active={{}}
                        bg={"#09b311"}
                        borderRadius="25px"
                        isDisabled={!claimVotePayout || tradeLoading}
                        onClick={claimVotePayout}
                        width="100%"
                      >
                        <Text fontSize="20px">get payout</Text>
                      </Button>
                    )}
                    <Flex justifyContent={"center"}>
                      <Link
                        href={"/claim"}
                        target={isStandalone ? "_self" : "_blank"}
                        style={{ textDecoration: "underline" }}
                      >
                        <Text fontSize="12px"> go to claim page</Text>
                      </Link>
                    </Flex>
                  </Flex>
                </>
              ) : eventEndTimestamp === BigInt(0) &&
                ongoingBets?.[0]?.eventState === "PENDING" ? (
                <Text textAlign={"center"}>
                  The streamer is currently setting up the new bet, please wait
                </Text>
              ) : (
                <Flex justifyContent="center">
                  <Spinner />
                </Flex>
              )}
            </>
          )}
        </>
      )}
      {viewState === "create" && (
        <CreateBet
          pool={votingPooledEth}
          generatedKey={generatedKey}
          ethBalance={userEthBalance?.value ?? BigInt(0)}
          isVerifier={isVerifier}
          handleClose={() => setViewState("normal")}
        />
      )}
      {viewState === "choose winner" && (
        <JudgeBet
          ethBalance={userEthBalance?.value ?? BigInt(0)}
          isVerifier={isVerifier}
          handleClose={() => setViewState("normal")}
        />
      )}
    </Flex>
  );
};

export default Trade;
