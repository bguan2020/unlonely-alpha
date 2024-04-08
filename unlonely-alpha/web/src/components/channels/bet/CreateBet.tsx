import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useToast,
  Text,
  Step,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
  Input,
  Spinner,
  StepDescription,
} from "@chakra-ui/react";
import { usePublicClient } from "wagmi";
import Link from "next/link";
import { ChevronDownIcon } from "@chakra-ui/icons";

import { useChannelContext } from "../../../hooks/context/useChannel";
import { useNetworkContext } from "../../../hooks/context/useNetwork";
import { useUser } from "../../../hooks/context/useUser";
import usePostSharesEvent from "../../../hooks/server/channel/usePostSharesEvent";
import { getContractFromNetwork } from "../../../utils/contract";
import usePostBet from "../../../hooks/server/gamblable/usePostBet";
import {
  Contract,
  EventTypeForContract,
  InteractionType,
  NULL_ADDRESS,
  NULL_ADDRESS_BYTES32,
} from "../../../constants";
import { useOpenEvent } from "../../../hooks/contracts/useSharesContractV2";
import { getConvertedDateFromMillis } from "../../../utils/time";
import {
  EventType,
  SharesEvent,
  SharesEventState,
} from "../../../generated/graphql";
import useUpdateSharesEvent from "../../../hooks/server/channel/useUpdateSharesEvent";
import useCloseSharesEvent from "../../../hooks/server/channel/useCloseSharesEvent";
import { ContractData } from "../../../constants/types";

const MAX_CHARS = 8;

