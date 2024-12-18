import { useCallback, useRef, useState } from "react";
import { useToast, Box } from "@chakra-ui/react";
import Link from "next/link";
import { encodeAbiParameters } from "viem";
import { useNetworkContext } from "../../../context/useNetwork";
import { useCreateTempToken } from "../../../contracts/useTempTokenFactoryV1";
import { verifyTempTokenV1OnBase } from "../../../../utils/contract-verification/tempToken";
import usePostTempToken from "../../../server/temp-token/usePostTempToken";
import {
  CHAKRA_UI_TX_TOAST_DURATION,
  Contract,
  InteractionType,
} from "../../../../constants";
import {
  getContractFromNetwork,
  returnDecodedTopics,
} from "../../../../utils/contract";
import { useChannelContext } from "../../../context/useChannel";
import { useUser } from "../../../context/useUser";
import centerEllipses from "../../../../utils/centerEllipses";
import {
  QuerySendAllNotificationsArgs,
  TempTokenType,
} from "../../../../generated/graphql";
import { useLazyQuery } from "@apollo/client";
import { SEND_ALL_NOTIFICATIONS_QUERY } from "../../../../constants/queries";
import { usePublicClient } from "wagmi";
import TempTokenAbi from "../../../../constants/abi/TempTokenV1.json";

export const EASY_THRESHOLD = BigInt(420_000);
export const MEDIUM_THRESHOLD = BigInt(690_000);
export const HARD_THRESHOLD = BigInt(2_000_000);

export type UseCreateTempTokenStateType = {
  newTokenName: string;
  newTokenSymbol: string;
  newTokenDuration: bigint;
  newTokenTotalSupplyThreshold: bigint;
  newPreSaleDuration: bigint;
  createTempToken?: () => void;
  createTempTokenData: any;
  createTempTokenTxData: any;
  isCreateTempTokenLoading: boolean;
  handleNewTokenName: (name: string) => void;
  handleNewTokenSymbol: (symbol: string) => void;
  handleNewTokenDuration: (duration: bigint) => void;
  handleNewTokenTotalSupplyThreshold: (totalSupplyThreshold: bigint) => void;
  handlePreSaleDuration: (duration: bigint) => void;
};

export const useCreateTempTokenInitialState: UseCreateTempTokenStateType = {
  newTokenName: "temp",
  newTokenSymbol: "temp",
  newTokenDuration: BigInt(3600),
  newPreSaleDuration: BigInt(60 * 2),
  newTokenTotalSupplyThreshold: MEDIUM_THRESHOLD,
  createTempToken: undefined,
  createTempTokenData: undefined,
  createTempTokenTxData: undefined,
  isCreateTempTokenLoading: false,
  handleNewTokenName: () => undefined,
  handleNewTokenSymbol: () => undefined,
  handleNewTokenDuration: () => undefined,
  handleNewTokenTotalSupplyThreshold: () => undefined,
  handlePreSaleDuration: () => undefined,
};

