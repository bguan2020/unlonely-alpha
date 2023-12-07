import { useState, useMemo, useCallback } from "react";
import { Text, Flex, Button, useToast, Box } from "@chakra-ui/react";
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
export const JudgeBet = ({
  ethBalance,
  isVerifier,
  handleClose,
}: {
  ethBalance: bigint;
  isVerifier: boolean;
  handleClose: () => void;
}) => {
  const { userAddress, user } = useUser();
  const { network } = useNetworkContext();
  const { matchingChain, localNetwork, explorerUrl } = network;
  const contractData = getContractFromNetwork("unlonelySharesV2", localNetwork);
  const { channel, chat } = useChannelContext();
  const { addToChatbot } = chat;
  const { ongoingBets } = channel;
  const [endDecision, setEndDecision] = useState<boolean | undefined>(
    undefined
  );
  const toast = useToast();

  const { updateSharesEvent, loading: updateSharesEventLoading } =
    useUpdateSharesEvent({});
  const sufficientEthForGas = useMemo(
    () => ethBalance >= BigInt(1000000),
    [ethBalance]
  );

  const { verifyEvent, verifyEventTxLoading } = useVerifyEvent(
    {
      eventAddress: ongoingBets?.[0]?.sharesSubjectAddress as `0x${string}`,
      eventId: Number(ongoingBets?.[0]?.id) ?? 0,
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
    async (eventState: SharesEventState, result?: boolean) => {
      await updateSharesEvent({
        id: ongoingBets?.[0]?.id ?? "",
        sharesSubjectQuestion: ongoingBets?.[0]?.sharesSubjectQuestion ?? "",
        sharesSubjectAddress: ongoingBets?.[0]?.sharesSubjectAddress ?? "",
        eventState,
        result,
      });
    },
    [ongoingBets, user, userAddress]
  );

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