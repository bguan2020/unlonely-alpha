import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Text, Flex, Button, useToast, Box } from "@chakra-ui/react";
import Link from "next/link";
import { decodeEventLog } from "viem";
import { usePublicClient } from "wagmi";

import { getContractFromNetwork } from "../../../utils/contract";
import { useNetworkContext } from "../../../hooks/context/useNetwork";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { useUser } from "../../../hooks/context/useUser";
import { useVerifyEvent } from "../../../hooks/contracts/useSharesContractV2";
import { InteractionType } from "../../../constants";
import { SharesEventState } from "../../../generated/graphql";
import useUpdateSharesEvent from "../../../hooks/server/useUpdateSharesEvent";
export const JudgeBet = ({
  ethBalance,
  isVerifier,
  eventVerified,
  handleClose,
}: {
  ethBalance: bigint;
  isVerifier: boolean;
  eventVerified: boolean;
  handleClose: () => void;
}) => {
  const { userAddress, user } = useUser();
  const { network } = useNetworkContext();
  const { matchingChain, localNetwork, explorerUrl } = network;
  const contractData = getContractFromNetwork("unlonelySharesV2", localNetwork);
  const { channel, chat } = useChannelContext();
  const { addToChatbot } = chat;
  const { ongoingBets, refetch } = channel;
  const [endDecision, setEndDecision] = useState<boolean | undefined>(
    undefined
  );
  const toast = useToast();
  const canAddToChatbot = useRef(false);
  const publicClient = usePublicClient();
  const [requiredGas, setRequiredGas] = useState<bigint>(BigInt(0));

  const sufficientEthForGas = useMemo(
    () => ethBalance >= requiredGas,
    [ethBalance, requiredGas]
  );

  const isFetching = useRef(false);

  const { updateSharesEvent } = useUpdateSharesEvent({});

  const {
    verifyEvent,
    refetch: refetchVerifyEvent,
    verifyEventTxLoading,
  } = useVerifyEvent(
    {
      eventAddress: ongoingBets?.[0]?.sharesSubjectAddress as `0x${string}`,
      eventId: Number(ongoingBets?.[0]?.id) ?? 0,
      result: endDecision ?? false,
      enabled: !eventVerified && ongoingBets.length > 0,
    },
    contractData,
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
                verifyEvent pending, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        canAddToChatbot.current = true;
      },
      onWriteError: (error) => {
        toast({
          duration: 9000,
          isClosable: true,
          position: "top-right",
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              verifyEvent cancelled
            </Box>
          ),
        });
        canAddToChatbot.current = false;
      },
      onTxSuccess: async (data) => {
        if (!canAddToChatbot.current) return;
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                verifyEvent success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        const topics = decodeEventLog({
          abi: contractData.abi,
          data: data.logs[0].data,
          topics: data.logs[0].topics,
        });
        const args: any = topics.args;
        await _updateSharesEvent(
          SharesEventState.Payout,
          args.result as boolean
        );
        setEndDecision(undefined);
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.EVENT_PAYOUT,
          title: `Event has ended, ${
            args.result
              ? ongoingBets?.[0]?.options?.[0] ?? "yes"
              : ongoingBets?.[0]?.options?.[1] ?? "no"
          } votes win!`,
          description: "event-end",
        });
        canAddToChatbot.current = false;
        handleClose();
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              verifyEvent error
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        canAddToChatbot.current = false;
      },
    }
  );

  const _updateSharesEvent = useCallback(
    async (eventState: SharesEventState, result?: boolean) => {
      await updateSharesEvent({
        id: ongoingBets?.[0]?.id ?? "",
        sharesSubjectQuestion: ongoingBets?.[0]?.sharesSubjectQuestion ?? "",
        sharesSubjectAddress: ongoingBets?.[0]?.sharesSubjectAddress ?? "",
        eventState,
        resultIndex: result ? 0 : 1,
      });
    },
    [ongoingBets, user, userAddress]
  );

  useEffect(() => {
    const estimateGas = async () => {
      if (isFetching.current) return;
      isFetching.current = true;
      const gas = await publicClient
        .estimateContractGas({
          address: contractData.address as `0x${string}`,
          abi: contractData.abi,
          functionName: "verifyEvent",
          args: [userAddress as `0x${string}`, 0, 0, true],
          account: userAddress as `0x${string}`,
        })
        .then((data) => {
          return data;
        })
        .catch((e) => {
          console.log("calling error", e);
          return BigInt(0);
        });
      const adjustedGas = BigInt(Math.round(Number(gas) * 1.5));
      setRequiredGas(adjustedGas);
      isFetching.current = false;
    };
    if (publicClient && contractData && userAddress && isVerifier) {
      estimateGas();
    }
  }, [publicClient, contractData, userAddress, isVerifier]);

  useEffect(() => {
    const interval = setInterval(async () => {
      await refetchVerifyEvent();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Flex direction="column" gap="10px">
      {!isVerifier ? (
        <Text textAlign={"center"} fontSize="13px" color="red.300">
          You do not have access to this feature. Please DM @brianguan on
          telegram to get access to live-betting.
        </Text>
      ) : !sufficientEthForGas ? (
        <Text textAlign={"center"} fontSize="13px" color="red.300">
          You do not have enough ETH to use this feature. Please send some ETH
          to your wallet over Base network. We recommend having at least 0.01
          ETH for most cases.
        </Text>
      ) : null}
      {!matchingChain && (
        <Text textAlign={"center"} fontSize="13px" color="red.300">
          wrong network
        </Text>
      )}
      <Text textAlign={"center"} fontSize="13px">
        The outcome of the event will be decided and winnings can start being
        claimed.
      </Text>
      <Flex gap="5px">
        <Button
          color="white"
          _hover={{}}
          _focus={{}}
          _active={{}}
          transform={endDecision !== false ? undefined : "scale(0.95)"}
          bg={endDecision !== false ? "rgba(10, 179, 18, 1)" : "#909090"}
          onClick={() => setEndDecision(true)}
          isDisabled={!isVerifier}
          w="100%"
        >
          {ongoingBets?.[0]?.options?.[0] ?? "YES"}
        </Button>
        <Button
          color="white"
          _hover={{}}
          _focus={{}}
          _active={{}}
          transform={endDecision !== true ? undefined : "scale(0.95)"}
          bg={endDecision !== true ? "rgba(218, 58, 19, 1)" : "#909090"}
          onClick={() => setEndDecision(false)}
          isDisabled={!isVerifier}
          w="100%"
        >
          {ongoingBets?.[0]?.options?.[1] ?? "NO"}
        </Button>
      </Flex>
      {endDecision !== undefined && (
        <Flex justifyContent={"center"} pb="0.5rem">
          <Button
            color="white"
            _hover={{}}
            _focus={{}}
            _active={{}}
            bg="#0057bb"
            isDisabled={
              !verifyEvent ||
              (!matchingChain && !localNetwork.config.isTestnet) ||
              verifyEventTxLoading
            }
            onClick={verifyEvent}
          >
            confirm{" "}
            {endDecision
              ? ongoingBets?.[0]?.options?.[0] ?? "yes"
              : ongoingBets?.[0]?.options?.[1] ?? "no"}
          </Button>
        </Flex>
      )}
    </Flex>
  );
};
