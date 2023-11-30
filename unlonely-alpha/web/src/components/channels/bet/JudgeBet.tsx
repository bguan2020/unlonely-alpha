import { useState, useEffect, useMemo, useCallback } from "react";
import { Text, Flex, Button, useToast, Box } from "@chakra-ui/react";
import { useBalance, useBlockNumber, usePublicClient } from "wagmi";
import Link from "next/link";
import { decodeEventLog } from "viem";

import { getContractFromNetwork } from "../../../utils/contract";
import { useNetworkContext } from "../../../hooks/context/useNetwork";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { useUser } from "../../../hooks/context/useUser";
import { useVerifyEvent } from "../../../hooks/contracts/useSharesContractV2";
import { InteractionType } from "../../../constants";
import { SharesEventState } from "../../../generated/graphql";
import useUpdateSharesEvent from "../../../hooks/server/useUpdateSharesEvent";
export const JudgeBet = ({ handleClose }: { handleClose: () => void }) => {
  const { userAddress, user } = useUser();
  const blockNumber = useBlockNumber({
    watch: true,
  });
  const { network } = useNetworkContext();
  const { matchingChain, localNetwork, explorerUrl } = network;
  const publicClient = usePublicClient();
  const contractData = getContractFromNetwork("unlonelySharesV2", localNetwork);
  const { channel, chat } = useChannelContext();
  const { addToChatbot } = chat;
  const { channelQueryData } = channel;
  const [endDecision, setEndDecision] = useState<boolean | undefined>(
    undefined
  );
  const [isVerifier, setIsVerifier] = useState<boolean>(true);
  const toast = useToast();

  const { data: userEthBalance, refetch: refetchUserEthBalance } = useBalance({
    address: userAddress as `0x${string}`,
  });
  const { updateSharesEvent, loading: updateSharesEventLoading } =
    useUpdateSharesEvent({});
  const sufficientEthForGas = useMemo(
    () => userEthBalance && userEthBalance.value >= BigInt(1000000),
    [userEthBalance?.value]
  );

  const { verifyEvent, verifyEventTxLoading } = useVerifyEvent(
    {
      eventAddress: channelQueryData?.sharesEvent?.[0]
        ?.sharesSubjectAddress as `0x${string}`,
      eventId: Number(channelQueryData?.sharesEvent?.[0]?.id) ?? 0,
      result: endDecision ?? false,
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
                verifyEvent success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        setEndDecision(undefined);
        const topics = decodeEventLog({
          abi: contractData.abi,
          data: data.logs[0].data,
          topics: data.logs[0].topics,
        });
        const args: any = topics.args;
        await _updateSharesEvent(SharesEventState.Payout);
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.EVENT_PAYOUT,
          title: `Event has ended, ${args.result ? "yes" : "no"} votes win!`,
          description: "event-end",
        });
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
      },
    }
  );

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
    },
    [channelQueryData, user, userAddress]
  );

  useEffect(() => {
    const init = async () => {
      const isVerifier = await publicClient.readContract({
        address: contractData.address as `0x${string}`,
        abi: contractData.abi,
        functionName: "isVerifier",
        args: [userAddress],
      });
      refetchUserEthBalance();
      setIsVerifier(Boolean(isVerifier));
    };
    init();
  }, [blockNumber.data]);

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
          _hover={{}}
          _focus={{}}
          _active={{}}
          transform={endDecision !== false ? undefined : "scale(0.95)"}
          bg={endDecision !== false ? "#009d2a" : "#909090"}
          onClick={() => setEndDecision(true)}
          disabled={!isVerifier}
          w="100%"
        >
          YES
        </Button>
        <Button
          _hover={{}}
          _focus={{}}
          _active={{}}
          transform={endDecision !== true ? undefined : "scale(0.95)"}
          bg={endDecision !== true ? "#da3b14" : "#909090"}
          onClick={() => setEndDecision(false)}
          disabled={!isVerifier}
          w="100%"
        >
          NO
        </Button>
      </Flex>
      {endDecision !== undefined && (
        <Flex justifyContent={"center"} pb="0.5rem">
          <Button
            _hover={{}}
            _focus={{}}
            _active={{}}
            bg="#0057bb"
            isDisabled={!verifyEvent}
            onClick={verifyEvent}
          >
            confirm {endDecision ? "yes" : "no"}
          </Button>
        </Flex>
      )}
    </Flex>
  );
};
