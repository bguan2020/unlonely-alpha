import {
  Box,
  Flex,
  IconButton,
  Button,
  Select,
  Input,
  Text,
  Image,
  useToast,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { GoPin } from "react-icons/go";
import Link from "next/link";
import { formatUnits } from "viem";
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
} from "../../hooks/contracts/useSharesContract";
import {
  filteredInput,
} from "../../utils/validation/input";
import { getContractFromNetwork } from "../../utils/contract";
import { NETWORKS } from "../../constants/networks";

export const SharesInterface = () => {
  const { userAddress } = useUser();
  const { channel } = useChannelContext();
  const { channelQueryData } = channel;
  const toast = useToast();

  const [selectedSharesOption, setSelectedSharesOption] = useState<
    string | undefined
  >(undefined);
  const [isBuying, setIsBuying] = useState<boolean>(true);
  const [amount, setAmount] = useState("");

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
    protocolFeePercent,
    subjectFeePercent,
    refetch: refetchPublic,
  } = useReadPublic(contract);

  const { price: yayBuyPrice, refetch: refetchYayBuyPrice } = useGetPrice(
    channelQueryData?.owner?.address as `0x${string}`,
    BigInt(1),
    true,
    true,
    contract
  );

  const { price: yaySellPrice, refetch: refetchYaySellPrice } = useGetPrice(
    channelQueryData?.owner?.address as `0x${string}`,
    BigInt(1),
    true,
    false,
    contract
  );

  const { price: nayBuyPrice, refetch: refetchNayBuyPrice } = useGetPrice(
    channelQueryData?.owner?.address as `0x${string}`,
    BigInt(1),
    false,
    true,
    contract
  );

  const { price: naySellPrice, refetch: refetchNaySellPrice } = useGetPrice(
    channelQueryData?.owner?.address as `0x${string}`,
    BigInt(1),
    false,
    false,
    contract
  );

  const {
    priceAfterFee: yayBuyPriceAfterFee,
    refetch: refetchYayBuyPriceAfterFee,
  } = useGetPriceAfterFee(
    channelQueryData?.owner?.address as `0x${string}`,
    amount_bigint,
    true,
    true,
    contract
  );

  const {
    priceAfterFee: yaySellPriceAfterFee,
    refetch: refetchYaySellPriceAfterFee,
  } = useGetPriceAfterFee(
    channelQueryData?.owner?.address as `0x${string}`,
    amount_bigint,
    true,
    false,
    contract
  );

  const {
    priceAfterFee: nayBuyPriceAfterFee,
    refetch: refetchNayBuyPriceAfterFee,
  } = useGetPriceAfterFee(
    channelQueryData?.owner?.address as `0x${string}`,
    amount_bigint,
    false,
    true,
    contract
  );

  const {
    priceAfterFee: naySellPriceAfterFee,
    refetch: refetchNaySellPriceAfterFee,
  } = useGetPriceAfterFee(
    channelQueryData?.owner?.address as `0x${string}`,
    amount_bigint,
    false,
    false,
    contract
  );

  const {
    yaySharesBalance,
    naySharesBalance,
    refetch: refetchBalances,
  } = useGetHolderSharesBalances(
    channelQueryData?.owner?.address as `0x${string}`,
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
  } = useReadSharesSubject(
    channelQueryData?.owner?.address as `0x${string}`,
    contract
  );

  const {
    claimPayout,
    claimPayoutData,
    claimPayoutTxData,
    claimPayoutTxLoading,
  } = useClaimPayout(
    {
      sharesSubject: channelQueryData?.owner?.address as `0x${string}`,
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
        refetchBalances();
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

  const { buyShares, buySharesData, buySharesTxData, buySharesTxLoading } =
    useBuyShares(
      {
        sharesSubject: channelQueryData?.owner?.address as `0x${string}`,
        amount: amount_bigint,
        isYay: selectedSharesOption === "yes",
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
          refetchBalances();
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

  const { sellShares, sellSharesData, sellSharesTxData, sellSharesTxLoading } =
    useSellShares(
      {
        sharesSubject: channelQueryData?.owner?.address as `0x${string}`,
        amount: amount_bigint,
        isYay: selectedSharesOption === "yes",
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
          refetchBalances();
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
            there is gonna be a question over here
          </Text>
        </Flex>
        {selectedSharesOption !== undefined && (
          <IconButton
            aria-label="close"
            _hover={{}}
            _active={{}}
            _focus={{}}
            bg="transparent"
            icon={<Image alt="close" src="/svg/close.svg" width="15px" />}
            onClick={() => {
              setSelectedSharesOption(undefined);
            }}
            position="absolute"
            right="-5px"
            top="-5px"
          />
        )}
        <Flex justifyContent={"center"} gap={"10px"} my="10px">
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
                {formatUnits(yayBuyPrice ?? BigInt(0), 18)}
              </Text>
            </Flex>
          </Button>
          <Button
            _hover={{}}
            _focus={{}}
            _active={{}}
            transform={
              selectedSharesOption === "yes" ? "scale(0.95)" : undefined
            }
            opacity={selectedSharesOption === "yes" ? 0.9 : 1}
            bg={selectedSharesOption === "yes" ? "#909090" : "#da3b14"}
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
                {formatUnits(nayBuyPrice ?? BigInt(0), 18)}
              </Text>
            </Flex>
          </Button>
        </Flex>
        {selectedSharesOption === undefined ? null : (
          <Flex
            direction="column"
            gap="5px"
            bg={"rgba(0, 0, 0, 0.258)"}
            p="0.5rem"
          >
            <Flex justifyContent={"space-between"}>
              <Text fontWeight="light" opacity="0.75">
                enter amount of shares
              </Text>
              <Text fontWeight="light">
                {formatUnits(
                  selectedSharesOption === "yes"
                    ? yaySharesBalance
                    : naySharesBalance,
                  18
                )}
              </Text>
            </Flex>
            <Flex>
              <Select
                width="60%"
                borderTopRightRadius={"0"}
                borderBottomRightRadius={"0"}
                bg={isBuying ? "#009d2a" : "#da3b14"}
                value={isBuying ? "buy" : "sell"}
                onChange={(e) => {
                  const buyState = e.target.value === "buy";
                  setIsBuying(buyState);
                }}
              >
                <option value="buy" style={{ background: "#504b8d" }}>
                  <Text>buy</Text>
                </option>
                <option value="sell" style={{ background: "#504b8d" }}>
                  <Text>sell</Text>
                </option>
              </Select>
              <Input
                borderTopLeftRadius={"0"}
                borderBottomLeftRadius={"0"}
                borderTopRightRadius={"0"}
                borderBottomRightRadius={"0"}
                variant="glow"
                boxShadow={"unset"}
                placeholder={"0"}
                value={amount}
                onChange={handleInputChange}
              />
              <Button
                _hover={{ bg: "rgba(54, 170, 212, 0.2)" }}
                _focus={{}}
                _active={{}}
                borderTopLeftRadius={"0"}
                borderBottomLeftRadius={"0"}
                bg="transparent"
                border="1px solid #3097bd"
                boxShadow={"inset 0px 0px 5px #2f92b6"}
              >
                <Text fontWeight="light">MAX</Text>
              </Button>
            </Flex>
            <Flex justifyContent={"space-between"}>
              <Text opacity="0.75" fontWeight="light">
                yay shares supply
              </Text>
              <Text fontWeight="light">{formatUnits(yaySharesSupply, 18)}</Text>
            </Flex>
            <Flex justifyContent={"space-between"}>
              <Text opacity="0.75" fontWeight="light">
                nay shares supply
              </Text>
              <Text fontWeight="light">{formatUnits(naySharesSupply, 18)}</Text>
            </Flex>
            <Flex justifyContent={"space-between"}>
              <Text opacity="0.75" fontWeight="light">
                pooled eth
              </Text>
              <Text fontWeight="light">{formatUnits(pooledEth, 18)}</Text>
            </Flex>
            <Flex justifyContent={"space-between"}>
              <Text opacity="0.75" fontWeight="light">
                streamer fee
              </Text>
              <Text fontWeight="light">
                {formatUnits(subjectFeePercent, 18)}%
              </Text>
            </Flex>
            <Flex justifyContent={"space-between"}>
              <Text opacity="0.75" fontWeight="light">
                unlonely fee
              </Text>
              <Text fontWeight="light">
                {formatUnits(protocolFeePercent, 18)}%
              </Text>
            </Flex>
            <Flex justifyContent={"space-between"}>
              <Text opacity="0.75" fontWeight="light">
                {isBuying ? "price" : "return"}
              </Text>
              {isBuying && selectedSharesOption === "yes" && (
                <Text fontWeight="light">
                  {formatUnits(yayBuyPriceAfterFee, 18)} ETH
                </Text>
              )}
              {isBuying && selectedSharesOption !== "yes" && (
                <Text fontWeight="light">
                  {formatUnits(nayBuyPriceAfterFee, 18)} ETH
                </Text>
              )}
              {!isBuying && selectedSharesOption === "yes" && (
                <Text fontWeight="light">
                  {formatUnits(yaySellPriceAfterFee, 18)} ETH
                </Text>
              )}
              {!isBuying && selectedSharesOption !== "yes" && (
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
            >
              <Text fontSize="20px">confirm {isBuying ? "buy" : "sell"}</Text>
            </Button>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};
