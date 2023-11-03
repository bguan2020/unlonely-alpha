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
import { decodeEventLog, isAddress } from "viem";
import { usePublicClient } from "wagmi";
import Link from "next/link";

import { useChannelContext } from "../../hooks/context/useChannel";
import useUserAgent from "../../hooks/internal/useUserAgent";
import usePostSharesEvent from "../../hooks/server/usePostSharesEvent";
import { getContractFromNetwork } from "../../utils/contract";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";
import { EventType, InteractionType } from "../../constants";
import { useUser } from "../../hooks/context/useUser";
import useCloseSharesEvent from "../../hooks/server/useCloseSharesEvent";
import {
  useOpenEvent,
  useVerifyEvent,
} from "../../hooks/contracts/useSharesContractV2";
import { useNetworkContext } from "../../hooks/context/useNetwork";
import { SharesEventState } from "../../generated/graphql";
import useUpdateSharesEvent from "../../hooks/server/useUpdateSharesEvent";
import usePostBet from "../../hooks/server/gamblable/usePostBet";

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
  const { network } = useNetworkContext();
  const { localNetwork, explorerUrl } = network;
  const { channel, arcade } = useChannelContext();
  const { addToChatbot } = arcade;
  const { channelQueryData, refetch } = channel;
  const { isStandalone } = useUserAgent();
  const publicClient = usePublicClient();
  const toast = useToast();

  const { postSharesEvent, loading: postSharesEventLoading } =
    usePostSharesEvent({});
  const { updateSharesEvent, loading: updateSharesEventLoading } =
    useUpdateSharesEvent({});
  const { closeSharesEvent, loading: closeSharesEventLoading } =
    useCloseSharesEvent({});

  const [question, setQuestion] = useState("");
  const [eventVerified, setEventVerified] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<number | undefined>(
    undefined
  );
  const [endDecision, setEndDecision] = useState<boolean | undefined>(
    undefined
  );
  const [sharesSubject, setSharesSubject] = useState<string>("");
  const [openingEvent, setOpeningEvent] = useState<boolean>(false);

  const contract = getContractFromNetwork("unlonelySharesV2", localNetwork);

  const { postBet } = usePostBet({
    onError: (err) => {
      console.log(err);
    },
  });

  const isVerifier = useMemo(async () => {
    if (!contract.address || !contract.abi || !userAddress) return false;
    const res = await publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "isVerifier",
      args: [userAddress],
    });
    return Boolean(res);
  }, [contract, userAddress, publicClient]);

  const isSharesEventLive =
    channelQueryData?.sharesEvent?.[0]?.eventState === SharesEventState.Live;
  const isSharesEventLock =
    channelQueryData?.sharesEvent?.[0]?.eventState === SharesEventState.Lock;
  const isSharesEventPayout =
    channelQueryData?.sharesEvent?.[0]?.eventState === SharesEventState.Payout;

  const handleCreatedEventId = useCallback((eventId: number) => {
    setCreatedEventId(eventId);
  }, []);

  const _postSharesEvent = useCallback(
    async (sharesSubject: `0x${string}`, sharesSubjectQuestion: string) => {
      const data = await postSharesEvent({
        id: channelQueryData?.id ?? "",
        sharesSubjectQuestion: sharesSubjectQuestion,
        sharesSubjectAddress: sharesSubject,
      });
      await refetch();
      const eventId = Number(data?.res?.id ?? "0");
      handleCreatedEventId(eventId);
    },
    [channelQueryData, question, user, userAddress]
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
      if (eventState === SharesEventState.Live) {
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.EVENT_LIVE,
          title: "Event is live!",
          description: "event-live",
        });
        handleClose();
      }
      if (eventState === SharesEventState.Lock) {
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.EVENT_LOCK,
          title: "Event is locked!",
          description: "event-lock",
        });
        handleClose();
      }
    },
    [channelQueryData, user, userAddress]
  );

  const _closeSharesEvent = async () => {
    await closeSharesEvent({
      id: channelQueryData?.sharesEvent?.[0]?.id ?? "",
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

  const { openEvent, openEventTxLoading } = useOpenEvent(
    {
      eventAddress: sharesSubject as `0x${string}` as `0x${string}`,
      eventId: (channelQueryData?.sharesEvent?.[0]?.id ??
        createdEventId) as number,
      endTimestamp: BigInt("1699582502"),
    },
    contract,
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
                openEvent pending, click to view
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
              openEvent cancelled
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
                openEvent success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        await postBet({
          channelId: channelQueryData?.id as string,
          userAddress: userAddress as `0x${string}`,
        });
        setQuestion("");
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.EVENT_LIVE,
          title: "Event is live!",
          description: "event-live",
        });
        setOpeningEvent(false);
        handleClose();
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              openEvent error
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        setOpeningEvent(false);
      },
    }
  );

  const { verifyEvent, verifyEventTxLoading } = useVerifyEvent(
    {
      eventAddress: channelQueryData?.sharesEvent?.[0]
        ?.sharesSubjectAddress as `0x${string}`,
      eventId: Number(channelQueryData?.sharesEvent?.[0]?.id) ?? 0,
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
          abi: contract.abi,
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

  useEffect(() => {
    const c = async () => {
      setOpeningEvent(true);
      await openEvent?.();
    };
    if (createdEventId && openEvent) c();
  }, [createdEventId, openEvent]);

  useEffect(() => {
    const init = async () => {
      if (!channelQueryData?.sharesEvent?.[0] || !contract.address) return;
      const key = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "generateKey",
        args: [
          channelQueryData?.sharesEvent?.[0].sharesSubjectAddress,
          Number(channelQueryData?.sharesEvent?.[0].id),
          EventType.YAY_NAY_VOTE,
        ],
      });
      const res = await publicClient.readContract({
        address: contract.address as `0x${string}`,
        abi: contract.abi,
        functionName: "eventVerified",
        args: [key],
      });
      setEventVerified(Boolean(res));
    };
    init();
  }, [channelQueryData, contract.address, publicClient]);

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
      isModalLoading={
        postSharesEventLoading ||
        closeSharesEventLoading ||
        updateSharesEventLoading ||
        openEventTxLoading ||
        openingEvent
      }
      loadingText={`${
        closeSharesEventLoading ? "closing event" : "loading"
      }, please wait...`}
    >
      {isSharesEventLive && (
        <Flex direction="column" gap="10px">
          <Text textAlign={"center"} fontSize="13px">
            Betting will be locked and you can take the time to make your
            decision.
          </Text>
          <Button
            bg="#e35b16"
            _hover={{}}
            _focus={{}}
            _active={{}}
            width="100%"
            onClick={async () =>
              await _updateSharesEvent(SharesEventState.Lock)
            }
          >
            lock bets
          </Button>
        </Flex>
      )}
      {isSharesEventLock && (
        <Flex direction="column" gap="10px">
          <Text textAlign={"center"} fontSize="13px">
            The outcome of the event will be decided and winnings can start
            being claimed.
          </Text>
          <Text
            textAlign={"center"}
            fontSize="11px"
            color={"#8f81b6"}
            textDecoration="underline"
            cursor={"pointer"}
            onClick={async () =>
              await _updateSharesEvent(SharesEventState.Live)
            }
          >
            or allow voting again
          </Text>
          {!isVerifier && (
            <Text textAlign={"center"} fontSize="13px">
              You cannot verify events, please ask Brian for permission.
            </Text>
          )}
          {!verifyEventTxLoading ? (
            <>
              <Flex justifyContent={"space-evenly"} p="0.5rem">
                <Button
                  _hover={{}}
                  _focus={{}}
                  _active={{}}
                  transform={endDecision !== false ? undefined : "scale(0.95)"}
                  bg={endDecision !== false ? "#009d2a" : "#909090"}
                  onClick={() => setEndDecision(true)}
                  disabled={!isVerifier}
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
            By stopping the event, winnings can no longer be claimed and you
            will be able to make a new event.
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
            stop event
          </Button>
        </Flex>
      )}
      {!isSharesEventLive && !isSharesEventPayout && !isSharesEventLock && (
        <Flex direction="column" gap="10px">
          <Input
            variant="glow"
            placeholder={"Will I go on a second date?"}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Input
            variant="glow"
            placeholder={"your address to collect fees"}
            value={sharesSubject}
            onChange={(e) => setSharesSubject(e.target.value)}
          />
          <Button
            bg="#E09025"
            _hover={{}}
            _focus={{}}
            _active={{}}
            width="100%"
            disabled={question.length === 0 || !isAddress(sharesSubject)}
            onClick={async () =>
              channelQueryData?.sharesEvent &&
              channelQueryData?.sharesEvent?.length > 0
                ? await openEvent?.()
                : await _postSharesEvent(
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
