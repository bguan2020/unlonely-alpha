import { Button, Text, Box, useToast, Flex } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { decodeEventLog, formatUnits } from "viem";
import { useBalance, useBlockNumber } from "wagmi";

import { useUser } from "../../hooks/context/useUser";
import { useNetworkContext } from "../../hooks/context/useNetwork";
import { InteractionType } from "../../constants";
import {
  useBuyVipBadge,
  useGetPriceAfterFee,
} from "../../hooks/contracts/useTournament";
import usePostBadgeTrade from "../../hooks/server/gamblable/usePostBadgeTrade";
import centerEllipses from "../../utils/centerEllipses";
import { getContractFromNetwork } from "../../utils/contract";
import { useChannelContext } from "../../hooks/context/useChannel";
import { truncateValue } from "../../utils/tokenDisplayFormatting";

export const VipBadgeBuy = () => {
  const { userAddress, walletIsConnected, user } = useUser();
  const { channel, chat } = useChannelContext();
  const { channelQueryData } = channel;
  const { addToChatbot } = chat;

  const { network } = useNetworkContext();
  const { matchingChain, localNetwork, explorerUrl } = network;

  const [errorMessage, setErrorMessage] = useState<string>("");

  const blockNumber = useBlockNumber({
    watch: true,
  });

  const { data: userEthBalance, refetch: refetchUserEthBalance } = useBalance({
    address: userAddress as `0x${string}`,
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

  const { priceAfterFee: badgePrice, refetch: refetchBadgePrice } =
    useGetPriceAfterFee(
      channelQueryData?.owner?.address as `0x${string}`,
      0,
      BigInt(1),
      true,
      tournamentContract
    );

  const { buyVipBadge, refetch: refetchBuyVipBadge } = useBuyVipBadge(
    {
      streamerAddress: channelQueryData?.owner?.address as `0x${string}`,
      eventId: 0,
      amount: BigInt(1),
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
      },
    })
  );

  const isFetching = useRef(false);

  useEffect(() => {
    if (!blockNumber.data || isFetching.current) return;
    const fetch = async () => {
      isFetching.current = true;
      try {
        await Promise.all([
          refetchBadgePrice(),
          refetchBuyVipBadge(),
          refetchUserEthBalance(),
        ]);
      } catch (err) {
        console.log("VipBadgeBuy fetching error", err);
      }
      isFetching.current = false;
    };
    fetch();
  }, [blockNumber.data]);

  useEffect(() => {
    if (!walletIsConnected) {
      setErrorMessage("connect wallet first");
    } else if (!matchingChain) {
      setErrorMessage("wrong network");
    } else if (userEthBalance?.value && badgePrice > userEthBalance?.value) {
      setErrorMessage("insufficient ETH to spend");
    } else {
      setErrorMessage("");
    }
  }, [walletIsConnected, matchingChain, badgePrice, userEthBalance]);

  return (
    <Flex direction="column" p="0.5rem">
      {errorMessage && (
        <Text textAlign={"center"} color="red.400">
          {errorMessage}
        </Text>
      )}
      <Button
        bg={"#46a800"}
        border={"1px solid #46a800"}
        _focus={{}}
        _hover={{}}
        _active={{}}
        borderRadius="0px"
        onClick={() => buyVipBadge?.()}
        disabled={!buyVipBadge}
      >
        <Text fontSize="20px">
          BUY 1 ({truncateValue(formatUnits(badgePrice, 18), 4)} ETH)
        </Text>
      </Button>
    </Flex>
  );
};
