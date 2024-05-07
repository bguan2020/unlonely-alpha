import { useCallback, useRef, useState } from "react";
import { Contract, InteractionType } from "../../../../constants";
import { getContractFromNetwork } from "../../../../utils/contract";
import { useNetworkContext } from "../../../context/useNetwork";
import { useCreateMultipleTempTokens } from "../../../contracts/useTempTokenFactoryV1";
import { useToast, Box } from "@chakra-ui/react";
import Link from "next/link";
import { decodeEventLog, encodeAbiParameters } from "viem";
import { useChannelContext } from "../../../context/useChannel";
import usePostTempToken from "../../../server/temp-token/usePostTempToken";
import centerEllipses from "../../../../utils/centerEllipses";
import { useUser } from "../../../context/useUser";
import { verifyTempTokenV1OnBase } from "../../../../utils/contract-verification/tempToken";
import { TempTokenType } from "../../../../generated/graphql";

export type UseCreateMultipleTempTokensState = {
  newTokenAName: string;
  newTokenASymbol: string;
  newTokenBName: string;
  newTokenBSymbol: string;
  newDuration: bigint;
  createMultipleTempTokens?: () => Promise<any>;
  createMultipleTempTokensData: any;
  createMultipleTempTokensTxData: any;
  isCreateMultipleTempTokensLoading: boolean;
  handleTokenName: (name: string, tokenType: "a" | "b") => void;
  handleTokenSymbol: (symbol: string, tokenType: "a" | "b") => void;
  handleNewDuration: (duration: bigint) => void;
};

export const useCreateMultipleTempTokensInitialState: UseCreateMultipleTempTokensState =
  {
    newTokenAName: "",
    newTokenASymbol: "",
    newTokenBName: "",
    newTokenBSymbol: "",
    newDuration: BigInt(3600),
    createMultipleTempTokens: undefined,
    createMultipleTempTokensData: undefined,
    createMultipleTempTokensTxData: undefined,
    isCreateMultipleTempTokensLoading: false,
    handleTokenName: () => undefined,
    handleTokenSymbol: () => undefined,
    handleNewDuration: () => undefined,
  };

