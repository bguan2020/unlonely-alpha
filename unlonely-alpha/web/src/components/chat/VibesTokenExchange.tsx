import { LineChart, Line, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { isAddress } from "viem";
import Link from "next/link";
import { useBlockNumber } from "wagmi";

import { useCacheContext } from "../../hooks/context/useCache";
import centerEllipses from "../../utils/centerEllipses";
import { filteredInput } from "../../utils/validation/input";
import {
  useBurn,
  useGetBurnProceedsAfterFees,
  useGetMintCostAfterFees,
  useMint,
} from "../../hooks/contracts/useVibesToken";
import useDebounce from "../../hooks/internal/useDebounce";
import { getContractFromNetwork } from "../../utils/contract";
import { useNetworkContext } from "../../hooks/context/useNetwork";
import { useChannelContext } from "../../hooks/context/useChannel";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <Flex
        direction="column"
        bg="rgba(0, 0, 0, 0.5)"
        p="5px"
        borderRadius="15px"
      >
        <Text>{`${
          isAddress(payload[0].payload.user)
            ? centerEllipses(payload[0].payload.user, 13)
            : payload[0].payload.user
        }`}</Text>
        <Text
          color={payload[0].payload.event === "Mint" ? "#46a800" : "#fe2815"}
        >{`${payload[0].payload.event === "Mint" ? "Bought" : "Sold"} ${
          payload[0].payload.amount
        }`}</Text>
        <Text>{`New price: ${payload[0].payload.price}`}</Text>
      </Flex>
    );
  }

  return null;
};

const VibesTokenExchange = () => {
  const { vibesTokenTxs, vibesTokenLoading } = useCacheContext();
  const toast = useToast();
  const { network } = useNetworkContext();
  const { localNetwork, explorerUrl } = network;
  const contract = getContractFromNetwork("vibesTokenV1", localNetwork);
  const { channel } = useChannelContext();
  const { channelQueryData } = channel;

  const blockNumber = useBlockNumber({
    watch: true,
  });

  const formattedData = useMemo(() => {
    return vibesTokenTxs.map((tx) => {
      return {
        user: tx.user,
        event: tx.eventName,
        amount: Number(tx.amount),
        price: tx.price,
      };
    });
  }, [vibesTokenTxs]);

  const [amountOfVibes, setAmountOfVibes] = useState<string>("1");
  const debouncedAmountOfVotes = useDebounce(amountOfVibes, 300);
  const amount_votes_bigint = useMemo(
    () => BigInt(debouncedAmountOfVotes as `${number}`),
    [debouncedAmountOfVotes]
  );
  const isFetching = useRef(false);

  const { mintCostAfterFees, refetch: refetchMintCostAfterFees } =
    useGetMintCostAfterFees(amount_votes_bigint, contract);

  const { burnProceedsAfterFees, refetch: refetchBurnProceedsAfterFees } =
    useGetBurnProceedsAfterFees(amount_votes_bigint, contract);

  const {
    mint,
    refetch: refetchMint,
    isRefetchingMint,
  } = useMint(
    {
      streamer: channelQueryData?.owner.address as `0x${string}`,
      amount: amount_votes_bigint,
      value: mintCostAfterFees,
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
                mint pending, click to view
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
              mint cancelled
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
                mint success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        setAmountOfVibes("1");
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              mint error
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
    }
  );

  const {
    burn,
    refetch: refetchBurn,
    isRefetchingBurn,
  } = useBurn(
    {
      streamer: channelQueryData?.owner.address as `0x${string}`,
      amount: amount_votes_bigint,
      value: burnProceedsAfterFees,
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
                burn pending, click to view
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
              burn cancelled
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
                burn success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        setAmountOfVibes("1");
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              burn error
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
    setAmountOfVibes(filtered);
  };

  useEffect(() => {
    if (!blockNumber.data || isFetching.current) return;
    const fetch = async () => {
      isFetching.current = true;
      try {
        await Promise.all([
          refetchMint(),
          refetchBurn(),
          refetchMintCostAfterFees(),
          refetchBurnProceedsAfterFees(),
        ]);
      } catch (err) {
        console.log("vibes fetching error", err);
      }
      isFetching.current = false;
    };
    fetch();
  }, [blockNumber.data]);

  return (
    <>
      {vibesTokenLoading ? (
        <Flex
          direction="column"
          alignItems="center"
          width="100%"
          gap="5px"
          justifyContent={"center"}
        >
          <Text>loading $VIBES chart</Text>
          <Spinner size="md" />
        </Flex>
      ) : (
        <>
          <Text
            position="absolute"
            fontSize={"20px"}
            color="#c6c3fc"
            fontWeight="bold"
          >
            $VIBES
          </Text>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#8884d8"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
      <Flex direction="column" justifyContent={"space-evenly"}>
        <Input
          variant="glow"
          textAlign="center"
          width={"70px"}
          value={amountOfVibes}
          onChange={handleInputChange}
          mx="auto"
        />
        <Button
          color="white"
          _focus={{}}
          _hover={{}}
          _active={{}}
          bg="#46a800"
          isDisabled={!mint}
          onClick={mint}
        >
          BUY
        </Button>
        <Button
          color="white"
          _focus={{}}
          _hover={{}}
          _active={{}}
          bg="#fe2815"
          isDisabled={!burn}
          onClick={burn}
        >
          SELL
        </Button>
      </Flex>
    </>
  );
};

export default VibesTokenExchange;