export const useCreateTempTokenState = ({
  callbackOnTxSuccess,
}: {
  callbackOnTxSuccess: () => void;
}): UseCreateTempTokenStateType => {
  const { user } = useUser();
  const { chat, channel } = useChannelContext();
  const { network } = useNetworkContext();
  const { addToChatbot: addToChatbotForTempToken } = chat;
  const { localNetwork, explorerUrl } = network;
  const toast = useToast();
  const publicClient = usePublicClient();

  const [newTokenName, setNewTokenName] = useState<string>("");
  const [newTokenSymbol, setNewTokenSymbol] = useState<string>("");
  const [newTokenDuration, setNewTokenDuration] = useState<bigint>(
    BigInt(1800)
  );
  const [newPreSaleDuration, setNewPreSaleDuration] = useState<bigint>(
    BigInt(60 * 2)
  );
  const [newTokenTotalSupplyThreshold, setNewTokenTotalSupplyThreshold] =
    useState<bigint>(MEDIUM_THRESHOLD);

  const { postTempToken } = usePostTempToken({});
  const canAddToChatbot_create = useRef(false);
  const factoryContract = getContractFromNetwork(
    Contract.TEMP_TOKEN_FACTORY_V1,
    localNetwork
  );

  const [sendNotifications] = useLazyQuery<QuerySendAllNotificationsArgs>(
    SEND_ALL_NOTIFICATIONS_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

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
      totalSupplyThreshold: newTokenTotalSupplyThreshold,
      preSaleDuration: newPreSaleDuration,
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
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
        canAddToChatbot_create.current = true;
      },
      onWriteError: (error) => {
        toast({
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              createTempToken cancelled
            </Box>
          ),
        });
        canAddToChatbot_create.current = false;
      },
      onTxSuccess: async (data) => {
        if (!canAddToChatbot_create.current || !publicClient) return;
        const topics = returnDecodedTopics(
          data.logs,
          factoryContract.abi,
          "TempTokenCreated"
        );
        if (!topics) {
          canAddToChatbot_create.current = false;
          return;
        }
        const args: any = topics.args;
        console.log("createTempToken success", args, data);
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#5058c8" px={4} h={8}>
              starting, please wait
            </Box>
          ),
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
        await new Promise((resolve) => setTimeout(resolve, 4000));
        const returnedMinBaseTokenPrice = await publicClient
          .readContract({
            address: args.tokenAddress as `0x${string}`,
            abi: TempTokenAbi,
            functionName: "MIN_BASE_TOKEN_PRICE",
          })
          .catch((err) => {
            console.log(
              "createTempToken readContract minBaseTokenPrice error",
              err
            );
            return BigInt(0);
          });
        await postTempToken({
          tokenAddress: args.tokenAddress as `0x${string}`,
          symbol: args.symbol as string,
          streamerFeePercentage: String(args.streamerFeePercent as bigint),
          protocolFeePercentage: String(args.protocolFeePercent as bigint),
          ownerAddress: args.owner as `0x${string}`,
          name: args.name as string,
          endUnixTimestamp: String(args.endTimestamp as bigint),
          channelId: Number(channel.channelQueryData?.id),
          chainId: localNetwork.config.chainId as number,
          creationBlockNumber: String(args.creationBlockNumber as bigint),
          factoryAddress: factoryContract.address as `0x${string}`,
          tokenType: TempTokenType.SingleMode,
          minBaseTokenPrice: String(returnedMinBaseTokenPrice as bigint),
        })
          .then((res) => {
            console.log("createTempToken update database success", res);
            toast({
              render: () => (
                <Box as="button" borderRadius="md" bg="#5058c8" px={4} h={8}>
                  createTempToken update database success
                </Box>
              ),
              duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
              isClosable: true,
              position: "bottom", // chakra ui toast position
            });
          })
          .catch((err) => {
            console.log("createTempToken update database error", err);
            toast({
              render: () => (
                <Box as="button" borderRadius="md" bg="#c87850" px={4} h={8}>
                  createTempToken update database error
                </Box>
              ),
              duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
              isClosable: true,
              position: "bottom", // chakra ui toast position
            });
          });
        const title = `${
          user?.username ?? centerEllipses(args.owner as `0x${string}`, 15)
        } created the $${args.symbol} token!`;
        addToChatbotForTempToken({
          username: user?.username ?? "",
          address: user?.address ?? "",
          taskType: InteractionType.CREATE_TEMP_TOKEN,
          title,
          description: JSON.stringify({
            tokenAddress: args.tokenAddress as string,
            symbol: args.symbol as string,
            endTimestamp: String(args.endTimestamp as bigint),
            creationBlockNumber: String(args.creationBlockNumber),
            totalSupplyThreshold: String(args.totalSupplyThreshold),
            preSaleEndTimestamp: String(args.preSaleEndTimestamp),
            factoryAddress: String(factoryContract.address),
            minBaseTokenPrice: String(returnedMinBaseTokenPrice),
          }),
        });
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
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
        if (Number(args.preSaleEndTimestamp) > Math.floor(Date.now() / 1000)) {
          const res = await sendNotifications({
            variables: {
              data: {
                title: `/${channel.channelQueryData?.slug} launched $${args.symbol} token!`,
                body: "you have 2 min. to claim 1,000 free tokens",
                pathname: `/channels/${channel.channelQueryData?.slug}`,
                channelId: undefined,
              },
            },
          });
          console.log("useCreateTempTokenState send all notifications:", res);
        }
        callbackOnTxSuccess();
        // wait for 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 5000));
        // verify the contract on base
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
              name: "_totalSupplyThreshold",
              type: "uint256",
            },
            {
              name: "_factoryAddress",
              type: "address",
            },
            {
              name: "_creationBlockNumber",
              type: "uint256",
            },
            {
              name: "_preSaleEndTimestamp",
              type: "uint256",
            },
          ],
          [
            args.name as string,
            args.symbol as string,
            args.endTimestamp as bigint,
            args.protocolFeeDestination as `0x${string}`,
            args.protocolFeePercent as bigint,
            args.streamerFeePercent as bigint,
            args.totalSupplyThreshold as bigint,
            factoryContract.address as `0x${string}`,
            args.creationBlockNumber as bigint,
            args.preSaleEndTimestamp as bigint,
          ]
        );
        await verifyTempTokenV1OnBase(
          args.tokenAddress as `0x${string}`,
          encoded
        );
        console.log("createTempToken encoded", encoded);
        canAddToChatbot_create.current = false;
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              createTempToken error
            </Box>
          ),
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
        canAddToChatbot_create.current = false;
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

  const handleNewTokenTotalSupplyThreshold = useCallback(
    (totalSupplyThreshold: bigint) => {
      setNewTokenTotalSupplyThreshold(totalSupplyThreshold);
    },
    []
  );

  const handlePreSaleDuration = useCallback((duration: bigint) => {
    setNewPreSaleDuration(duration);
  }, []);

  return {
    newTokenName,
    newTokenSymbol,
    newTokenDuration,
    newPreSaleDuration,
    newTokenTotalSupplyThreshold,
    createTempToken: _createTempToken,
    createTempTokenData,
    createTempTokenTxData,
    isCreateTempTokenLoading,
    handleNewTokenName,
    handleNewTokenSymbol,
    handleNewTokenDuration,
    handleNewTokenTotalSupplyThreshold,
    handlePreSaleDuration,
  };
};
