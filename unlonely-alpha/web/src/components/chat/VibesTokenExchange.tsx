import {
  Flex,
  Input,
  Button,
  Box,
  useToast,
  Image,
  Text,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import { useState, useMemo, useRef, useEffect } from "react";
import { decodeEventLog, isAddress } from "viem";
import Link from "next/link";
import { useBalance } from "wagmi";

import { InteractionType, NULL_ADDRESS } from "../../constants";
import {
  useGetMintCostAfterFees,
  useMint,
  useBurn,
  useReadPublic,
} from "../../hooks/contracts/useVibesToken";
import useDebounce from "../../hooks/internal/useDebounce";
import centerEllipses from "../../utils/centerEllipses";
import { filteredInput } from "../../utils/validation/input";
import { useCacheContext } from "../../hooks/context/useCache";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useNetworkContext } from "../../hooks/context/useNetwork";
import { useUser } from "../../hooks/context/useUser";
import { getContractFromNetwork } from "../../utils/contract";
import { useWindowSize } from "../../hooks/internal/useWindowSize";

const VibesTokenExchange = ({
  isFullChart,
  allStreams,
}: {
  isFullChart?: boolean;
  allStreams?: boolean;
}) => {
  const { walletIsConnected, userAddress, user } = useUser();
  const { vibesTokenTxs } = useCacheContext();
  const toast = useToast();
  const { network } = useNetworkContext();
  const { matchingChain, localNetwork, explorerUrl } = network;
  const contract = getContractFromNetwork("vibesTokenV1", localNetwork);
  const { chat, channel } = useChannelContext();
  const { channelQueryData } = channel;
  const { addToChatbot } = chat;

  const [amountOfVibes, setAmountOfVibes] = useState<string>("10000");
  const debouncedAmountOfVotes = useDebounce(amountOfVibes, 300);
  const amount_votes_bigint = useMemo(
    () => BigInt(debouncedAmountOfVotes as `${number}`),
    [debouncedAmountOfVotes]
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const canAddToChatbot_mint = useRef(false);
  const canAddToChatbot_burn = useRef(false);
  const isFetching = useRef(false);
  const {
    mintCostAfterFees,
    refetch: refetchMintCostAfterFees,
    loading: mintCostAfterFeesLoading,
  } = useGetMintCostAfterFees(amount_votes_bigint, contract);

  const { data: vibesBalance, refetch: refetchVibesBalance } = useBalance({
    address: userAddress,
    token: contract.address,
    enabled:
      isAddress(userAddress as `0x${string}`) &&
      isAddress(contract.address ?? NULL_ADDRESS),
  });

  const { protocolFeeDestination, refetch: refetchDest } =
    useReadPublic(contract);

  const windowSize = useWindowSize();

  // const { burnProceedsAfterFees, refetch: refetchBurnProceedsAfterFees } =
  //   useGetBurnProceedsAfterFees(amount_votes_bigint, contract);

  const {
    mint,
    refetch: refetchMint,
    isRefetchingMint,
  } = useMint(
    {
      streamer:
        (channelQueryData?.owner?.address as `0x${string}`) ??
        protocolFeeDestination,
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
        canAddToChatbot_mint.current = true;
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
        canAddToChatbot_mint.current = false;
      },
      onTxSuccess: async (data) => {
        if (!canAddToChatbot_mint.current) return;
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
        if (channelQueryData) {
          const topics = decodeEventLog({
            abi: contract.abi,
            data: data.logs[1].data,
            topics: data.logs[1].topics,
          });
          const args: any = topics.args;
          const title = `${
            user?.username ?? centerEllipses(args.account, 15)
          } bought ${args.amount} $VIBES!`;
          addToChatbot({
            username: user?.username ?? "",
            address: userAddress ?? "",
            taskType: InteractionType.BUY_VIBES,
            title,
            description: `${
              user?.username ?? centerEllipses(userAddress, 15)
            }:${args.amount}`,
          });
        }
        canAddToChatbot_mint.current = false;
        setAmountOfVibes("10000");
      },
      onTxError: (error) => {
        console.log("mint error", error);
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4}>
              <Flex direction="column">
                <Text>mint error</Text>
                <Text fontSize="15px">{error?.message ?? "unknown error"}</Text>
              </Flex>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        canAddToChatbot_mint.current = false;
      },
    }
  );

  const {
    burn,
    refetch: refetchBurn,
    isRefetchingBurn,
  } = useBurn(
    {
      streamer:
        (channelQueryData?.owner?.address as `0x${string}`) ??
        protocolFeeDestination,
      amount: amount_votes_bigint,
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
        canAddToChatbot_burn.current = true;
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
        canAddToChatbot_burn.current = false;
      },
      onTxSuccess: async (data) => {
        if (!canAddToChatbot_burn.current) return;
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
        const topics = decodeEventLog({
          abi: contract.abi,
          data: data.logs[1].data,
          topics: data.logs[1].topics,
        });
        const args: any = topics.args;
        const title = `${
          user?.username ?? centerEllipses(args.account, 15)
        } sold ${args.amount} $VIBES!`;
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.SELL_VIBES,
          title,
          description: `${user?.username ?? centerEllipses(userAddress, 15)}:${
            args.amount
          }`,
        });
        canAddToChatbot_burn.current = false;
        setAmountOfVibes("10000");
      },
      onTxError: (error) => {
        console.log("burn error", error);
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4}>
              <Flex direction="column">
                <Text>burn error</Text>
                <Text fontSize="15px">{error?.message ?? "unknown error"}</Text>
              </Flex>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        canAddToChatbot_burn.current = false;
      },
    }
  );

  const handleInputChange = (event: any) => {
    const input = event.target.value;
    const filtered = filteredInput(input);
    setAmountOfVibes(filtered);
  };

  useEffect(() => {
    console.log("vibesTokenInterface, tx length change detected");
    if (
      vibesTokenTxs.length === 0 ||
      isFetching.current ||
      !contract.address ||
      !userAddress ||
      !walletIsConnected
    )
      return;
    const fetch = async () => {
      isFetching.current = true;
      const startTime = Date.now();
      console.log("vibesTokenInterface, fetching", startTime);
      let endTime = 0;
      try {
        await Promise.all([
          refetchMint(),
          refetchBurn(),
          refetchMintCostAfterFees(),
          // refetchBurnProceedsAfterFees(),
          refetchVibesBalance(),
          refetchDest(),
        ]).then(() => {
          endTime = Date.now();
        });
      } catch (err) {
        endTime = Date.now();
        console.log("vibes fetching error", err);
      }
      console.log("vibesTokenInterface, fetched", endTime);
      // const MILLIS = 3000;
      const MILLIS = 0;
      const timeToWait =
        endTime >= startTime + MILLIS ? 0 : MILLIS - (endTime - startTime);
      await new Promise((resolve) => {
        setTimeout(resolve, timeToWait);
      });
      isFetching.current = false;
    };
    fetch();
  }, [vibesTokenTxs.length]);

  useEffect(() => {
    if (!walletIsConnected) {
      setErrorMessage("connect wallet first");
    } else if (!matchingChain) {
      setErrorMessage("wrong network");
    } else {
      setErrorMessage("");
    }
  }, [walletIsConnected, matchingChain, amountOfVibes]);

  const openVibesPopout = () => {
    if (!channelQueryData) return;
    const windowFeatures = `width=${windowSize[0] + 100},height=${
      windowSize[1] + 100
    },menubar=yes,toolbar=yes`;
    window.open(
      `${window.location.origin}/vibes/${channelQueryData?.slug}`,
      "_blank",
      windowFeatures
    );
  };

  return (
    <Flex direction="column" justifyContent={"flex-end"} gap="10px">
      {!isFullChart && !allStreams && (
        <Popover trigger="hover" placement="top" openDelay={500}>
          <PopoverTrigger>
            <IconButton
              onClick={openVibesPopout}
              aria-label="vibes-popout"
              _focus={{}}
              _hover={{ transform: "scale(1.15)" }}
              _active={{ transform: "scale(1.3)" }}
              icon={<Image src="/svg/pop-out.svg" height={"20px"} />}
              bg="transparent"
              minWidth="auto"
            />
          </PopoverTrigger>
          <PopoverContent bg="#5d12c6" border="none" width="100%" p="2px">
            <PopoverArrow bg="#5d12c6" />
            <Text fontSize="12px" textAlign={"center"}>
              pop out full chart in a new window!
            </Text>
          </PopoverContent>
        </Popover>
      )}
      <Flex position="relative" gap="5px" alignItems={"center"}>
        <Input
          variant="glow"
          textAlign="center"
          value={amountOfVibes}
          onChange={handleInputChange}
          mx="auto"
          p="1"
          fontSize={"14px"}
        />
        <Button
          bg={"#403c7d"}
          color="white"
          p={2}
          height={"20px"}
          _focus={{}}
          _active={{}}
          _hover={{
            bg: "#8884d8",
          }}
          onClick={() => {
            vibesBalance && setAmountOfVibes(vibesBalance.formatted);
          }}
        >
          max
        </Button>
      </Flex>
      <Button
        color="white"
        _focus={{}}
        _hover={{}}
        _active={{}}
        bg="#46a800"
        isDisabled={!mint || mintCostAfterFeesLoading}
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
  );
};

export default VibesTokenExchange;
