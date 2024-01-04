import { Button, Flex, Box, useToast, Text, Input } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { decodeEventLog, formatUnits } from "viem";
import { useBalance, useBlockNumber } from "wagmi";
import Link from "next/link";

import { useNetworkContext } from "../../hooks/context/useNetwork";
import { getContractFromNetwork } from "../../utils/contract";
import { useChannelContext } from "../../hooks/context/useChannel";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { filteredInput } from "../../utils/validation/input";
import {
  useGetPriceAfterFee,
  useBuyVipBadge,
  // useSellVipBadge,
  useGenerateKey,
  useReadPublic,
  useReadMappings,
  useGetHolderBalance,
  // useClaimTournamentPayout,
  useGetTournamentPayout,
} from "../../hooks/contracts/useTournament";
import { useUser } from "../../hooks/context/useUser";
import { InteractionType, NULL_ADDRESS } from "../../constants";
import usePostBadgeTrade from "../../hooks/server/gamblable/usePostBadgeTrade";
import centerEllipses from "../../utils/centerEllipses";

export const ChannelTournament = () => {
  const { userAddress, walletIsConnected } = useUser();
  const { channel, chat, leaderboard, ui } = useChannelContext();
  const { channelQueryData, handleTotalBadges } = channel;
  const { handleIsVip } = leaderboard;
  const { addToChatbot } = chat;
  const { handleVipPool, handleTournamentActive } = ui;

  const { network } = useNetworkContext();
  const { matchingChain, localNetwork, explorerUrl } = network;

  const [amountOfBadges, setAmountOfBadges] = useState<string>("0");
  const [isBuying, setIsBuying] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { user } = useUser();

  const tournamentContract = getContractFromNetwork(
    "unlonelyTournament",
    localNetwork
  );

  const toast = useToast();

  const { postBadgeTrade } = usePostBadgeTrade({
    onError: (err) => {
      console.log(err);
    },
  });

  const blockNumber = useBlockNumber({
    watch: true,
  });

  const getCallbackHandlers = (
    name: string,
    callbacks?: {
      callbackOnWriteError?: any;
      callbackOnTxError?: any;
      callbackOnWriteSuccess?: any;
      callbackOnTxSuccess?: any;
    }
  ) => {
    return {
      onWriteSuccess: (data: any) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#287ab0" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.hash}`}
                passHref
              >
                {name} pending, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        callbacks?.callbackOnWriteSuccess?.(data);
      },
      onWriteError: (error: any) => {
        toast({
          duration: 9000,
          isClosable: true,
          position: "top-right",
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              {name} cancelled
            </Box>
          ),
        });
        callbacks?.callbackOnWriteError?.(error);
      },
      onTxSuccess: (data: any) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                {name} success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        callbacks?.callbackOnTxSuccess?.(data);
      },
      onTxError: (error: any) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              {name} error
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        callbacks?.callbackOnTxError?.(error);
      },
    };
  };

  const { key: generatedKey } = useGenerateKey(
    channelQueryData?.owner?.address as `0x${string}`,
    0,
    tournamentContract
  );

  const { data: userEthBalance, refetch: refetchUserEthBalance } = useBalance({
    address: userAddress as `0x${string}`,
  });

  const {
    tournament,
    protocolFeeDestination,
    refetch: refetchPublic,
  } = useReadPublic(tournamentContract);

  const { vipBadgeSupply, refetch: refetchMappings } = useReadMappings(
    generatedKey,
    tournamentContract
  );

  const { userPayout, refetch: refetchUserPayout } = useGetTournamentPayout(
    userAddress as `0x${string}`,
    tournamentContract
  );

  const { vipBadgeBalance, refetch: refetchVipBadgeBalance } =
    useGetHolderBalance(
      channelQueryData?.owner?.address as `0x${string}`,
      0,
      userAddress as `0x${string}`,
      tournamentContract
    );

  const { priceAfterFee: badgePrice, refetch: refetchBadgePrice } =
    useGetPriceAfterFee(
      channelQueryData?.owner?.address as `0x${string}`,
      0,
      BigInt(amountOfBadges),
      isBuying,
      tournamentContract
    );

  const { buyVipBadge } = useBuyVipBadge(
    {
      streamerAddress: channelQueryData?.owner?.address as `0x${string}`,
      eventId: 0,
      amount: BigInt(amountOfBadges),
      value: badgePrice,
    },
    tournamentContract,
    getCallbackHandlers("buyVipBadge", {
      callbackOnTxSuccess: async (data: any) => {
        const topics = decodeEventLog({
          abi: tournamentContract.abi,
          data: data.logs[0].data,
          topics: data.logs[0].topics,
        });
        const args: any = topics.args;
        const title = `${user?.username ?? centerEllipses(userAddress, 15)} ${
          args.trade.isBuy ? "bought" : "sold"
        } ${args.trade.badgeAmount} badges!`;
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.BUY_BADGES,
          title,
          description: `${user?.username ?? centerEllipses(userAddress, 15)}:${
            args.trade.badgeAmount
          }`,
        });
        await postBadgeTrade({
          channelId: channelQueryData?.id as string,
          userAddress: userAddress as `0x${string}`,
          isBuying: true,
          eventId: 0,
          chainId: localNetwork.config.chainId,
          fees: Number(formatUnits(args.trade.subjectEthAmount, 18)),
        });
        setAmountOfBadges("0");
      },
    })
  );

  // const { sellVipBadge, refetch: refetchSellVipBadge } = useSellVipBadge(
  //   {
  //     streamerAddress: channelQueryData?.owner?.address as `0x${string}`,
  //     eventId: 0,
  //     amount: BigInt(amountOfBadges),
  //     value: badgePrice,
  //   },
  //   tournamentContract,
  //   getCallbackHandlers("sellVipBadge", {
  //     callbackOnTxSuccess: async (data: any) => {
  //       const topics = decodeEventLog({
  //         abi: tournamentContract.abi,
  //         data: data.logs[0].data,
  //         topics: data.logs[0].topics,
  //       });
  //       const args: any = topics.args;
  //       const title = `${user?.username ?? centerEllipses(userAddress, 15)} ${
  //         args.trade.isBuy ? "bought" : "sold"
  //       } ${args.trade.badgeAmount} badges!`;
  //       addToChatbot({
  //         username: user?.username ?? "",
  //         address: userAddress ?? "",
  //         taskType: InteractionType.SELL_BADGES,
  //         title,
  //         description: `${user?.username ?? centerEllipses(userAddress, 15)}:${
  //           args.trade.badgeAmount
  //         }`,
  //       });
  //       await postBadgeTrade({
  //         channelId: channelQueryData?.id as string,
  //         userAddress: userAddress as `0x${string}`,
  //         isBuying: false,
  //         chainId: localNetwork.config.chainId,
  //         fees: Number(formatUnits(args.trade.subjectEthAmount, 18)),
  //       });
  //       setAmountOfBadges("0");
  //     },
  //   })
  // );

  // const { claimTournamentPayout, refetchClaimTournamentPayout } =
  //   useClaimTournamentPayout(
  //     tournamentContract,
  //     getCallbackHandlers("useClaimTournamentPayout")
  //   );

  const handleInputChange = (event: any) => {
    const input = event.target.value;
    const filtered = filteredInput(input);
    setAmountOfBadges(filtered);
  };

  const isFetching = useRef(false);

  useEffect(() => {
    if (!blockNumber.data || isFetching.current) return;
    const fetch = async () => {
      isFetching.current = true;
      try {
        await Promise.all([
          refetchUserPayout(),
          refetchVipBadgeBalance(),
          refetchPublic(),
          refetchBadgePrice(),
          // refetchBuyVipBadge(),
          // refetchSellVipBadge(),
          refetchUserEthBalance(),
          // refetchClaimTournamentPayout(),
          refetchMappings(),
        ]);
      } catch (err) {
        console.log("channelTournament fetching error", err);
      }
      isFetching.current = false;
    };
    fetch();
  }, [blockNumber.data]);

  useEffect(() => {
    if (Number(vipBadgeBalance) > 0) {
      handleIsVip?.(true);
    } else {
      handleIsVip?.(false);
    }
  }, [vipBadgeBalance]);

  useEffect(() => {
    if (!walletIsConnected) {
      setErrorMessage("connect wallet first");
    } else if (!matchingChain) {
      setErrorMessage("wrong network");
    } else if (!isBuying && Number(vipBadgeBalance) < Number(amountOfBadges)) {
      setErrorMessage("insufficient badges to sell");
    } else if (
      isBuying &&
      userEthBalance?.value &&
      badgePrice > userEthBalance?.value
    ) {
      setErrorMessage("insufficient ETH to spend");
    } else if (Number(amountOfBadges) === 0) {
      setErrorMessage("enter amount first");
    } else {
      setErrorMessage("");
    }
  }, [
    walletIsConnected,
    matchingChain,
    userEthBalance,
    isBuying,
    badgePrice,
    vipBadgeBalance,
    amountOfBadges,
  ]);

  useEffect(() => {
    handleVipPool(formatUnits(tournament.vipPooledEth, 18));
  }, [tournament.vipPooledEth]);

  useEffect(() => {
    handleTournamentActive(tournament.isActive);
  }, [tournament.isActive]);

  useEffect(() => {
    handleTotalBadges(truncateValue(Number(vipBadgeSupply), 0));
  }, [vipBadgeSupply]);

  const determineBg = () => {
    if (userPayout > BigInt(0))
      return "linear-gradient(163deg, rgba(255,255,255,1) 0%, rgba(255,227,143,1) 3%, rgba(255,213,86,1) 4%, rgba(246,190,45,1) 6%, #bb7205 7%, #995803 63%, #a36604 100%)";
    if (tournament.isActive)
      return "linear-gradient(163deg, rgba(255,255,255,1) 1%, rgba(255,227,143,1) 3%, rgba(255,213,86,1) 4%, rgba(246,190,45,1) 6%, rgba(249,163,32,1) 7%, rgba(231,143,0,1) 8%, #2c1b0b 10%, #603208 100%)";
    return "#131323";
  };

  return (
    <Flex
      direction="column"
      bg={determineBg()}
      borderRadius="0px"
      p="1rem"
      boxShadow={userPayout > BigInt(0) ? "-2px -2px 2px white" : undefined}
    >
      <>
        <Flex alignItems="center" gap="10px">
          <Text fontFamily={"LoRes15"} fontSize="25px">
            VIP
          </Text>
          {protocolFeeDestination !== NULL_ADDRESS && (
            <Flex
              bg={"#131323"}
              borderRadius="0px"
              height="fit-content"
              margin="auto"
            >
              <Button
                color="white"
                bg={isBuying ? "#46a800" : "transparent"}
                border={!isBuying ? "1px solid #46a800" : undefined}
                _focus={{}}
                _hover={{}}
                _active={{}}
                onClick={() => setIsBuying(true)}
                borderRadius="0px"
                maxHeight="25px"
              >
                <Text fontSize="13px">BUY</Text>
              </Button>
              <Button
                color="white"
                bg={!isBuying ? "#fe2815" : "transparent"}
                border={isBuying ? "1px solid #fe2815" : undefined}
                _focus={{}}
                _hover={{}}
                _active={{}}
                onClick={() => setIsBuying(false)}
                borderRadius="0px"
                maxHeight="25px"
              >
                <Text fontSize="13px">SELL</Text>
              </Button>
            </Flex>
          )}
        </Flex>
        {errorMessage && (
          <Text textAlign={"center"} color="red.400">
            {errorMessage}
          </Text>
        )}
        {protocolFeeDestination !== NULL_ADDRESS && userPayout === BigInt(0) && (
          <>
            <Flex gap="1rem" my="5px" justifyContent={"space-between"}>
              <Flex direction="column">
                <Text fontSize="15px" textAlign="center">
                  #
                </Text>
                <Flex alignItems={"center"}>
                  <Input
                    textAlign="center"
                    width={"40px"}
                    value={amountOfBadges}
                    onChange={handleInputChange}
                    p="10px"
                  />
                </Flex>
              </Flex>
              <Flex direction="column">
                <Text fontSize="15px" textAlign="center">
                  ETH {isBuying ? "price" : "return"}
                </Text>
                <Text whiteSpace={"nowrap"} margin="auto">
                  {truncateValue(formatUnits(badgePrice, 18), 4)}
                </Text>
              </Flex>
              <Flex direction="column">
                <Text fontSize="15px" textAlign="center">
                  own
                </Text>
                <Text whiteSpace={"nowrap"} margin="auto">
                  {truncateValue(vipBadgeBalance, 0)}
                </Text>
              </Flex>
            </Flex>
            <Button
              color="white"
              _focus={{}}
              _hover={{}}
              _active={{}}
              width="100%"
              bg={isBuying ? "#46a800" : "#fe2815"}
              // onClick={() => (isBuying ? buyVipBadge?.() : sellVipBadge?.())}
              onClick={() => buyVipBadge?.()}
              isDisabled={
                isBuying && !buyVipBadge
                // || (!isBuying && !sellVipBadge)
              }
            >
              {isBuying ? "BUY" : "SELL"}
            </Button>
          </>
        )}
        {protocolFeeDestination === NULL_ADDRESS && matchingChain ? (
          <Flex>
            <Text>Contract not ready, admin must set fee destination</Text>
          </Flex>
        ) : userPayout > BigInt(0) ? (
          <Flex direction="column">
            <Text color="#fff64a">The winning badge has been decided</Text>
            <Flex justifyContent={"space-between"}>
              <Text>your payout</Text>
              <Text>{truncateValue(formatUnits(userPayout, 18))} ETH</Text>
            </Flex>
            {/* <Button
              color="white"
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg={"#E09025"}
              isDisabled={!claimTournamentPayout}
              onClick={claimTournamentPayout}
            >
              get payout
            </Button> */}
          </Flex>
        ) : null}
      </>
    </Flex>
  );
};
