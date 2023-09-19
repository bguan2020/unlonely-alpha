import {
  Box,
  Flex,
  IconButton,
  Button,
  Input,
  Text,
  Image,
  useToast,
  Tooltip,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { GoPin } from "react-icons/go";
import Link from "next/link";
import { decodeEventLog, formatUnits } from "viem";
import { useNetwork } from "wagmi";

import { useChannelContext } from "../../hooks/context/useChannel";
import { useUser } from "../../hooks/context/useUser";
import {
  useBuyShares,
  useClaimPayout,
  useGetHolderSharesBalances,
  useGetPrice,
  useGetPriceAfterFee,
  useReadPublic,
  useReadSharesSubject,
  useSellShares,
  useVerifyEvent,
} from "../../hooks/contracts/useSharesContract";
import { filteredInput } from "../../utils/validation/input";
import { getContractFromNetwork } from "../../utils/contract";
import { NETWORKS } from "../../constants/networks";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { InteractionType, NULL_ADDRESS } from "../../constants";
import centerEllipses from "../../utils/centerEllipses";
import { Message } from "../../constants/types/chat";

const sharesSubject: `0x${string}` =
  "0x84Fc70E796E0339001a027202e1dDe7d01BA347b";

export const SharesInterface = ({ messages }: { messages: Message[] }) => {
  const { userAddress, user } = useUser();
  const { channel, arcade } = useChannelContext();
  const { addToChatbot } = arcade;
  const { channelQueryData } = channel;
  const toast = useToast();

  const isOwner = userAddress === channelQueryData?.owner.address;

  const [selectedSharesOption, setSelectedSharesOption] = useState<
    string | undefined
  >(undefined);
  const [isBuying, setIsBuying] = useState<boolean>(true);
  const [amount, setAmount] = useState("");
  const [isEndingEvent, setIsEndingEvent] = useState<boolean>(false);
  const [endDecision, setEndDecision] = useState<boolean | undefined>(
    undefined
  );

  const isYay = selectedSharesOption === "yes";

  const amount_bigint = useMemo(
    () => BigInt(filteredInput(amount) as `${number}`),
    [amount]
  );

  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === network.chain?.id);
  }, [network]);
  const contract = getContractFromNetwork("unlonelySharesV1", localNetwork);

  const {
    protocolFeeDestination,
    protocolFeePercent,
    subjectFeePercent,
    isPaused,
    refetch: refetchPublic,
  } = useReadPublic(contract);

  const { price: yayBuyPriceForOne, refetch: refetchYayBuyPriceForOne } =
    useGetPrice(sharesSubject, BigInt(1), true, true, contract);

  const { price: nayBuyPriceForOne, refetch: refetchNayBuyPriceForOne } =
    useGetPrice(sharesSubject, BigInt(1), false, true, contract);

  const { price: yayBuyPrice, refetch: refetchYayBuyPrice } = useGetPrice(
    sharesSubject,
    amount_bigint,
    true,
    true,
    contract
  );

  const { price: yaySellPrice, refetch: refetchYaySellPrice } = useGetPrice(
    sharesSubject,
    amount_bigint,
    true,
    false,
    contract
  );

  const { price: nayBuyPrice, refetch: refetchNayBuyPrice } = useGetPrice(
    sharesSubject,
    amount_bigint,
    false,
    true,
    contract
  );

  const { price: naySellPrice, refetch: refetchNaySellPrice } = useGetPrice(
    sharesSubject,
    amount_bigint,
    false,
    false,
    contract
  );

  const {
    priceAfterFee: yayBuyPriceAfterFee,
    refetch: refetchYayBuyPriceAfterFee,
  } = useGetPriceAfterFee(sharesSubject, amount_bigint, true, true, contract);

  const {
    priceAfterFee: yaySellPriceAfterFee,
    refetch: refetchYaySellPriceAfterFee,
  } = useGetPriceAfterFee(sharesSubject, amount_bigint, true, false, contract);

  const {
    priceAfterFee: nayBuyPriceAfterFee,
    refetch: refetchNayBuyPriceAfterFee,
  } = useGetPriceAfterFee(sharesSubject, amount_bigint, false, true, contract);

  const {
    priceAfterFee: naySellPriceAfterFee,
    refetch: refetchNaySellPriceAfterFee,
  } = useGetPriceAfterFee(sharesSubject, amount_bigint, false, false, contract);

  const {
    yaySharesBalance,
    naySharesBalance,
    refetch: refetchBalances,
  } = useGetHolderSharesBalances(
    sharesSubject,
    userAddress as `0x${string}`,
    contract
  );

  const {
    yaySharesSupply,
    naySharesSupply,
    eventVerified,
    eventResult,
    isVerifier,
    pooledEth,
    userPayout,
    refetch: refetchSharesSubject,
  } = useReadSharesSubject(sharesSubject, contract);

  const { claimPayout, claimPayoutTxLoading } = useClaimPayout(
    {
      sharesSubject: sharesSubject,
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
                claimPayout pending, click to view
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
              claimPayout cancelled
            </Box>
          ),
        });
      },
      onTxSuccess: (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`https://etherscan.io/tx/${data.transactionHash}`}
                passHref
              >
                claimPayout success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              claimPayout error
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
    }
  );

  const { buyShares, buySharesTxLoading } = useBuyShares(
    {
      sharesSubject: sharesSubject,
      amountOfShares: amount_bigint,
      value: isYay ? yayBuyPriceAfterFee : nayBuyPriceAfterFee,
      isYay: isYay,
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
                buyShares pending, click to view
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
              buyShares cancelled
            </Box>
          ),
        });
      },
      onTxSuccess: (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`https://etherscan.io/tx/${data.transactionHash}`}
                passHref
              >
                buyShares success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        setAmount("");
        const topics = decodeEventLog({
          abi: contract.abi,
          data: data.logs[0].data,
          topics: data.logs[0].topics,
        });
        const args: any = topics.args;
        const title = `${user?.username ?? centerEllipses(userAddress, 15)} ${
          args.isBuy ? "bought" : "sold"
        } ${args.shareAmount} ${args.isYay ? "yay" : "nay"} shares!`;
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.BUY_SHARES,
          title,
          description: args.isYay,
        });
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              buyShares error
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
    }
  );

  const { sellShares, sellSharesTxLoading } = useSellShares(
    {
      sharesSubject: sharesSubject,
      amount: amount_bigint,
      isYay: isYay,
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
                sellShares pending, click to view
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
              sellShares cancelled
            </Box>
          ),
        });
      },
      onTxSuccess: (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`https://etherscan.io/tx/${data.transactionHash}`}
                passHref
              >
                sellShares success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        setAmount("");
        const topics = decodeEventLog({
          abi: contract.abi,
          data: data.logs[0].data,
          topics: data.logs[0].topics,
        });
        const args: any = topics.args;
        const title = `${user?.username ?? centerEllipses(userAddress, 15)} ${
          args.isBuy ? "bought" : "sold"
        } ${args.shareAmount} ${args.isYay ? "yay" : "nay"} shares!`;
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.SELL_SHARES,
          title,
          description: args.isYay,
        });
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              sellShares error
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
    }
  );

  const { verifyEvent, verifyEventTxLoading } = useVerifyEvent(
    {
      sharesSubject: sharesSubject,
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
      onTxSuccess: (data) => {
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
        setIsEndingEvent(false);
        const topics = decodeEventLog({
          abi: contract.abi,
          data: data.logs[0].data,
          topics: data.logs[0].topics,
        });
        const args: any = topics.args;
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.EVENT_END,
          title: `Event has ended, ${args.result ? "yay" : "nay"} shares win!`,
          description: "event-end",
        });
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
    const fetch = async () => {
      if (messages.length > 0) {
        const latestMessage = messages[messages.length - 1];
        if (
          latestMessage.data.body &&
          (latestMessage.data.body.split(":")[0] ===
            InteractionType.BUY_SHARES ||
            latestMessage.data.body.split(":")[0] ===
              InteractionType.SELL_SHARES ||
            latestMessage.data.body.split(":")[0] ===
              InteractionType.EVENT_END) &&
          Date.now() - latestMessage.timestamp < 6000
        ) {
          await refetchPublic();
          await refetchYayBuyPriceForOne();
          await refetchNayBuyPriceForOne();
          await refetchYayBuyPrice();
          await refetchYaySellPrice();
          await refetchNayBuyPrice();
          await refetchNaySellPrice();
          await refetchYayBuyPriceAfterFee();
          await refetchYaySellPriceAfterFee();
          await refetchNayBuyPriceAfterFee();
          await refetchNaySellPriceAfterFee();
          await refetchBalances();
          await refetchSharesSubject();
        }
      }
    };
    fetch();
  }, [messages]);

  const handleInputChange = (event: any) => {
    const input = event.target.value;
    const filtered = filteredInput(input);
    setAmount(filtered);
  };

  return (
    <Box
      mt="10px"
      transition="all 0.5s ease"
      bg={"#1b183f"}
      borderRadius={"10px"}
      border="1px solid #ffffff"
      boxShadow={"0px 0px 10px #ffffff"}
      position="relative"
    >
      <Flex direction="column">
        <Flex position="absolute" left="5px" top="5px">
          <GoPin />
        </Flex>
        <Flex justifyContent="center">
          <Text
            textAlign={"center"}
            width="90%"
            fontSize={"20px"}
            fontWeight={"bold"}
          >
            will there be a second date?
          </Text>
        </Flex>

        {(isEndingEvent || selectedSharesOption !== undefined) && (
          <IconButton
            aria-label="close"
            _hover={{}}
            _active={{}}
            _focus={{}}
            bg="transparent"
            icon={<Image alt="close" src="/svg/close.svg" width="15px" />}
            onClick={() => {
              setSelectedSharesOption(undefined);
              setIsEndingEvent(false);
              setEndDecision(undefined);
            }}
            position="absolute"
            right="-5px"
            top="-5px"
          />
        )}
        {isEndingEvent ? (
          <>
            <Text textAlign="center" fontSize="14px" color="#01bdec">
              decide event outcome to end it
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
                    transform={
                      endDecision === false ? undefined : "scale(0.95)"
                    }
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
          </>
        ) : protocolFeeDestination === NULL_ADDRESS ? (
          <Tooltip>
            <Text textAlign={"center"} color="#d5d5d5" fontSize="15px">
              contract not ready
            </Text>
          </Tooltip>
        ) : eventVerified ? (
          <Flex direction="column" p="0.5rem">
            {!claimPayoutTxLoading ? (
              <>
                <Flex justifyContent="space-between">
                  <Text fontSize="18px">event outcome</Text>
                  <Text
                    fontSize="18px"
                    fontWeight="bold"
                    color={eventResult === true ? "#02f042" : "#ee6204"}
                  >
                    {eventResult ? "Yes" : "No"}
                  </Text>
                </Flex>
                <Flex justifyContent="space-between">
                  <Text fontSize="18px">your winnings</Text>
                  <Text fontSize="18px">
                    {truncateValue(formatUnits(userPayout, 18))}
                  </Text>
                </Flex>
                <Button
                  _hover={{}}
                  _focus={{}}
                  _active={{}}
                  bg={"#E09025"}
                  borderRadius="25px"
                  isDisabled={!claimPayout || userPayout === BigInt(0)}
                  onClick={claimPayout}
                >
                  <Text fontSize="20px">get payout</Text>
                </Button>
              </>
            ) : (
              <Flex justifyContent="center">
                <Spinner />
              </Flex>
            )}
          </Flex>
        ) : (
          <>
            <Text textAlign={"center"} fontSize="14px" color="#f8f53b">
              {truncateValue(formatUnits(pooledEth, 18), 4)} ETH in the pool
            </Text>
            <Flex justifyContent={"center"} gap={"10px"} my="10px">
              <Text color="#35b657" fontWeight="bold" fontSize="25px">
                {truncateValue(String(yaySharesSupply), 0, true)}
              </Text>
              <Button
                _hover={{}}
                _focus={{}}
                _active={{}}
                transform={
                  selectedSharesOption === "no" ? "scale(0.95)" : undefined
                }
                opacity={selectedSharesOption === "no" ? 0.9 : 1}
                bg={selectedSharesOption === "no" ? "#909090" : "#009d2a"}
                onClick={() => setSelectedSharesOption("yes")}
              >
                <Flex direction="column">
                  <Text
                    fontFamily="Neue Pixel Sans"
                    fontWeight={"light"}
                    fontSize="15px"
                  >
                    YES
                  </Text>
                  <Text fontWeight={"light"} fontSize="12px">
                    {truncateValue(
                      formatUnits(yayBuyPriceForOne ?? BigInt(0), 18)
                    )}
                  </Text>
                </Flex>
              </Button>
              <Button
                _hover={{}}
                _focus={{}}
                _active={{}}
                transform={isYay ? "scale(0.95)" : undefined}
                opacity={isYay ? 0.9 : 1}
                bg={isYay ? "#909090" : "#da3b14"}
                onClick={() => setSelectedSharesOption("no")}
              >
                <Flex direction="column">
                  <Text
                    fontFamily="Neue Pixel Sans"
                    fontWeight={"light"}
                    fontSize="15px"
                  >
                    NO
                  </Text>
                  <Text fontWeight={"light"} fontSize="12px">
                    {truncateValue(
                      formatUnits(nayBuyPriceForOne ?? BigInt(0), 18)
                    )}
                  </Text>
                </Flex>
              </Button>
              <Text color="#ff623b" fontWeight="bold" fontSize="25px">
                {truncateValue(String(naySharesSupply), 0, true)}
              </Text>
            </Flex>
            {isOwner && (
              <Flex justifyContent={"center"}>
                <Text
                  textAlign="center"
                  fontSize="12px"
                  textDecoration={"underline"}
                  color="#ec6d04"
                  cursor={"pointer"}
                  onClick={() => setIsEndingEvent(true)}
                >
                  end event
                </Text>
              </Flex>
            )}
          </>
        )}
        {isEndingEvent || selectedSharesOption === undefined ? null : (
          <Flex direction="column" bg={"rgba(0, 0, 0, 0.258)"} p="0.5rem">
            {!buySharesTxLoading && !sellSharesTxLoading ? (
              <>
                <Flex justifyContent={"space-between"}>
                  <Text fontWeight="light" opacity="0.75">
                    enter amount of shares
                  </Text>
                  <Text fontWeight="light">
                    {isYay ? yaySharesBalance : naySharesBalance}
                  </Text>
                </Flex>
                <Flex>
                  <Button
                    width="60%"
                    borderTopRightRadius={"0"}
                    borderBottomRightRadius={"0"}
                    bg={isBuying ? "#009d2a" : "#da3b14"}
                    onClick={() => {
                      isBuying ? setIsBuying(false) : setIsBuying(true);
                    }}
                    _hover={{ bg: isBuying ? "#00ba32" : "#ff4e22" }}
                    _focus={{}}
                    _active={{}}
                  >
                    <Text>{isBuying ? "buy" : "sell"}</Text>
                  </Button>
                  <Input
                    borderTopLeftRadius={"0"}
                    borderBottomLeftRadius={"0"}
                    borderTopRightRadius={isBuying ? "10px" : "0"}
                    borderBottomRightRadius={isBuying ? "10px" : "0"}
                    variant="glow"
                    boxShadow={"unset"}
                    placeholder={"0"}
                    value={amount}
                    onChange={handleInputChange}
                  />
                  {!isBuying && (
                    <Button
                      _hover={{ bg: "rgba(54, 170, 212, 0.2)" }}
                      _focus={{}}
                      _active={{}}
                      borderTopLeftRadius={"0"}
                      borderBottomLeftRadius={"0"}
                      bg="transparent"
                      border="1px solid #3097bd"
                      boxShadow={"inset 0px 0px 5px #2f92b6"}
                      onClick={() => {
                        if (isBuying) return;
                        if (isYay) {
                          setAmount(String(yaySharesBalance));
                        } else {
                          setAmount(String(naySharesBalance));
                        }
                      }}
                    >
                      <Text fontWeight="light">MAX</Text>
                    </Button>
                  )}
                </Flex>
                <Flex justifyContent={"space-between"}>
                  <Text opacity="0.75" fontWeight="light">
                    {isBuying ? "price" : "return"}
                  </Text>
                  {isBuying && isYay && (
                    <Text fontWeight="light">
                      {formatUnits(yayBuyPrice, 18)} ETH
                    </Text>
                  )}
                  {isBuying && !isYay && (
                    <Text fontWeight="light">
                      {formatUnits(nayBuyPrice, 18)} ETH
                    </Text>
                  )}
                  {!isBuying && isYay && (
                    <Text fontWeight="light">
                      {formatUnits(yaySellPrice, 18)} ETH
                    </Text>
                  )}
                  {!isBuying && !isYay && (
                    <Text fontWeight="light">
                      {formatUnits(naySellPrice, 18)} ETH
                    </Text>
                  )}
                </Flex>
                <Flex justifyContent={"space-between"}>
                  <Text opacity="0.75" fontWeight="light">
                    streamer fee
                  </Text>
                  <Text fontWeight="light">
                    {formatUnits(subjectFeePercent, 16)}%
                  </Text>
                </Flex>
                <Flex justifyContent={"space-between"}>
                  <Text opacity="0.75" fontWeight="light">
                    unlonely fee
                  </Text>
                  <Text fontWeight="light">
                    {formatUnits(protocolFeePercent, 16)}%
                  </Text>
                </Flex>
                <Flex justifyContent={"space-between"}>
                  <Text opacity="0.75" fontWeight="light">
                    {isBuying ? "price after fees" : "return after fees"}
                  </Text>
                  {isBuying && isYay && (
                    <Text fontWeight="light">
                      {formatUnits(yayBuyPriceAfterFee, 18)} ETH
                    </Text>
                  )}
                  {isBuying && !isYay && (
                    <Text fontWeight="light">
                      {formatUnits(nayBuyPriceAfterFee, 18)} ETH
                    </Text>
                  )}
                  {!isBuying && isYay && (
                    <Text fontWeight="light">
                      {formatUnits(yaySellPriceAfterFee, 18)} ETH
                    </Text>
                  )}
                  {!isBuying && !isYay && (
                    <Text fontWeight="light">
                      {formatUnits(naySellPriceAfterFee, 18)} ETH
                    </Text>
                  )}
                </Flex>
                <Button
                  _hover={{}}
                  _focus={{}}
                  _active={{}}
                  bg={"#E09025"}
                  borderRadius="25px"
                  onClick={isBuying ? buyShares : sellShares}
                  isDisabled={
                    (isBuying && !buyShares) || (!isBuying && !sellShares)
                  }
                >
                  <Text fontSize="20px">
                    confirm {isBuying ? "buy" : "sell"}
                  </Text>
                </Button>
              </>
            ) : (
              <Flex justifyContent="center">
                <Spinner />
              </Flex>
            )}
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
