import { Button, Flex, Box, useToast, Input, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { formatUnits } from "viem";
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
  useSellVipBadge,
  useGenerateKey,
  useReadPublic,
  useReadMappings,
  useGetHolderBalance,
  useClaimTournamentPayout,
  useGetTournamentPayout,
} from "../../hooks/contracts/useTournament";
import { useUser } from "../../hooks/context/useUser";
import { NULL_ADDRESS } from "../../constants";
import usePostBadgeTrade from "../../hooks/server/gamblable/usePostBadgeTrade";

export const ChannelTournament = () => {
  const { userAddress, walletIsConnected } = useUser();
  const { channel, holders } = useChannelContext();
  const { handleIsVip } = holders;

  const { channelQueryData } = channel;
  const { network } = useNetworkContext();
  const { matchingChain, localNetwork, explorerUrl } = network;

  const [amountOfBadges, setAmountOfBadges] = useState<string>("0");
  const [isBuying, setIsBuying] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

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
        callbacks?.callbackOnWriteSuccess?.();
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
        callbacks?.callbackOnWriteError?.();
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
        callbacks?.callbackOnTxSuccess?.();
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
        callbacks?.callbackOnTxError?.();
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

  const { buyVipBadge, refetch: refetchBuyVipBadge } = useBuyVipBadge(
    {
      streamerAddress: channelQueryData?.owner?.address as `0x${string}`,
      eventId: 0,
      amount: BigInt(amountOfBadges),
      value: badgePrice,
    },
    tournamentContract,
    getCallbackHandlers("buyVipBadge", {
      callbackOnTxSuccess: async () => {
        await postBadgeTrade({
          channelId: channelQueryData?.id as string,
          userAddress: userAddress as `0x${string}`,
          isBuying: true,
        });
        setAmountOfBadges("0");
      },
    })
  );

  const { sellVipBadge, refetch: refetchSellVipBadge } = useSellVipBadge(
    {
      streamerAddress: channelQueryData?.owner?.address as `0x${string}`,
      eventId: 0,
      amount: BigInt(amountOfBadges),
      value: badgePrice,
    },
    tournamentContract,
    getCallbackHandlers("sellVipBadge", {
      callbackOnTxSuccess: async () => {
        await postBadgeTrade({
          channelId: channelQueryData?.id as string,
          userAddress: userAddress as `0x${string}`,
          isBuying: false,
        });
        setAmountOfBadges("0");
      },
    })
  );

  const { claimTournamentPayout, refetchClaimTournamentPayout } =
    useClaimTournamentPayout(
      tournamentContract,
      getCallbackHandlers("useClaimTournamentPayout")
    );

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
          refetchBuyVipBadge(),
          refetchSellVipBadge(),
          refetchUserEthBalance(),
          refetchClaimTournamentPayout(),
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

  return (
    <Flex direction="column" bg={"#131323"} borderRadius="15px" p="1rem">
      <Flex alignItems="center" gap="10px">
        <Text fontFamily={"LoRes15"} fontSize="25px">
          BECOME A VIP
        </Text>
        {protocolFeeDestination !== NULL_ADDRESS && (
          <Flex
            bg={"#131323"}
            borderRadius="15px"
            height="fit-content"
            margin="auto"
          >
            <Button
              bg={isBuying ? "#46a800" : "transparent"}
              border={!isBuying ? "1px solid #46a800" : undefined}
              _focus={{}}
              _hover={{}}
              _active={{}}
              onClick={() => setIsBuying(true)}
              borderRadius="0px"
              maxHeight="20px"
            >
              <Text fontSize="13px">BUY</Text>
            </Button>
            <Button
              bg={!isBuying ? "#fe2815" : "transparent"}
              border={isBuying ? "1px solid #fe2815" : undefined}
              _focus={{}}
              _hover={{}}
              _active={{}}
              onClick={() => setIsBuying(false)}
              borderRadius="0px"
              maxHeight="20px"
            >
              <Text fontSize="13px">SELL</Text>
            </Button>
          </Flex>
        )}
      </Flex>
      {tournament.isActive && protocolFeeDestination !== NULL_ADDRESS && (
        <Text textAlign={"center"} fontSize="14px" color="#f8f53b">
          {truncateValue(formatUnits(tournament.vipPooledEth, 18), 4)} ETH in
          the VIP pool
        </Text>
      )}
      {errorMessage && (
        <Text textAlign={"center"} color="red.400">
          {errorMessage}
        </Text>
      )}
      {protocolFeeDestination !== NULL_ADDRESS && userPayout === BigInt(0) && (
        <>
          <Flex gap="1rem" my="5px" justifyContent={"space-between"}>
            <Flex direction="column">
              <Text fontSize="10px" textAlign="center">
                how many
              </Text>
              <Flex alignItems={"center"}>
                <Input
                  textAlign="center"
                  width={"70px"}
                  value={amountOfBadges}
                  onChange={handleInputChange}
                />
              </Flex>
            </Flex>
            <Flex direction="column">
              <Text fontSize="10px" textAlign="center">
                ETH price
              </Text>
              <Text whiteSpace={"nowrap"} margin="auto">
                {truncateValue(formatUnits(badgePrice, 18), 4)}
              </Text>
            </Flex>
            <Flex direction="column">
              <Text fontSize="10px" textAlign="center">
                have
              </Text>
              <Text whiteSpace={"nowrap"} margin="auto">
                {truncateValue(vipBadgeBalance, 0)}
              </Text>
            </Flex>
            <Flex direction="column">
              <Text fontSize="10px" textAlign="center">
                total badges
              </Text>
              <Text whiteSpace={"nowrap"} margin="auto">
                {truncateValue(Number(vipBadgeSupply), 0)}
              </Text>
            </Flex>
          </Flex>
          <Button
            _focus={{}}
            _hover={{}}
            _active={{}}
            width="100%"
            bg={isBuying ? "#46a800" : "#fe2815"}
            onClick={() => (isBuying ? buyVipBadge?.() : sellVipBadge?.())}
            disabled={
              (isBuying && !buyVipBadge) || (!isBuying && !sellVipBadge)
            }
          >
            {isBuying ? "BUY" : "SELL"}
          </Button>
        </>
      )}
      {protocolFeeDestination === NULL_ADDRESS ? (
        <Flex>
          <Text>Contract not ready, admin must set fee destination</Text>
        </Flex>
      ) : userPayout > BigInt(0) ? (
        <Flex direction="column">
          <Text color="#fff64a">The winning badge has been decided</Text>
          <Flex justifyContent={"space-between"}>
            <Text>your payout</Text>
            <Text>{truncateValue(formatUnits(userPayout, 18))}</Text>
          </Flex>
          <Button
            _hover={{}}
            _focus={{}}
            _active={{}}
            bg={"#E09025"}
            isDisabled={!claimTournamentPayout}
            onClick={claimTournamentPayout}
          >
            get payout
          </Button>
        </Flex>
      ) : null}
    </Flex>
  );
};
