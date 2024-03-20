import { useCallback, useEffect, useState } from "react";
import { useToast, Box } from "@chakra-ui/react";
import Link from "next/link";
import { Log, decodeEventLog, encodeAbiParameters } from "viem";
import { Contract, NULL_ADDRESS } from "../../constants";
import { getContractFromNetwork } from "../../utils/contract";
import { useNetworkContext } from "../context/useNetwork";
import { useCreateTempToken } from "../contracts/useTempTokenFactoryV1";
import { verifyTempTokenV1OnBase } from "../../utils/contract-verification/TempTokenV1";
import usePostTempToken from "../server/usePostTempToken";
import { useLazyQuery } from "@apollo/client";
import { GET_TEMP_TOKENS_QUERY } from "../../constants/queries";
import { GetTempTokensQuery } from "../../generated/graphql";
import { useContractEvent } from "wagmi";

export type UseTempTokenStateType = {
  newTokenName: string;
  newTokenSymbol: string;
  newTokenDuration: bigint;
  createTempToken: () => Promise<void>;
  createTempTokenData: any;
  createTempTokenTxData: any;
  isCreateTempTokenLoading: boolean;
  handleNewTokenName: (name: string) => void;
  handleNewTokenSymbol: (symbol: string) => void;
  handleNewTokenDuration: (duration: bigint) => void;
  currentActiveTokenAddress: string;
  currentActiveTokenEndTimestamp: bigint;
};

export const useTempTokenInitialState: UseTempTokenStateType = {
  newTokenName: "temp",
  newTokenSymbol: "temp",
  newTokenDuration: BigInt(3600),
  createTempToken: async () => undefined,
  createTempTokenData: undefined,
  createTempTokenTxData: undefined,
  isCreateTempTokenLoading: false,
  handleNewTokenName: () => undefined,
  handleNewTokenSymbol: () => undefined,
  handleNewTokenDuration: () => undefined,
  currentActiveTokenAddress: NULL_ADDRESS,
  currentActiveTokenEndTimestamp: BigInt(0),
};