export const CreateBet = ({
  pool,
  generatedKey,
  ethBalance,
  isVerifier,
  handleClose,
}: {
  pool: bigint;
  generatedKey: string;
  ethBalance: bigint;
  isVerifier: boolean;
  handleClose: () => void;
}) => {
  const { userAddress, user } = useUser();
  const publicClient = usePublicClient();
  const { network } = useNetworkContext();
  const { matchingChain, localNetwork } = network;
  const { channel } = useChannelContext();
  const {
    channelQueryData,
    refetchChannel,
    loading: channelQueryLoading,
    latestBet,
  } = channel;
  const { postSharesEvent, loading: postSharesEventLoading } =
    usePostSharesEvent({});

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState<string | undefined>("prepping");
  const [requiredGas, setRequiredGas] = useState<bigint>(BigInt(0));

  const pendingBet = useMemo(
    () =>
      latestBet && latestBet.eventState === SharesEventState.Pending
        ? latestBet
        : undefined,
    [latestBet]
  );

  const isFetching = useRef(false);

  const steps = [
    { title: "Start", description: "create bet" },
    { title: "Finish", description: "set time limit" },
  ];
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  const [dateNow, setDateNow] = useState<number>(Date.now());
  const contractData = getContractFromNetwork(Contract.SHARES_V2, localNetwork);

  const sufficientEthForGas = useMemo(
    () => ethBalance >= requiredGas,
    [ethBalance, requiredGas]
  );

  const currentBetIsActiveAndHasFunds = useMemo(
    () =>
      latestBet?.eventState !== undefined &&
      pool > BigInt(0) &&
      latestBet?.eventState !== SharesEventState.Payout &&
      latestBet?.eventState !== SharesEventState.PayoutPrevious &&
      latestBet?.eventState !== SharesEventState.Pending,
    [pool, latestBet]
  );

  const { closeSharesEvents } = useCloseSharesEvent({
    onError: (err) => {
      console.log(err);
    },
  });
  const { updateSharesEvent } = useUpdateSharesEvent({});

  const _postSharesEvent = useCallback(
    async (sharesSubjectQuestion: string) => {
      if (latestBet?.eventState === SharesEventState.Payout) {
        await updateSharesEvent({
          id: latestBet?.id ?? "",
          sharesSubjectQuestion: latestBet?.sharesSubjectQuestion ?? "",
          sharesSubjectAddress: latestBet?.sharesSubjectAddress ?? "",
          eventState: SharesEventState.PayoutPrevious,
          resultIndex: latestBet?.resultIndex ?? undefined,
        });
      }
      if (
        latestBet &&
        pool === BigInt(0) &&
        latestBet?.eventState !== SharesEventState.Pending
      ) {
        await closeSharesEvents({
          chainId: localNetwork.config.chainId,
          channelId: channelQueryData?.id as string,
          sharesEventIds: [Number(latestBet?.id ?? "0")],
        });
      }
      await postSharesEvent({
        id: channelQueryData?.id ?? "",
        sharesSubjectQuestion: sharesSubjectQuestion,
        sharesSubjectAddress: userAddress,
        options: [
          options[0] === "" ? "YES" : options[0],
          options[1] === "" ? "NO" : options[1],
        ],
        chainId: localNetwork.config.chainId,
      });
      await refetchChannel().then(() => handleLoading(undefined));
    },
    [
      latestBet,
      channelQueryData,
      question,
      user,
      userAddress,
      localNetwork.config.chainId,
      options,
      pool,
    ]
  );

  useEffect(() => {
    if (!pendingBet) return;
    setActiveStep(1);
  }, [pendingBet]);

  const handleAnswerChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleLoading = useCallback((value?: string) => {
    setLoading(value);
  }, []);

  useEffect(() => {
    const estimateGas = async () => {
      if (isFetching.current) return;
      isFetching.current = true;
      const gas = await publicClient
        .estimateContractGas({
          address: contractData.address as `0x${string}`,
          abi: contractData.abi,
          functionName: "openEvent",
          args: [
            userAddress as `0x${string}`,
            0,
            EventTypeForContract.YAY_NAY_VOTE,
            BigInt(String(Math.floor((dateNow + 60 * 60 * 1000) / 1000))),
          ],
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
    if (
      publicClient &&
      contractData &&
      channelQueryData &&
      userAddress &&
      isVerifier
    ) {
      estimateGas();
    }
  }, [
    publicClient,
    contractData,
    channelQueryData,
    userAddress,
    dateNow,
    isVerifier,
  ]);

  useEffect(() => {
    if (generatedKey !== NULL_ADDRESS_BYTES32) {
      handleLoading(undefined);
    }
  }, [generatedKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDateNow(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Flex direction="column" gap="10px" mt="10px">
      <Stepper index={activeStep}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>

            <Box>
              <StepTitle>
                <Text fontFamily="LoRes15">{step.title}</Text>
              </StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </Box>

            <StepSeparator />
          </Step>
        ))}
      </Stepper>
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
      ) : currentBetIsActiveAndHasFunds ? (
        <Text textAlign={"center"} fontSize="13px" color="red.300">
          The current bet already has ETH in the pool. Please select the winner
          for it before creating a new one.
        </Text>
      ) : null}
      {!matchingChain && (
        <Text textAlign={"center"} fontSize="13px" color="red.300">
          wrong network
        </Text>
      )}
      {pendingBet ? (
        <OpenEventInterface
          isVerifier={isVerifier}
          sufficientEthForGas={sufficientEthForGas}
          currentBetIsActiveAndHasFunds={currentBetIsActiveAndHasFunds}
          dateNow={dateNow}
          pendingBet={pendingBet}
          contractData={contractData}
          loading={loading}
          handleLoading={handleLoading}
          handleClose={handleClose}
        />
      ) : (
        <>
          {loading || postSharesEventLoading || channelQueryLoading ? (
            <Flex direction={"column"}>
              <Flex justifyContent="center">
                <Spinner />
              </Flex>
              <Text textAlign={"center"}>{loading ?? "loading"}</Text>
            </Flex>
          ) : (
            <>
              <Text color={question.length === 0 ? "red.300" : "unset"}>
                enter the question for the event
              </Text>
              <Input
                variant="glow"
                placeholder={"Will I go on a second date?"}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <Text>{`create options (up to ${MAX_CHARS} characters)`}</Text>
              <Flex gap="1rem">
                <Input
                  variant="glow"
                  placeholder={"YES"}
                  textAlign="center"
                  value={options[0]}
                  onChange={(e) =>
                    handleAnswerChange(0, e.target.value.slice(0, MAX_CHARS))
                  }
                />
                <Input
                  variant="glow"
                  placeholder={"NO"}
                  textAlign="center"
                  value={options[1]}
                  onChange={(e) =>
                    handleAnswerChange(1, e.target.value.slice(0, MAX_CHARS))
                  }
                />
              </Flex>
              <Button
                color="white"
                bg="#E09025"
                _hover={{}}
                _focus={{}}
                _active={{}}
                width="100%"
                isDisabled={
                  pendingBet ||
                  question.length === 0 ||
                  !isVerifier ||
                  (!matchingChain && !localNetwork.config.isTestnet) ||
                  !sufficientEthForGas ||
                  currentBetIsActiveAndHasFunds
                }
                onClick={async () => {
                  handleLoading("creating bet (1/2)");
                  await _postSharesEvent(question);
                }}
              >
                next
              </Button>
            </>
          )}
        </>
      )}
    </Flex>
  );
};

