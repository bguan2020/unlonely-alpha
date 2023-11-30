import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useToast,
  Text,
} from "@chakra-ui/react";
import { useBalance, useBlockNumber, usePublicClient } from "wagmi";
import Link from "next/link";
import { ChevronDownIcon } from "@chakra-ui/icons";

import { useChannelContext } from "../../../hooks/context/useChannel";
import { useNetworkContext } from "../../../hooks/context/useNetwork";
import { useUser } from "../../../hooks/context/useUser";
import usePostSharesEvent from "../../../hooks/server/usePostSharesEvent";
import { getContractFromNetwork } from "../../../utils/contract";
import usePostBet from "../../../hooks/server/gamblable/usePostBet";
import { InteractionType, NULL_ADDRESS } from "../../../constants";
import {
  useGenerateKey,
  useOpenEvent,
} from "../../../hooks/contracts/useSharesContractV2";
import { getHourAndMinutesFromMillis } from "../../../utils/time";

const MAX_CHARS = 8;

export const CreateBet = ({ handleClose }: { handleClose: () => void }) => {
  const { userAddress, user } = useUser();
  const { network } = useNetworkContext();
  const { matchingChain, localNetwork, explorerUrl } = network;
  const { channel, chat } = useChannelContext();
  const { addToChatbot } = chat;
  const { channelQueryData, refetch } = channel;
  const publicClient = usePublicClient();
  const toast = useToast();
  const isOpeningEvent = useRef(false);
  const { postSharesEvent, loading: postSharesEventLoading } =
    usePostSharesEvent({});

  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState<string[]>(["yes", "no"]);
  const [createdEventId, setCreatedEventId] = useState<number | undefined>(
    undefined
  );
  const [selectedEndTime, setSelectedEndTime] = useState<
    "10" | "30" | "60" | "120"
  >("60");

  const [eventEndTimestamp, setEventEndTimestamp] = useState<bigint>(BigInt(0));
  const eventNeedsProcessing = useMemo(
    () =>
      eventEndTimestamp === BigInt(0) &&
      (channelQueryData?.sharesEvent?.length ?? 0) > 0,
    [eventEndTimestamp, channelQueryData?.sharesEvent?.length]
  );
  const [dateNow, setDateNow] = useState<number>(Date.now());
  const blockNumber = useBlockNumber({
    watch: true,
  });
  const contractData = getContractFromNetwork("unlonelySharesV2", localNetwork);
  const [isVerifier, setIsVerifier] = useState<boolean>(true);

  const { data: userEthBalance, refetch: refetchUserEthBalance } = useBalance({
    address: userAddress as `0x${string}`,
  });

  const sufficientEthForGas = useMemo(
    () => userEthBalance && userEthBalance.value >= BigInt(1000000),
    [userEthBalance?.value]
  );

  console.log(
    channelQueryData?.sharesEvent?.[0]?.id,
    eventEndTimestamp === BigInt(0)
  );

  const { key: generatedKey } = useGenerateKey(
    channelQueryData?.owner?.address as `0x${string}`,
    Number(channelQueryData?.sharesEvent?.[0]?.id ?? "0"),
    contractData
  );

  const { postBet } = usePostBet({
    onError: (err) => {
      console.log(err);
    },
  });

  const handleCreatedEventId = useCallback((eventId: number) => {
    setCreatedEventId(eventId);
  }, []);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const _postSharesEvent = useCallback(
    async (sharesSubjectQuestion: string) => {
      const data = await postSharesEvent({
        id: channelQueryData?.id ?? "",
        sharesSubjectQuestion: sharesSubjectQuestion,
        sharesSubjectAddress: userAddress,
        answers: ["yes", "no"],
      });
      await refetch();
      const eventId = Number(data?.res?.id ?? "0");
      handleCreatedEventId(eventId);
    },
    [channelQueryData, question, user, userAddress]
  );

  const { openEvent, openEventTxLoading } = useOpenEvent(
    {
      eventAddress: userAddress ?? NULL_ADDRESS,
      eventId: (createdEventId ?? 0) as number,
      endTimestamp: BigInt(
        String(
          Math.floor((dateNow + Number(selectedEndTime) * 60 * 1000) / 1000)
        )
      ),
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
          sharesEventId: (channelQueryData?.sharesEvent?.[0]?.id ??
            createdEventId ??
            0) as number,
        });
        setQuestion("");
        setCreatedEventId(undefined);
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

  useEffect(() => {
    const c = async () => {
      isOpeningEvent.current = true;
      await openEvent?.();
    };
    if (createdEventId && openEvent && !isOpeningEvent.current) c();
  }, [createdEventId, openEvent]);

  useEffect(() => {
    const init = async () => {
      const [endTimestamp, isVerifier] = await Promise.all([
        publicClient.readContract({
          address: contractData.address as `0x${string}`,
          abi: contractData.abi,
          functionName: "eventEndTimestamp",
          args: [generatedKey],
        }),
        publicClient.readContract({
          address: contractData.address as `0x${string}`,
          abi: contractData.abi,
          functionName: "isVerifier",
          args: [userAddress],
        }),
      ]);
      refetchUserEthBalance();
      setEventEndTimestamp(BigInt(String(endTimestamp)));
      setDateNow(Date.now());
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
      {eventNeedsProcessing ? (
        <Text textAlign={"center"} fontSize="13px">
          Please continue the process to initiate your event
        </Text>
      ) : (
        <>
          <Input
            variant="glow"
            placeholder={"Will I go on a second date?"}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Text>{`create answers (up to ${MAX_CHARS} characters)`}</Text>
          <Flex gap="1rem">
            <Input
              variant="glow"
              placeholder={"YES"}
              textAlign="center"
              value={answers[0]}
              onChange={(e) =>
                handleAnswerChange(0, e.target.value.slice(0, MAX_CHARS))
              }
            />
            <Input
              variant="glow"
              placeholder={"NO"}
              textAlign="center"
              value={answers[1]}
              onChange={(e) =>
                handleAnswerChange(1, e.target.value.slice(0, MAX_CHARS))
              }
            />
          </Flex>
        </>
      )}
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
        disabled={
          (!eventNeedsProcessing && question.length === 0) ||
          !isVerifier ||
          !matchingChain ||
          !sufficientEthForGas
        }
        onClick={async () =>
          eventNeedsProcessing
            ? await openEvent?.()
            : await _postSharesEvent(question)
        }
      >
        confirm
      </Button>
    </Flex>
  );
};
