import { useCallback, useRef, useState } from "react";
import { Contract } from "../../../../constants";
import { getContractFromNetwork } from "../../../../utils/contract";
import { useNetworkContext } from "../../../context/useNetwork";
import { useCreateMultipleTempTokens } from "../../../contracts/useTempTokenFactoryV1";
import { useToast, Box } from "@chakra-ui/react";
import Link from "next/link";
import { decodeEventLog } from "viem";

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

export const useCreateMultipleTempTokensState = () => {
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
          data,
          canAddToChatbot_create.current
        );
        if (!canAddToChatbot_create.current) return;
        const topics = decodeEventLog({
          abi: factoryContract.abi,
          data: data.logs[2].data,
          topics: data.logs[2].topics,
        });
        const args: any = topics.args;
        console.log("createMultipleTempTokens success 2", args, data);
        // await postTempToken({
        //   tokenAddress: args.tokenAddress as `0x${string}`,
        //   symbol: args.symbol as string,
        //   streamerFeePercentage: args.streamerFeePercent as bigint,
        //   protocolFeePercentage: args.protocolFeePercent as bigint,
        //   ownerAddress: args.owner as `0x${string}`,
        //   name: args.name as string,
        //   endUnixTimestamp: args.endTimestamp as bigint,
        //   channelId: Number(channel.channelQueryData?.id),
        //   chainId: localNetwork.config.chainId as number,
        //   highestTotalSupply: BigInt(0),
        //   creationBlockNumber: args.creationBlockNumber as bigint,
        //   factoryAddress: factoryContract.address as `0x${string}`,
        // })
        //   .then((res) => {
        //     console.log("createMultipleTempTokens update database success", res);
        //     toast({
        //       render: () => (
        //         <Box as="button" borderRadius="md" bg="#5058c8" px={4} h={8}>
        //           createMultipleTempTokens update database success
        //         </Box>
        //       ),
        //       duration: 9000,
        //       isClosable: true,
        //       position: "top-right",
        //     });
        //   })
        //   .catch((err) => {
        //     console.log("createMultipleTempTokens update database error", err);
        //     toast({
        //       render: () => (
        //         <Box as="button" borderRadius="md" bg="#c87850" px={4} h={8}>
        //           createMultipleTempTokens update database error
        //         </Box>
        //       ),
        //       duration: 9000,
        //       isClosable: true,
        //       position: "top-right",
        //     });
        //   });
        // const title = `${
        //   user?.username ?? centerEllipses(args.account as `0x${string}`, 15)
        // } created the $${args.symbol} token!`;
        // addToChatbotForTempToken({
        //   username: user?.username ?? "",
        //   address: userAddress ?? "",
        //   taskType: InteractionType.CREATE_TEMP_TOKEN,
        //   title,
        //   description: "",
        // });
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
        // wait for 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 5000));
        // verify the contract on base
        // const encoded = encodeAbiParameters(
        //   [
        //     {
        //       name: "name",
        //       type: "string",
        //     },
        //     {
        //       name: "symbol",
        //       type: "string",
        //     },
        //     {
        //       name: "_endTimestamp",
        //       type: "uint256",
        //     },
        //     {
        //       name: "_protocolFeeDestination",
        //       type: "address",
        //     },
        //     {
        //       name: "_protocolFeePercent",
        //       type: "uint256",
        //     },
        //     {
        //       name: "_streamerFeePercent",
        //       type: "uint256",
        //     },
        //     {
        //       name: "_totalSupplyThreshold",
        //       type: "uint256",
        //     },
        //     {
        //       name: "_factoryAddress",
        //       type: "address",
        //     },
        //     {
        //       name: "_creationBlockNumber",
        //       type: "uint256",
        //     },
        //   ],
        //   [
        //     args.name as string,
        //     args.symbol as string,
        //     args.endTimestamp as bigint,
        //     args.protocolFeeDestination as `0x${string}`,
        //     args.protocolFeePercent as bigint,
        //     args.streamerFeePercent as bigint,
        //     args.totalSupplyThreshold as bigint,
        //     factoryContract.address as `0x${string}`,
        //     args.creationBlockNumber as bigint,
        //   ]
        // );
        // await verifyTempTokenV1OnBase(
        //   args.tokenAddress as `0x${string}`,
        //   encoded
        // );
        // console.log("createMultipleTempTokens encoded", encoded);
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