const OpenEventInterface = ({
  isVerifier,
  sufficientEthForGas,
  currentBetIsActiveAndHasFunds,
  dateNow,
  pendingBet,
  contractData,
  loading,
  handleLoading,
  handleClose,
}: {
  isVerifier: boolean;
  sufficientEthForGas: boolean;
  currentBetIsActiveAndHasFunds: boolean;
  dateNow: number;
  pendingBet: SharesEvent;
  contractData: ContractData;
  loading?: string;
  handleLoading: (value?: string) => void;
  handleClose: () => void;
}) => {
  const { userAddress, user } = useUser();
  const { channel, chat } = useChannelContext();
  const { addToChatbot } = chat;
  const {
    channelQueryData,
    loading: channelQueryLoading,
    refetchChannel,
  } = channel;
  const [selectedEndTime, setSelectedEndTime] = useState<
    "10" | "30" | "60" | "120"
  >("60");
  const toast = useToast();
  const { network } = useNetworkContext();
  const canAddToChatbot = useRef(false);
  const { explorerUrl, matchingChain, localNetwork } = network;

  const { postBet } = usePostBet({
    onError: (err) => {
      console.log(err);
    },
  });

  const { updateSharesEvent, loading: updateSharesEventLoading } =
    useUpdateSharesEvent({});

  const { closeSharesEvents, loading: closeLoading } = useCloseSharesEvent({});

  const _updateSharesEvent = useCallback(
    async (eventState: SharesEventState) => {
      if (!pendingBet) return;
      await updateSharesEvent({
        id: pendingBet?.id ?? "",
        sharesSubjectQuestion: pendingBet?.sharesSubjectQuestion ?? "",
        sharesSubjectAddress: pendingBet?.sharesSubjectAddress ?? "",
        eventState,
      });
    },
    [pendingBet]
  );

  const pendingBetId = useMemo(() => pendingBet?.id, [pendingBet]);

  const { openEvent, openEventTxLoading } = useOpenEvent(
    {
      eventAddress: userAddress ?? NULL_ADDRESS,
      eventId: Number(pendingBetId),
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
        canAddToChatbot.current = true;
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
        handleLoading(undefined);
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
          eventId: Number(pendingBetId),
          eventType: EventType.YayNayVote,
        });
        await _updateSharesEvent(SharesEventState.Live);
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.EVENT_LIVE,
          title: "Event is live!",
          description: `${pendingBetId}:${pendingBet?.sharesSubjectQuestion}:${pendingBet?.sharesSubjectAddress}:${pendingBet?.options?.[0]}:${pendingBet?.options?.[1]}:${pendingBet?.chainId}:${pendingBet.channelId}`,
        });
        canAddToChatbot.current = false;
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
        canAddToChatbot.current = false;
        handleLoading(undefined);
      },
    }
  );

  return (
    <>
      {loading ||
      openEventTxLoading ||
      channelQueryLoading ||
      updateSharesEventLoading ? (
        <Flex direction={"column"}>
          <Flex justifyContent="center">
            <Spinner />
          </Flex>
          <Text textAlign={"center"}>{loading ?? "loading"}</Text>
        </Flex>
      ) : (
        <>
          <Flex direction="column" p="5px" bg="rgba(0, 0, 0, 0.5)">
            <Text textAlign={"center"} fontWeight={"bold"}>
              {pendingBet.sharesSubjectQuestion}
            </Text>
            <Flex justifyContent={"space-evenly"}>
              <Text
                fontSize="15px"
                fontWeight="bold"
                color="rgba(10, 179, 18, 1)"
              >
                {pendingBet?.options?.[0]}
              </Text>
              <Text
                fontSize="15px"
                fontWeight="bold"
                color="rgba(218, 58, 19, 1)"
              >
                {pendingBet?.options?.[1]}
              </Text>
            </Flex>
          </Flex>
          <Text>set event duration</Text>
          <Menu>
            <MenuButton
              color="white"
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
                {`10 mins (until ${getConvertedDateFromMillis(
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
                {`30 mins (until ${getConvertedDateFromMillis(
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
                {`1 hour (until ${getConvertedDateFromMillis(
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
                {`2 hours (until ${getConvertedDateFromMillis(
                  dateNow + 120 * 60 * 1000
                )})`}
              </MenuItem>
            </MenuList>
          </Menu>
          <Button
            color="white"
            bg="#E09025"
            _hover={{}}
            _focus={{}}
            _active={{}}
            width="100%"
            isDisabled={
              !isVerifier ||
              (!matchingChain && !localNetwork.config.isTestnet) ||
              !sufficientEthForGas ||
              currentBetIsActiveAndHasFunds ||
              !openEvent
            }
            onClick={async () => {
              handleLoading("opening bet (2/2)");
              await openEvent?.();
            }}
          >
            {!openEvent ? <Spinner /> : "confirm"}
          </Button>
          <Button
            bg="transparent"
            border="1px solid #ff5653"
            color="#ff5653"
            _focus={{}}
            _active={{}}
            _hover={{
              bg: "#ff5653",
              color: "white",
            }}
            onClick={async () => {
              await closeSharesEvents({
                chainId: localNetwork.config.chainId,
                channelId: channelQueryData?.id as string,
                sharesEventIds: [Number(pendingBet?.id ?? "0")],
              }).then(async () => {
                await refetchChannel();
              });
            }}
          >
            {closeLoading ? <Spinner /> : "cancel event"}
          </Button>
        </>
      )}
    </>
  );
};
