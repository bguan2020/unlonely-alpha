import {
  Input,
  Text,
  Flex,
  Button,
  Box,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { decodeEventLog } from "viem";
import { useNetwork, usePublicClient } from "wagmi";
import Link from "next/link";

import { NETWORKS } from "../../constants/networks";
import { useChannelContext } from "../../hooks/context/useChannel";
import useUserAgent from "../../hooks/internal/useUserAgent";
import usePostSharesEvent from "../../hooks/server/usePostSharesEvent";
import { getContractFromNetwork } from "../../utils/contract";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";
import { useVerifyEvent } from "../../hooks/contracts/useSharesContract";
import { InteractionType } from "../../constants";
import { useUser } from "../../hooks/context/useUser";
import useCloseSharesEvent from "../../hooks/server/useCloseSharesEvent";

export default function BetModal({
  title,
  isOpen,
  callback,
  handleClose,
}: {
  title: string;
  isOpen: boolean;
  callback?: any;
  handleClose: () => void;
}) {
  const { userAddress, user } = useUser();

  const { channel, arcade } = useChannelContext();
  const { addToChatbot } = arcade;
  const { channelQueryData } = channel;
  const { isStandalone } = useUserAgent();
  const publicClient = usePublicClient();
  const toast = useToast();

  const { postSharesEvent, loading: postSharesEventLoading } =
    usePostSharesEvent({});
  const { closeSharesEvent, loading: closeSharesEventLoading } =
    useCloseSharesEvent({});

  const [question, setQuestion] = useState("");
  const [eventVerified, setEventVerified] = useState(false);
  const [endDecision, setEndDecision] = useState<boolean | undefined>(
    undefined
  );
  const [sharesSubject, setSharesSubject] = useState<string>("");

  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === network.chain?.id);
  }, [network]);
  const contract = getContractFromNetwork("unlonelySharesV1", localNetwork);

  const isSharesEventLive =
    channelQueryData?.sharesEvent?.[0]?.eventState === "LIVE";
  const isSharesEventPayout =
    channelQueryData?.sharesEvent?.[0]?.eventState === "PAYOUT";

  const _postSharesEvent = useCallback(
    async (
      event: "LIVE" | "PAYOUT",
      sharesSubject?: `0x${string}`,
      sharesSubjectQuestion?: string
    ) => {
      await postSharesEvent({
        id: channelQueryData?.id ?? "",
        sharesSubjectQuestion:
          sharesSubjectQuestion ??
          channelQueryData?.sharesEvent?.[0]?.sharesSubjectQuestion ??
          "",
        sharesSubjectAddress:
          sharesSubject ??
          channelQueryData?.sharesEvent?.[0]?.sharesSubjectAddress ??
          "",
        eventState: event,
      });
      if (event === "LIVE") {
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.EVENT_LIVE,
          title: "New event has started!",
          description: "event-start",
        });
      }
      setQuestion("");
    },
    [channelQueryData, question, user, userAddress]
  );

  const _closeSharesEvent = async () => {
    await closeSharesEvent({
      id: channelQueryData?.id ?? "",
    });
    addToChatbot({
      username: user?.username ?? "",
      address: userAddress ?? "",
      taskType: InteractionType.EVENT_END,
      title: "Event has been closed",
      description: "event-end",
    });
    handleClose();
  };

  const { verifyEvent, verifyEventTxLoading } = useVerifyEvent(
    {
      sharesSubject: channelQueryData?.sharesEvent?.[0]
        ?.sharesSubjectAddress as `0x${string}`,
      result: endDecision ?? false,
    },
    contract,
    {
      onWriteSuccess: (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#287ab0" px={4} h={8}>
              <Link
                target="_blank"
                href={`https://etherscan.io/tx/${data.hash}`}
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
                href={`https://etherscan.io/tx/${data.transactionHash}`}
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
          abi: contract.abi,
          data: data.logs[0].data,
          topics: data.logs[0].topics,
        });
        const args: any = topics.args;
        await _postSharesEvent("PAYOUT");
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.EVENT_PAYOUT,
          title: `Event has ended, ${args.result ? "yes" : "no"} shares win!`,
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

  useEffect(() => {
    const init = async () => {
      if (
        !channelQueryData?.sharesEvent?.[0]?.sharesSubjectAddress ||
        !contract.address
      )
        return;
      const res = await publicClient.readContract({
        address: contract.address as `0x${string}`,
        abi: contract.abi,
        functionName: "eventVerified",
        args: [
          channelQueryData?.sharesEvent?.[0]
            ?.sharesSubjectAddress as `0x${string}`,
        ],
      });
      setEventVerified(Boolean(res));
    };
    init();
  }, [channelQueryData, contract]);

  return (
    <TransactionModalTemplate
      title={title}
      confirmButton={"confirm"}
      isOpen={isOpen}
      handleClose={() => {
        handleClose();
        setEndDecision(undefined);
      }}
      size={isStandalone ? "sm" : "md"}
      hideFooter
      isModalLoading={postSharesEventLoading || closeSharesEventLoading}
      loadingText={"loading, please wait..."}
    >
      {isSharesEventLive && (
        <Flex direction="column" gap="10px">
          <Text textAlign={"center"} fontSize="13px">
            Betting will be over and winnings can start being claimed.
          </Text>
          {!verifyEventTxLoading ? (
            <>
              <Flex justifyContent={"space-evenly"} p="0.5rem">
                <Button
                  _hover={{}}
                  _focus={{}}
                  _active={{}}
                  transform={endDecision === true ? undefined : "scale(0.95)"}
                  bg={endDecision === true ? "#009d2a" : "#909090"}
                  onClick={() => setEndDecision(true)}
                >
                  YES
                </Button>
                <Button
                  _hover={{}}
                  _focus={{}}
                  _active={{}}
                  transform={endDecision === false ? undefined : "scale(0.95)"}
                  bg={endDecision === false ? "#da3b14" : "#909090"}
                  onClick={() => setEndDecision(false)}
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
            </>
          ) : (
            <Flex justifyContent={"center"} p="0.5rem">
              <Spinner />
            </Flex>
          )}
        </Flex>
      )}
      {isSharesEventPayout && (
        <Flex direction="column" gap="10px">
          <Text textAlign={"center"} fontSize="13px">
            By stopping the event, the payout phase will be over.
          </Text>
          <Button
            bg="#E09025"
            _hover={{}}
            _focus={{}}
            _active={{}}
            width="100%"
            disabled={!eventVerified}
            onClick={_closeSharesEvent}
          >
            stop bet
          </Button>
        </Flex>
      )}
      {!isSharesEventLive && !isSharesEventPayout && (
        <Flex direction="column" gap="10px">
          <Text textAlign={"center"} fontSize="13px">
            Note: enter a new wallet address when you want to make another bet,
            we can also make it for you.
          </Text>
          <Input
            variant="glow"
            placeholder={"Will I go on a second date?"}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Input
            variant="glow"
            placeholder={"(admins only) sharesSubject address"}
            value={sharesSubject}
            onChange={(e) => setSharesSubject(e.target.value)}
          />
          <Button
            bg="#E09025"
            _hover={{}}
            _focus={{}}
            _active={{}}
            width="100%"
            disabled={question.length === 0 || eventVerified}
            onClick={async () =>
              await _postSharesEvent(
                "LIVE",
                sharesSubject as `0x${string}`,
                question
              )
            }
          >
            confirm
          </Button>
        </Flex>
      )}
    </TransactionModalTemplate>
  );
}
