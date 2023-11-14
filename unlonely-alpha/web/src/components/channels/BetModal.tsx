import {
  Input,
  Text,
  Flex,
  Button,
  Box,
  useToast,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { decodeEventLog } from "viem";
import { useBlockNumber, usePublicClient } from "wagmi";
import Link from "next/link";
import { ChevronDownIcon } from "@chakra-ui/icons";

import { useChannelContext } from "../../hooks/context/useChannel";
import useUserAgent from "../../hooks/internal/useUserAgent";
import usePostSharesEvent from "../../hooks/server/usePostSharesEvent";
import { getContractFromNetwork } from "../../utils/contract";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";
import { InteractionType, NULL_ADDRESS } from "../../constants";
import { useUser } from "../../hooks/context/useUser";
import useCloseSharesEvent from "../../hooks/server/useCloseSharesEvent";
import {
  useGenerateKey,
  useOpenEvent,
  useVerifyEvent,
} from "../../hooks/contracts/useSharesContractV2";
import { useNetworkContext } from "../../hooks/context/useNetwork";
import { SharesEventState } from "../../generated/graphql";
import useUpdateSharesEvent from "../../hooks/server/useUpdateSharesEvent";
import usePostBet from "../../hooks/server/gamblable/usePostBet";
import {
  getHourAndMinutesFromMillis,
  getTimeFromMillis,
} from "../../utils/time";

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
  const { matchingChain, localNetwork, explorerUrl } = network;
  const { channel, chat } = useChannelContext();
  const { addToChatbot } = chat;
  const { channelQueryData, refetch } = channel;
  const { isStandalone } = useUserAgent();
  const publicClient = usePublicClient();
  const toast = useToast();
  const isOpeningEvent = useRef(false);

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
  const [selectedEndTime, setSelectedEndTime] = useState<
    "10" | "30" | "60" | "120"
  >("60");
  const [eventEndTimestamp, setEventEndTimestamp] = useState<bigint>(BigInt(0));
  const [dateNow, setDateNow] = useState<number>(Date.now());
  const blockNumber = useBlockNumber({
    watch: true,
  });
  const contract = getContractFromNetwork("unlonelySharesV2", localNetwork);
  const [isVerifier, setIsVerifier] = useState<boolean>(false);

  const { postBet } = usePostBet({
    onError: (err) => {
      console.log(err);
    },
  });

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
    async (sharesSubjectQuestion: string) => {
      const data = await postSharesEvent({
        id: channelQueryData?.id ?? "",
        sharesSubjectQuestion: sharesSubjectQuestion,
        sharesSubjectAddress: userAddress,
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
      eventAddress:
        (channelQueryData?.sharesEvent?.[0]
          ?.sharesSubjectAddress as `0x${string}`) ??
        userAddress ??
        NULL_ADDRESS,
      eventId: (channelQueryData?.sharesEvent?.[0]?.id ??
        createdEventId ??
        0) as number,
      endTimestamp: BigInt(
        String(
          Math.floor((dateNow + Number(selectedEndTime) * 60 * 1000) / 1000)
        )
      ),
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
        isOpeningEvent.current = false;
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
        isOpeningEvent.current = false;
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
        isOpeningEvent.current = false;
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

  const { key: generatedKey } = useGenerateKey(
    channelQueryData?.owner?.address as `0x${string}`,
    Number(channelQueryData?.sharesEvent?.[0]?.id ?? "0"),
    contract
  );

  useEffect(() => {
    const c = async () => {
      isOpeningEvent.current = true;
      await openEvent?.();
    };
    if (createdEventId && openEvent && !isOpeningEvent.current) c();
  }, [createdEventId, openEvent]);

  useEffect(() => {
    const init = async () => {
      const [endTimestamp, eventVerified, isVerifier] = await Promise.all([
        publicClient.readContract({
          address: contract.address as `0x${string}`,
          abi: contract.abi,
          functionName: "eventEndTimestamp",
          args: [generatedKey],
        }),
        publicClient.readContract({
          address: contract.address as `0x${string}`,
          abi: contract.abi,
          functionName: "eventVerified",
          args: [generatedKey],
        }),
        publicClient.readContract({
          address: contract.address as `0x${string}`,
          abi: contract.abi,
          functionName: "isVerifier",
          args: [userAddress],
        }),
      ]);
      setDateNow(Date.now());
      setEventEndTimestamp(BigInt(String(endTimestamp)));
      setEventVerified(Boolean(eventVerified));
      setIsVerifier(Boolean(isVerifier));
    };
    init();
  }, [blockNumber.data]);

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
        openEventTxLoading
      }
      loadingText={`${
        closeSharesEventLoading ? "closing event" : "loading"
      }, please wait...`}
    >
      {isSharesEventLive && eventEndTimestamp === BigInt(0) && (
        <Flex direction="column" gap="10px">
          {!isVerifier && (
            <Text textAlign={"center"} fontSize="13px" color="red.300">
              You do not have access to this feature. Please DM @brianguan on
              telegram to get access to live-betting.
            </Text>
          )}
          <Text textAlign={"center"} fontSize="13px">
            Please continue the process to initiate your event
          </Text>
          <Text>event duration</Text>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              bg={"#244FA7"}
              _hover={{}}
              _focus={{}}
              _active={{}}
            >
              {selectedEndTime === "10"
                ? "10 mins"
                : selectedEndTime === "30"
                ? "30 mins"
                : selectedEndTime === "60"
                ? "1 hour"
                : "2 hours"}
            </MenuButton>
            <MenuList bg="#000" border="none">
              <MenuItem
                bg={"rgb(36, 79, 167)"}
                opacity="0.8"
                _hover={{ opacity: "1" }}
                _focus={{ opacity: "1" }}
                _active={{ opacity: "1" }}
                onClick={() => setSelectedEndTime("10")}
              >
                {`10 mins (until ${getHourAndMinutesFromMillis(
                  dateNow + 10 * 60 * 1000
                )})`}
              </MenuItem>
              <MenuItem
                bg={"rgb(36, 79, 167)"}
                opacity="0.8"
                _hover={{ opacity: "1" }}
                _focus={{ opacity: "1" }}
                _active={{ opacity: "1" }}
                onClick={() => setSelectedEndTime("30")}
              >
                {`30 mins (until ${getHourAndMinutesFromMillis(
                  dateNow + 30 * 60 * 1000
                )})`}
              </MenuItem>
              <MenuItem
                bg={"rgb(36, 79, 167)"}
                opacity="0.8"
                _hover={{ opacity: "1" }}
                _focus={{ opacity: "1" }}
                _active={{ opacity: "1" }}
                onClick={() => setSelectedEndTime("60")}
              >
                {`1 hour (until ${getHourAndMinutesFromMillis(
                  dateNow + 60 * 60 * 1000
                )})`}
              </MenuItem>
              <MenuItem
                bg={"rgb(36, 79, 167)"}
                opacity="0.8"
                _hover={{ opacity: "1" }}
                _focus={{ opacity: "1" }}
                _active={{ opacity: "1" }}
                onClick={() => setSelectedEndTime("120")}
              >
                {`2 hour (until ${getHourAndMinutesFromMillis(
                  dateNow + 120 * 60 * 1000
                )})`}
              </MenuItem>
            </MenuList>
          </Menu>
          <Button
            bg="#E09025"
            _hover={{}}
            _focus={{}}
            _active={{}}
            width="100%"
            disabled={!openEvent}
            onClick={openEvent}
          >
            confirm
          </Button>
        </Flex>
      )}
      {isSharesEventLive && eventEndTimestamp > BigInt(0) && (
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
          {eventEndTimestamp > BigInt(0) && (
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
              {`or allow voting again (still got${getTimeFromMillis(
                Number(eventEndTimestamp) * 1000 - dateNow
              )})`}
            </Text>
          )}
          {!isVerifier && (
            <Text textAlign={"center"} fontSize="13px" color="red.300">
              You do not have access to this feature. Please DM @brianguan on
              telegram to get access to live-betting.
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
          {!isVerifier && (
            <Text textAlign={"center"} fontSize="13px" color="red.300">
              You do not have access to this feature. Please DM @brianguan on
              telegram to get access to live-betting.
            </Text>
          )}
          {!matchingChain && (
            <Text textAlign={"center"} fontSize="13px" color="red.300">
              wrong network
            </Text>
          )}
          <Input
            variant="glow"
            placeholder={"Will I go on a second date?"}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Text>event duration</Text>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              bg={"#244FA7"}
              _hover={{}}
              _focus={{}}
              _active={{}}
            >
              {selectedEndTime === "10"
                ? "10 mins"
                : selectedEndTime === "30"
                ? "30 mins"
                : selectedEndTime === "60"
                ? "1 hour"
                : "2 hours"}
            </MenuButton>
            <MenuList bg="#000" border="none">
              <MenuItem
                bg={"rgb(36, 79, 167)"}
                opacity="0.8"
                _hover={{ opacity: "1" }}
                _focus={{ opacity: "1" }}
                _active={{ opacity: "1" }}
                onClick={() => setSelectedEndTime("10")}
              >
                {`10 mins (until ${getHourAndMinutesFromMillis(
                  dateNow + 10 * 60 * 1000
                )})`}
              </MenuItem>
              <MenuItem
                bg={"rgb(36, 79, 167)"}
                opacity="0.8"
                _hover={{ opacity: "1" }}
                _focus={{ opacity: "1" }}
                _active={{ opacity: "1" }}
                onClick={() => setSelectedEndTime("30")}
              >
                {`30 mins (until ${getHourAndMinutesFromMillis(
                  dateNow + 30 * 60 * 1000
                )})`}
              </MenuItem>
              <MenuItem
                bg={"rgb(36, 79, 167)"}
                opacity="0.8"
                _hover={{ opacity: "1" }}
                _focus={{ opacity: "1" }}
                _active={{ opacity: "1" }}
                onClick={() => setSelectedEndTime("60")}
              >
                {`1 hour (until ${getHourAndMinutesFromMillis(
                  dateNow + 60 * 60 * 1000
                )})`}
              </MenuItem>
              <MenuItem
                bg={"rgb(36, 79, 167)"}
                opacity="0.8"
                _hover={{ opacity: "1" }}
                _focus={{ opacity: "1" }}
                _active={{ opacity: "1" }}
                onClick={() => setSelectedEndTime("120")}
              >
                {`2 hours (until ${getHourAndMinutesFromMillis(
                  dateNow + 120 * 60 * 1000
                )})`}
              </MenuItem>
            </MenuList>
          </Menu>
          <Button
            bg="#E09025"
            _hover={{}}
            _focus={{}}
            _active={{}}
            width="100%"
            disabled={question.length === 0 || !isVerifier || !matchingChain}
            onClick={async () =>
              channelQueryData?.sharesEvent &&
              channelQueryData?.sharesEvent?.length > 0
                ? await openEvent?.()
                : await _postSharesEvent(question)
            }
          >
            confirm
          </Button>
        </Flex>
      )}
    </TransactionModalTemplate>
  );
}
