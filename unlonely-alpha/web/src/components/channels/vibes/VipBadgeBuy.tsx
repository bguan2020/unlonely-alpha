import { Button, Text, Box, useToast, Flex } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { decodeEventLog, formatUnits, isAddress } from "viem";
import { useBalance } from "wagmi";

import { useUser } from "../../../hooks/context/useUser";
import { useNetworkContext } from "../../../hooks/context/useNetwork";
import {
  CHAT_MESSAGE_EVENT,
  Contract,
  InteractionType,
  NULL_ADDRESS_BYTES32,
} from "../../../constants";
import {
  useBuyVipBadge,
  useGenerateKey,
  useGetPriceAfterFee,
} from "../../../hooks/contracts/useTournament";
import usePostBadgeTrade from "../../../hooks/server/gamblable/usePostBadgeTrade";
import centerEllipses from "../../../utils/centerEllipses";
import { getContractFromNetwork } from "../../../utils/contract";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { truncateValue } from "../../../utils/tokenDisplayFormatting";
import { ChatReturnType } from "../../../hooks/chat/useChat";

export const VipBadgeBuy = ({ chat }: { chat: ChatReturnType }) => {
  const { userAddress, walletIsConnected, user } = useUser();
  const { channel, chat: c } = useChannelContext();
  const { channelQueryData } = channel;
  const { addToChatbot } = c;

  const { network } = useNetworkContext();
  const { matchingChain, localNetwork, explorerUrl } = network;

  const [errorMessage, setErrorMessage] = useState<string>("");
  const canAddToChatbot = useRef(false);

  const { data: userEthBalance, refetch: refetchUserEthBalance } = useBalance({
    address: userAddress as `0x${string}`,
    enabled: isAddress(userAddress as `0x${string}`),
  });
  const mountingMessages = useRef(true);

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
          position: "bottom", // chakra ui toast position
        });
        callbacks?.callbackOnWriteSuccess?.(data);
      },
      onWriteError: (error: any) => {
        toast({
          duration: 9000,
          isClosable: true,
          position: "bottom", // chakra ui toast position
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
          position: "bottom", // chakra ui toast position
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
          position: "bottom", // chakra ui toast position
        });
        callbacks?.callbackOnTxError?.(error);
      },
    };
  };

  const tournamentContract = getContractFromNetwork(
    Contract.TOURNAMENT,
    localNetwork
  );

  const { key: generatedKey } = useGenerateKey(
    channelQueryData?.owner?.address as `0x${string}`,
    0,
    tournamentContract
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
      callbackOnWriteSuccess: async (data: any) => {
        canAddToChatbot.current = true;
      },
      callbackOnTxSuccess: async (data: any) => {
        if (!canAddToChatbot.current) return;
        const topics = decodeEventLog({
          abi: tournamentContract.abi,
          data: data.logs[0].data,
          topics: data.logs[0].topics,
        });
        const args: any = topics.args;
        console.log("VipBadgeBuy", args);
        const newSupply = args.trade.supply as bigint;
        const title = `${user?.username ?? centerEllipses(userAddress, 15)} ${
          args.trade.isBuy ? "bought" : "sold"
        } ${args.trade.badgeAmount} badges!`;
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.BUY_BADGES,
          title,
          description: `${args.trade.trader}:${args.trade.badgeAmount}:${newSupply}:${args.trade.eventByte}`,
        });
        await postBadgeTrade({
          channelId: channelQueryData?.id as string,
          userAddress: userAddress as `0x${string}`,
          isBuying: true,
          eventId: 0,
          chainId: localNetwork.config.chainId,
          fees: Number(formatUnits(args.trade.subjectEthAmount, 18)),
        });
        canAddToChatbot.current = false;
      },
    })
  );

  useEffect(() => {
    if (chat.mounted) mountingMessages.current = false;
  }, [chat.mounted]);

  useEffect(() => {
    const init = async () => {
      if (chat.receivedMessages.length === 0) return;
      const latestMessage =
        chat.receivedMessages[chat.receivedMessages.length - 1];
      if (
        latestMessage &&
        latestMessage.data.body &&
        latestMessage.name === CHAT_MESSAGE_EVENT &&
        Date.now() - latestMessage.timestamp < 12000
      ) {
        const body = latestMessage.data.body;
        if (body.split(":")[0] === InteractionType.BUY_BADGES) {
          try {
            await Promise.all([
              refetchBadgePrice(),
              refetchUserEthBalance(),
              refetchBuyVipBadge(),
            ]);
          } catch (err) {
            console.log("VipBadgeBuy fetching error", err);
          }
        }
      }
    };
    init();
  }, [chat.receivedMessages]);

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
        color="white"
        bg={"#46a800"}
        border={"1px solid #46a800"}
        _focus={{}}
        _hover={{}}
        _active={{}}
        borderRadius="0px"
        onClick={() => buyVipBadge?.()}
        isDisabled={!buyVipBadge || generatedKey === NULL_ADDRESS_BYTES32}
      >
        <Text fontSize="20px">
          {generatedKey === NULL_ADDRESS_BYTES32
            ? "Key not generated"
            : `BUY 1 (costs ${truncateValue(
                formatUnits(badgePrice, 18),
                4
              )} ETH)`}
        </Text>
      </Button>
    </Flex>
  );
};
