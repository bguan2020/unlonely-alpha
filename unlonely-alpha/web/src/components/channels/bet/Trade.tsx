import Link from "next/link";
import { Log, decodeEventLog, formatUnits, isAddress } from "viem";
import {
  Flex,
  Box,
  Text,
  Button,
  useToast,
  Input,
  Spinner,
  Tooltip,
} from "@chakra-ui/react";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useBalance, useContractEvent } from "wagmi";
import { AddIcon } from "@chakra-ui/icons";

import {
  InteractionType,
  NULL_ADDRESS,
  NULL_ADDRESS_BYTES32,
} from "../../../constants";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { useNetworkContext } from "../../../hooks/context/useNetwork";
import {
  useBuyVotes,
  useGetPriceAfterFee,
  useReadSupplies,
  useGenerateKey,
  useGetHolderBalances,
  useClaimVotePayout,
  useIsVerifier,
  useUserPayout,
  useVotingPooledEth,
  useEventEndTimestamp,
  useEventVerifyStatus,
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
import useUpdateSharesEvent from "../../../hooks/server/channel/useUpdateSharesEvent";
import usePostClaimPayout from "../../../hooks/server/usePostClaimPayout";
import useCloseSharesEvent from "../../../hooks/server/channel/useCloseSharesEvent";
import useDebounce from "../../../hooks/internal/useDebounce";
import useUserAgent from "../../../hooks/internal/useUserAgent";

const Trade = () => {
  const { userAddress, walletIsConnected, user } = useUser();
  const { isStandalone } = useUserAgent();
  const { channel, chat: chatContext, ui } = useChannelContext();
  const { channelQueryData, latestBet } = channel;
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
  const amount_bigint = useMemo(
    () => BigInt(debouncedAmountOfVotes as `${number}`),
    [debouncedAmountOfVotes]
  );

  const { data: userEthBalance, refetch: refetchUserEthBalance } = useBalance({
    address: userAddress as `0x${string}`,
    enabled: isAddress(userAddress as `0x${string}`),
  });
  const canAddToChatbotBuy = useRef(false);
  const canAddToChatbotClaim = useRef(false);

  const toast = useToast();

  useEffect(() => {
    if (
      userAddress === channelQueryData?.owner.address &&
      latestBet?.eventState === SharesEventState.Pending
    ) {
      setViewState("create");
    } else {
      setViewState("normal");
    }
  }, [userAddress, latestBet]);

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
    yayVotesBalance,
    nayVotesBalance,
    setYayVotesBalance,
    setNayVotesBalance,
  } = useGetHolderBalances(
    (latestBet?.sharesSubjectAddress as `0x${string}`) ?? NULL_ADDRESS,
    Number(latestBet?.id ?? "0"),
    userAddress as `0x${string}`,
    v2contract
  );

  const { priceAfterFee: votePrice, refetch: refetchVotePrice } =
    useGetPriceAfterFee(
      channelQueryData?.owner?.address as `0x${string}`,
      Number(latestBet?.id ?? "0"),
      amount_bigint,
      isYay,
      isBuying,
      v2contract
    );

  const { key: generatedKey } = useGenerateKey(
    channelQueryData?.owner?.address as `0x${string}`,
    Number(latestBet?.id ?? "0"),
    v2contract
  );

  const {
    yayVotesSupply,
    nayVotesSupply,
    setYayVotesSupply,
    setNayVotesSupply,
  } = useReadSupplies(
    generatedKey,
    (latestBet?.sharesSubjectAddress as `0x${string}`) ?? NULL_ADDRESS,
    Number(latestBet?.id ?? "0"),
    v2contract
  );

  const { eventVerified, eventResult, setEventResult, setEventVerified } =
    useEventVerifyStatus(generatedKey, v2contract);

  const { eventEndTimestamp, setEventEndTimestamp } = useEventEndTimestamp(
    generatedKey,
    v2contract
  );

  const isSharesEventPending =
    latestBet?.eventState === SharesEventState.Pending;
  const isSharesEventLive = latestBet?.eventState === SharesEventState.Live;
  const isSharesEventLock = latestBet?.eventState === SharesEventState.Lock;
  const isSharesEventPayout = latestBet?.eventState === SharesEventState.Payout;
  const isSharesEventPayoutPrevious =
    latestBet?.eventState === SharesEventState.PayoutPrevious;
  const isOwner = userAddress === channelQueryData?.owner.address;
  const eventEndTimestampPassed = Number(eventEndTimestamp) * 1000 <= dateNow;
  const isEventOver = eventEndTimestampPassed || isSharesEventPayout;

  const {
    votingPooledEth,
    refetch: refetchVotingPooledEth,
    setVotingPooledEth,
  } = useVotingPooledEth(generatedKey, v2contract);

  const { userPayout, refetch: refetchPayout } = useUserPayout(
    (latestBet?.sharesSubjectAddress as `0x${string}`) ?? NULL_ADDRESS,
    Number(latestBet?.id ?? "0"),
    v2contract
  );

  const { refetch: refetchIsVerifier, isVerifier } = useIsVerifier(v2contract);
  const [verifierFetchFlag, setVerifierFetchFlag] = useState<Log[]>([]);

  useContractEvent({
    address: v2contract.address,
    abi: v2contract.abi,
    eventName: "setVerifier",
    listener(logs) {
      setVerifierFetchFlag(logs);
    },
  });

  useEffect(() => {
    if (verifierFetchFlag.length === 0 || !isOwner) return;
    refetchIsVerifier();
  }, [verifierFetchFlag]);

  const {
    buyVotes,
    refetch: refetchBuyVotes,
    isRefetchingBuyVotes,
  } = useBuyVotes(
    {
      eventAddress:
        (latestBet?.sharesSubjectAddress as `0x${string}`) ?? NULL_ADDRESS,
      eventId: Number(latestBet?.id ?? "0"),
      isYay,
      amountOfVotes: amount_bigint,
      value: votePrice,
      canBuy: true,
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
        canAddToChatbotBuy.current = true;
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
        canAddToChatbotBuy.current = false;
      },
      onTxSuccess: async (data) => {
        if (!canAddToChatbotBuy.current) return;
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
          (args.trade.isBuy as boolean) ? "bought" : "sold"
        } ${args.trade.shareAmount} ${
          (args.trade.isYay as boolean)
            ? latestBet?.options?.[0] ?? "yes"
            : latestBet?.options?.[1] ?? "no"
        } vote${Number(args.trade.shareAmount as bigint) > 1 ? "s" : ""}!`;
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.BUY_VOTES,
          title,
          description: `${
            user?.username ?? centerEllipses(userAddress ?? "", 15)
          }:${Number(args.trade.shareAmount as bigint)}:${
            (args.trade.isYay as boolean) ? "yay" : "nay"
          }:${
            (args.trade.isYay as boolean)
              ? latestBet?.options?.[0] ?? "yes"
              : latestBet?.options?.[1] ?? "no"
          }`,
        });
        await postBetTrade({
          channelId: channelQueryData?.id as string,
          userAddress: userAddress as `0x${string}`,
          chainId: localNetwork.config.chainId,
          type: args.trade.isYay
            ? GamblableEvent.BetYesBuy
            : GamblableEvent.BetNoBuy,
          eventId: Number(latestBet?.id ?? "0"),
          eventType: EventType.YayNayVote,
          fees: Number(formatUnits(args.trade.subjectEthAmount, 18)),
        });
        canAddToChatbotBuy.current = false;
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
        canAddToChatbotBuy.current = false;
      },
    }
  );

  const { claimVotePayout, refetch: refetchClaimVotePayout } =
    useClaimVotePayout(
      {
        eventAddress: latestBet?.sharesSubjectAddress as `0x${string}`,
        eventId: Number(latestBet?.id ?? "0"),
        canClaim: true,
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
          canAddToChatbotClaim.current = true;
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
          canAddToChatbotClaim.current = false;
        },
        onTxSuccess: async (data) => {
          if (!canAddToChatbotClaim.current) return;
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
            eventId: Number(latestBet?.id ?? "0"),
            eventType: EventType.YayNayVote,
          });
          if ((args.votingPooledEth as bigint) === BigInt(0)) {
            await closeSharesEvents({
              chainId: localNetwork.config.chainId,
              channelId: channelQueryData?.id as string,
              sharesEventIds: [Number(latestBet?.id ?? "0")],
            });
          }
          canAddToChatbotClaim.current = false;
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
          canAddToChatbotClaim.current = false;
        },
      }
    );

  const { updateSharesEvent, loading: updateSharesEventLoading } =
    useUpdateSharesEvent({});
  const doesEventExist = useMemo(() => {
    if (!latestBet?.sharesSubjectAddress) return false;
    if (!latestBet?.id) return false;
    return true;
  }, [latestBet]);

  const _updateSharesEvent = useCallback(
    async (eventState: SharesEventState) => {
      await updateSharesEvent({
        id: latestBet?.id ?? "",
        sharesSubjectQuestion: latestBet?.sharesSubjectQuestion ?? "",
        sharesSubjectAddress: latestBet?.sharesSubjectAddress ?? "",
        eventState,
      });
      if (eventState === SharesEventState.Live) {
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.EVENT_UNLOCK,
          title: "Event is unlocked!",
          description: "event-unlock",
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
    [latestBet, user, userAddress]
  );

  const [latestEventOpenedLogs, setLatestEventOpenedLogs] = useState<Log[]>([]);

  useContractEvent({
    address: v2contract.address,
    abi: v2contract.abi,
    eventName: "EventOpened",
    listener(logs) {
      console.log("EventOpened", logs);
      setLatestEventOpenedLogs(logs);
    },
  });

  const handleEventOpened = async (logs: Log[]) => {
    if (!logs || logs.length === 0) return;
    const foundEvent = logs.find(
      (log: any) => (log?.args?.eventByte as string) === generatedKey
    );
    if (foundEvent) {
      setVotingPooledEth(BigInt(0));
      setEventEndTimestamp((foundEvent as any).args.endTimestamp as bigint);
      setNayVotesBalance("0");
      setYayVotesBalance("0");
      setNayVotesSupply(BigInt(0));
      setYayVotesSupply(BigInt(0));
      setEventVerified(false);
      await Promise.all([refetchBuyVotes(), refetchVotePrice()]);
    }
  };

  useEffect(() => {
    if (latestEventOpenedLogs) handleEventOpened(latestEventOpenedLogs);
  }, [latestEventOpenedLogs]);

  const [latestTradeLogs, setLatestTradeLogs] = useState<Log[]>([]);
  const [tradeFetchFlag, setTradeFetchFlag] = useState<Log[]>([]);
  const [debouncedTradeFetchFlag, setDebouncedTradeFetchFlag] = useState<Log[]>(
    []
  );

  useContractEvent({
    address: v2contract.address,
    abi: v2contract.abi,
    eventName: "Trade",
    listener(logs) {
      console.log("Trade", logs);
      setLatestTradeLogs(logs);
    },
  });

  const handleTrade = async (tradeEvents: Log[]) => {
    const sortedEvents = tradeEvents
      .filter(
        (event: any) => (event?.args.trade.eventByte as string) === generatedKey
      )
      .sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber));
    if (sortedEvents.length === 0) return;
    let newYayBalanceAddtion = BigInt(0);
    let newNayBalanceAddtion = BigInt(0);
    let newYaySupply = null;
    let newNaySupply = null;
    for (let i = 0; i < sortedEvents.length; i++) {
      const event: any = sortedEvents[i];
      const eventTriggeredByUser =
        (event?.args.trade.trader as `0x${string}`) === userAddress;
      const newSupply = event?.args.trade.supply as bigint;
      const amount = event?.args.trade.shareAmount as bigint;
      const isYay = event?.args.trade.isYay as boolean;
      if (isYay) {
        newYaySupply = newSupply;
        if (eventTriggeredByUser)
          newYayBalanceAddtion = BigInt(
            Number(amount) + Number(newYayBalanceAddtion)
          );
      } else {
        newNaySupply = newSupply;
        if (eventTriggeredByUser)
          newNayBalanceAddtion = BigInt(
            Number(amount) + Number(newNayBalanceAddtion)
          );
      }
    }
    if (newYaySupply !== null) setYayVotesSupply(newYaySupply);
    if (newNaySupply !== null) setNayVotesSupply(newNaySupply);
    setYayVotesBalance((prev) =>
      String(Number(prev) + Number(newYayBalanceAddtion))
    );
    setNayVotesBalance((prev) =>
      String(Number(prev) + Number(newNayBalanceAddtion))
    );
    setTradeFetchFlag(tradeEvents);
  };

  useEffect(() => {
    if (latestTradeLogs) handleTrade(latestTradeLogs);
  }, [latestTradeLogs]);

  const tradeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (tradeTimeoutRef.current) {
      clearTimeout(tradeTimeoutRef.current);
    }

    const MILLIS_TO_WAIT = 400;

    tradeTimeoutRef.current = setTimeout(() => {
      setDebouncedTradeFetchFlag(tradeFetchFlag);
    }, MILLIS_TO_WAIT);

    return () => {
      if (tradeTimeoutRef.current) {
        clearTimeout(tradeTimeoutRef.current);
      }
    };
  }, [tradeFetchFlag]);

  useEffect(() => {
    const init = async () => {
      if (!debouncedTradeFetchFlag) return;
      let calls: any[] = [];
      calls = calls.concat([refetchVotePrice(), refetchVotingPooledEth()]);
      try {
        await Promise.all(calls);
      } catch (err) {
        console.log("debouncedTradeFetchFlag error", err);
      }
    };
    init();
  }, [debouncedTradeFetchFlag]);

  const [latestEventVerifiedLogs, setLatestEventVerifiedLogs] = useState<Log[]>(
    []
  );

  useContractEvent({
    address: v2contract.address,
    abi: v2contract.abi,
    eventName: "EventVerified",
    listener(logs) {
      console.log("EventVerified", logs);
      setLatestEventVerifiedLogs(logs);
    },
  });

  const handleEventVerified = async (logs: Log[]) => {
    if (!logs || logs.length === 0) return;
    const log = logs.find(
      (log: any) => (log?.args?.eventByte as string) === generatedKey
    );
    if (!log) return;
    setEventResult((log as any).args.result as boolean);
    setEventVerified(true);
    await Promise.all([refetchPayout(), refetchClaimVotePayout()]);
  };

  useEffect(() => {
    handleEventVerified(latestEventVerifiedLogs);
  }, [latestEventVerifiedLogs]);

  const [latestPayoutLogs, setLatestPayoutLogs] = useState<Log[]>([]);
  const [payoutFlagFetch, setPayoutFlagFetch] = useState<Log[]>([]);
  const [debouncedPayoutFlagFetch, setDebouncedPayoutFlagFetch] = useState<
    Log[]
  >([]);

  useContractEvent({
    address: v2contract.address,
    abi: v2contract.abi,
    eventName: "Payout",
    listener(logs) {
      console.log("Payout", logs);
      setLatestPayoutLogs(logs);
    },
  });

  useEffect(() => {
    if (latestPayoutLogs) setPayoutFlagFetch(latestPayoutLogs);
  }, [latestPayoutLogs]);

  const payoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (payoutTimeoutRef.current) {
      clearTimeout(payoutTimeoutRef.current);
    }

    const MILLIS_TO_WAIT = 400;

    payoutTimeoutRef.current = setTimeout(() => {
      setDebouncedPayoutFlagFetch(payoutFlagFetch);
    }, MILLIS_TO_WAIT);

    return () => {
      if (payoutTimeoutRef.current) {
        clearTimeout(payoutTimeoutRef.current);
      }
    };
  }, [payoutFlagFetch]);

  useEffect(() => {
    const init = async () => {
      if (
        !debouncedPayoutFlagFetch ||
        debouncedPayoutFlagFetch.length === 0 ||
        !isSharesEventPayout
      )
        return;
      if (
        debouncedPayoutFlagFetch.some(
          (log: any) =>
            (log?.args?.voter as `0x${string}`).toLowerCase() ===
            userAddress?.toLowerCase()
        )
      ) {
        let calls: any[] = [];
        calls = calls.concat([
          refetchVotingPooledEth(),
          refetchClaimVotePayout(),
          refetchPayout(),
        ]);
        try {
          await Promise.all(calls);
        } catch (err) {
          console.log("debouncedPayoutFlagFetch error", err);
        }
      }
    };
    init();
  }, [debouncedPayoutFlagFetch]);

  const fetch = async () => {
    let calls: any[] = [];
    calls = calls.concat([refetchUserEthBalance()]);
    if (doesEventExist) {
      if (isSharesEventLive && eventEndTimestampPassed) {
      } else if (isSharesEventLive && !eventEndTimestampPassed) {
        calls.concat([refetchBuyVotes()]);
      } else if (isSharesEventLock) {
      } else if (isSharesEventPayout && userPayout > BigInt(0)) {
        calls.concat([refetchClaimVotePayout()]);
      }
    }
    try {
      await Promise.all(calls);
    } catch (err) {
      console.log("block based data fetching error", err);
    }
    setDateNow(Date.now());
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      await fetch();
    }, 6000);

    return () => clearInterval(interval);
  }, []);

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
    <Flex direction="column" height="100%" position={"relative"} gap="10px">
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
        !isSharesEventPayoutPrevious && (
          <Flex
            direction={"column"}
            gap="5px"
            p="5px"
            bg={"rgba(0, 0, 0, 0.4)"}
            borderRadius="15px"
            mb={"10px"}
          >
            <Text textAlign={"center"} fontSize={"20px"} fontWeight={"bold"}>
              {latestBet?.sharesSubjectQuestion}
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
          (doesEventExist && isSharesEventPayoutPrevious) ? (
            <Tooltip
              label="ask the streamer to start a voting event on stream to use this feature!"
              shouldWrapChildren
            >
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
            </Tooltip>
          ) : (
            <>
              {!eventEndTimestampPassed &&
              eventEndTimestamp > BigInt(0) &&
              isSharesEventLive ? (
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
                          <Text>{latestBet?.options?.[0] ?? "YES"}</Text>
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
                          <Text>{latestBet?.options?.[1] ?? "NO"}</Text>
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
                            fontSize={isStandalone ? "16px" : "unset"}
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
                        tradeLoading ||
                        generatedKey === NULL_ADDRESS_BYTES32
                      }
                    >
                      {generatedKey === NULL_ADDRESS_BYTES32 ? (
                        "Key not generated"
                      ) : (isBuying && !buyVotes) ||
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
                isSharesEventLive ? (
                <>
                  <Flex justifyContent={"space-evenly"} my="10px">
                    <Text
                      color="rgba(10, 179, 18, 1)"
                      fontWeight="bold"
                      fontSize="25px"
                    >
                      {truncateValue(String(yayVotesSupply), 0, true)}{" "}
                      {latestBet?.options?.[0] ?? "YES"}
                    </Text>
                    <Text
                      color="rgba(218, 58, 19, 1)"
                      fontWeight="bold"
                      fontSize="25px"
                    >
                      {truncateValue(String(nayVotesSupply), 0, true)}{" "}
                      {latestBet?.options?.[1] ?? "NO"}
                    </Text>
                  </Flex>
                  <Text textAlign={"center"} fontSize="14px">
                    The time for voting has ended, the streamer will select a
                    winner
                  </Text>
                </>
              ) : isSharesEventLock ? (
                <>
                  <Flex justifyContent={"space-evenly"} my="10px">
                    <Text
                      color="rgba(10, 179, 18, 1)"
                      fontWeight="bold"
                      fontSize="25px"
                    >
                      {truncateValue(String(yayVotesSupply), 0, true)}{" "}
                      {latestBet?.options?.[0] ?? "YES"}
                    </Text>
                    <Text
                      color="rgba(218, 58, 19, 1)"
                      fontWeight="bold"
                      fontSize="25px"
                    >
                      {truncateValue(String(nayVotesSupply), 0, true)}{" "}
                      {latestBet?.options?.[1] ?? "NO"}
                    </Text>
                  </Flex>
                  <Text textAlign={"center"} fontSize="14px" color="#e49c16">
                    voting disabled
                  </Text>
                </>
              ) : isSharesEventPayout ? (
                <>
                  <Text textAlign={"center"} fontSize="14px" mt="10px">
                    This event is over
                  </Text>
                  {eventVerified ? (
                    <>
                      <Flex justifyContent="space-between">
                        <Text fontSize="18px">outcome</Text>
                        <Text
                          fontSize="18px"
                          fontWeight="bold"
                          color={eventResult === true ? "#02f042" : "#ee6204"}
                        >
                          {eventResult
                            ? latestBet?.options?.[0] ?? "Yes"
                            : latestBet?.options?.[1] ?? "No"}
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
                  ) : (
                    <Flex justifyContent={"center"}>
                      <Spinner />
                    </Flex>
                  )}
                </>
              ) : eventEndTimestamp === BigInt(0) && isSharesEventPending ? (
                <Text textAlign={"center"}>
                  The streamer is currently setting up the new bet, please wait
                </Text>
              ) : (
                <Flex direction="column">
                  <Flex justifyContent="center">
                    <Spinner />
                  </Flex>
                  <Text textAlign={"center"}>loading event details</Text>
                  <Text textAlign={"center"}>
                    if this is taking a while, details may not be found
                  </Text>
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
          eventVerified={eventVerified}
          handleClose={() => setViewState("normal")}
        />
      )}
    </Flex>
  );
};

export default Trade;