export const useCreateMultipleTempTokensState = ({
  callbackOnTxSuccess,
}: {
  callbackOnTxSuccess: () => void;
}) => {
  const { userAddress, user } = useUser();
  const { channel, chat } = useChannelContext();
  const { addToChatbot: addToChatbotForTempToken } = chat;
  const { channelQueryData } = channel;
  const { network } = useNetworkContext();
  const { localNetwork, explorerUrl } = network;
  const toast = useToast();

  const [newTokenAName, setNewTokenAName] = useState("");
  const [newTokenASymbol, setNewTokenASymbol] = useState("");
  const [newTokenBName, setNewTokenBName] = useState("");
  const [newTokenBSymbol, setNewTokenBSymbol] = useState("");
  const [newDuration, setNewDuration] = useState<bigint>(BigInt(1800));

  const factoryContract = getContractFromNetwork(
    Contract.TEMP_TOKEN_FACTORY_V1,
    localNetwork
  );

  const canAddToChatbot_create = useRef(false);

  const { postTempToken } = usePostTempToken({});

  const {
    createMultipleTempTokens,
    createMultipleTempTokensData,
    createMultipleTempTokensTxData,
    isCreateMultipleTempTokensLoading,
  } = useCreateMultipleTempTokens(
    {
      names: [newTokenAName, newTokenBName],
      symbols: [newTokenASymbol, newTokenBSymbol],
      duration: newDuration,
      totalSupplyThreshold: BigInt(0),
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
                createMultipleTempTokens pending, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        canAddToChatbot_create.current = true;
      },
      onWriteError: (error) => {
        toast({
          duration: 9000,
          isClosable: true,
          position: "top-right",
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              createMultipleTempTokens cancelled
            </Box>
          ),
        });
        canAddToChatbot_create.current = false;
      },
      onTxSuccess: async (data) => {
        console.log(
          "createMultipleTempTokens success 1",
          canAddToChatbot_create.current
        );
        if (!canAddToChatbot_create.current) return;
        const topics = decodeEventLog({
          abi: factoryContract.abi,
          data: data.logs[data.logs.length - 1].data,
          topics: data.logs[data.logs.length - 1].topics,
        });
        const args: any = topics.args;
        console.log("createMultipleTempTokens success 2", args, data);
        const newEndTimestamp = args.endTimestamp as bigint;
        const newTokenAddresses = args.tokenAddresses as `0x${string}`[];
        const newTokenSymbols = args.symbols as string[];
        const newTokenNames = args.names as string[];
        const newTokenCreationBlockNumber = args.creationBlockNumber as bigint;
        await postTempToken({
          tokenAddress: newTokenAddresses[0],
          symbol: newTokenSymbols[0],
          streamerFeePercentage: String(args.streamerFeePercent as bigint),
          protocolFeePercentage: String(args.protocolFeePercent as bigint),
          ownerAddress: args.owner as `0x${string}`,
          name: newTokenNames[0],
          endUnixTimestamp: String(newEndTimestamp),
          channelId: Number(channelQueryData?.id),
          chainId: localNetwork.config.chainId as number,
          creationBlockNumber: String(newTokenCreationBlockNumber),
          factoryAddress: factoryContract.address as `0x${string}`,
          tokenType: TempTokenType.VersusMode,
        })
          .then((res) => {
            console.log(
              "(1/2) createMultipleTempTokens update database success",
              res
            );
            toast({
              render: () => (
                <Box as="button" borderRadius="md" bg="#5058c8" px={4} h={8}>
                  (1/2) createMultipleTempTokens update database success
                </Box>
              ),
              duration: 9000,
              isClosable: true,
              position: "top-right",
            });
          })
          .catch((err) => {
            console.log(
              "(1/2) createMultipleTempTokens update database error",
              err
            );
            toast({
              render: () => (
                <Box as="button" borderRadius="md" bg="#c87850" px={4} h={8}>
                  (1/2) createMultipleTempTokens update database error
                </Box>
              ),
              duration: 9000,
              isClosable: true,
              position: "top-right",
            });
          });
        await postTempToken({
          tokenAddress: newTokenAddresses[1],
          symbol: newTokenSymbols[1],
          streamerFeePercentage: String(args.streamerFeePercent as bigint),
          protocolFeePercentage: String(args.protocolFeePercent as bigint),
          ownerAddress: args.owner as `0x${string}`,
          name: newTokenNames[1],
          endUnixTimestamp: String(newEndTimestamp),
          channelId: Number(channelQueryData?.id),
          chainId: localNetwork.config.chainId as number,
          creationBlockNumber: String(newTokenCreationBlockNumber),
          factoryAddress: factoryContract.address as `0x${string}`,
          tokenType: TempTokenType.VersusMode,
        })
          .then((res) => {
            console.log(
              "(2/2) createMultipleTempTokens update database success",
              res
            );
            toast({
              render: () => (
                <Box as="button" borderRadius="md" bg="#5058c8" px={4} h={8}>
                  (2/2) createMultipleTempTokens update database success
                </Box>
              ),
              duration: 9000,
              isClosable: true,
              position: "top-right",
            });
          })
          .catch((err) => {
            console.log(
              "(1/2) createMultipleTempTokens update database error",
              err
            );
            toast({
              render: () => (
                <Box as="button" borderRadius="md" bg="#c87850" px={4} h={8}>
                  (2/2) createMultipleTempTokens update database error
                </Box>
              ),
              duration: 9000,
              isClosable: true,
              position: "top-right",
            });
          });
        const title = `${
          user?.username ?? centerEllipses(args.owner as `0x${string}`, 15)
        } created the $${newTokenSymbols[0]} and $${
          newTokenSymbols[1]
        } tokens!`;
        addToChatbotForTempToken({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.CREATE_MULTIPLE_TEMP_TOKENS,
          title,
          description: `${String(newEndTimestamp)}:${JSON.stringify(
            newTokenAddresses
          )}:${JSON.stringify(newTokenSymbols)}:${String(
            localNetwork.config.chainId
          )}:${String(newTokenCreationBlockNumber)}`,
        });
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                createMultipleTempTokens success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
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
          ],
          [
            newTokenNames[0] as string,
            newTokenSymbols[0] as string,
            args.endTimestamp as bigint,
            args.protocolFeeDestination as `0x${string}`,
            args.protocolFeePercent as bigint,
            args.streamerFeePercent as bigint,
            args.totalSupplyThreshold as bigint,
            factoryContract.address as `0x${string}`,
            args.creationBlockNumber as bigint,
          ]
        );
        await verifyTempTokenV1OnBase(
          newTokenAddresses[0] as `0x${string}`,
          encoded
        );
        console.log("createMultipleTempTokens encoded", encoded);
        canAddToChatbot_create.current = false;
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              createMultipleTempTokens error
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        canAddToChatbot_create.current = false;
      },
    }
  );

  const handleTokenName = useCallback((name: string, tokenType: "a" | "b") => {
    if (tokenType === "a") {
      setNewTokenAName(name);
    } else {
      setNewTokenBName(name);
    }
  }, []);

  const handleTokenSymbol = useCallback(
    (symbol: string, tokenType: "a" | "b") => {
      if (tokenType === "a") {
        setNewTokenASymbol(symbol);
      } else {
        setNewTokenBSymbol(symbol);
      }
    },
    []
  );

  const handleNewDuration = useCallback((duration: bigint) => {
    setNewDuration(duration);
  }, []);

  return {
    newTokenAName,
    newTokenASymbol,
    newTokenBName,
    newTokenBSymbol,
    newDuration,
    createMultipleTempTokens,
    createMultipleTempTokensData,
    createMultipleTempTokensTxData,
    isCreateMultipleTempTokensLoading,
    handleTokenName,
    handleTokenSymbol,
    handleNewDuration,
  };
};