export const useTempTokenState = (channelId: number): UseTempTokenStateType => {
  const { network } = useNetworkContext();
  const { localNetwork, explorerUrl } = network;
  const toast = useToast();

  const [newTokenName, setNewTokenName] = useState<string>("temp");
  const [newTokenSymbol, setNewTokenSymbol] = useState<string>("temp");
  const [newTokenDuration, setNewTokenDuration] = useState<bigint>(
    BigInt(3600)
  );

  const [currentActiveTokenAddress, setCurrentActiveTokenAddress] =
    useState<string>(NULL_ADDRESS);
  const [currentActiveTokenEndTimestamp, setCurrentActiveTokenEndTimestamp] =
    useState<bigint>(BigInt(0));

  const factoryContract = getContractFromNetwork(
    Contract.TEMP_TOKEN_FACTORY_V1,
    localNetwork
  );

  const [incomingLogs, setIncomingLogs] = useState<Log[]>([]);

  useContractEvent({
    address: factoryContract.address,
    abi: factoryContract.abi,
    eventName: "createTempToken",
    listener(logs) {
      const init = async () => {
        setIncomingLogs(logs);
      };
      init();
    },
  });

  useEffect(() => {
    if (incomingLogs) handleUpdate(incomingLogs);
  }, [incomingLogs]);

  const handleUpdate = async (logs: Log[]) => {
    console.log("incoming logs", logs);
    if (logs.length === 0) return;
  };

  const [getTempTokensQuery] = useLazyQuery<GetTempTokensQuery>(
    GET_TEMP_TOKENS_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

  const { postTempToken } = usePostTempToken({});

  const {
    createTempToken: _createTempToken,
    createTempTokenData,
    createTempTokenTxData,
    isCreateTempTokenLoading,
  } = useCreateTempToken(
    {
      name: newTokenName,
      symbol: newTokenSymbol,
      duration: newTokenDuration,
    },
    factoryContract,
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
                createTempToken pending, click to view
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
              createTempToken cancelled
            </Box>
          ),
        });
      },
      onTxSuccess: async (data) => {
        console.log("createTempToken success", data);
        const topics = decodeEventLog({
          abi: factoryContract.abi,
          data: data.logs[2].data,
          topics: data.logs[2].topics,
        });
        const args: any = topics.args;
        const encoded = encodeAbiParameters(
          [
            {
              name: "name",
              type: "string",
            },
            {
              name: "symbol",
              type: "string",
            },
            {
              name: "_endTimestamp",
              type: "uint256",
            },
            {
              name: "_protocolFeeDestination",
              type: "address",
            },
            {
              name: "_protocolFeePercent",
              type: "uint256",
            },
            {
              name: "_streamerFeePercent",
              type: "uint256",
            },
            {
              name: "_factoryAddress",
              type: "address",
            },
          ],
          [
            args.name as string,
            args.symbol as string,
            args.endTimestamp as bigint,
            args.protocolFeeDestination as `0x${string}`,
            args.protocolFeePercent as bigint,
            args.streamerFeePercent as bigint,
            factoryContract.address as `0x${string}`,
          ]
        );
        await Promise.all([
          verifyTempTokenV1OnBase(
            args.tokenAddress as `0x${string}`,
            encoded.startsWith("0x") ? encoded.substring(2) : encoded
          ),
          postTempToken({
            tokenAddress: args.tokenAddress as `0x${string}`,
            symbol: args.symbol as string,
            streamerFeePercentage: args.streamerFeePercent as bigint,
            protocolFeePercentage: args.protocolFeePercent as bigint,
            ownerAddress: args.owner as `0x${string}`,
            name: args.name as string,
            endUnixTimestamp: args.endTimestamp as bigint,
            channelId: Number(channelId),
            chainId: localNetwork.config.chainId as number,
          }),
        ]);
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                createTempToken success, click to view
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
              createTempToken error
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
    }
  );

  const handleNewTokenName = useCallback((name: string) => {
    setNewTokenName(name);
  }, []);

  const handleNewTokenSymbol = useCallback((symbol: string) => {
    setNewTokenSymbol(symbol);
  }, []);

  const handleNewTokenDuration = useCallback((duration: bigint) => {
    setNewTokenDuration(duration);
  }, []);

  const createTempToken = useCallback(async () => {
    // await _createTempToken?.();
    await postTempToken({
      tokenAddress: "0x",
      symbol: newTokenSymbol,
      streamerFeePercentage: BigInt(0),
      protocolFeePercentage: BigInt(0),
      ownerAddress: "0x",
      name: newTokenName,
      endUnixTimestamp: BigInt(
        Math.floor(Date.now() / 1000) + Number(newTokenDuration)
      ),
      channelId,
      chainId: localNetwork.config.chainId as number,
    });
  }, [_createTempToken]);

  useEffect(() => {
    const init = async () => {
      const res = await getTempTokensQuery({
        variables: {
          data: {
            channelId: String(channelId),
            chainId: localNetwork.config.chainId,
            onlyActiveTokens: true,
          },
        },
      });
      const listOfActiveTokens = res.data?.getTempTokens;
      const latestActiveToken = listOfActiveTokens?.[0];
      if (latestActiveToken) {
        setCurrentActiveTokenEndTimestamp(
          BigInt(latestActiveToken.endUnixTimestamp)
        );
        setCurrentActiveTokenAddress(latestActiveToken.tokenAddress);
      }
    };
    init();
  }, [channelId, localNetwork.config.chainId]);

  return {
    newTokenName,
    newTokenSymbol,
    newTokenDuration,
    createTempToken,
    createTempTokenData,
    createTempTokenTxData,
    isCreateTempTokenLoading,
    handleNewTokenName,
    handleNewTokenSymbol,
    handleNewTokenDuration,
    currentActiveTokenAddress,
    currentActiveTokenEndTimestamp,
  };
};
