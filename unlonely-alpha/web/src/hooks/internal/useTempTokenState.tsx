import { useCallback, useState } from "react";
import { useToast, Box } from "@chakra-ui/react";
import Link from "next/link";
import { decodeEventLog, encodeAbiParameters } from "viem";
import useVerifyTempToken from "../server/useVerifyTempToken";
import { Contract } from "../../constants";
import { getContractFromNetwork } from "../../utils/contract";
import { useNetworkContext } from "../context/useNetwork";
import { useCreateTempToken } from "../contracts/useTempTokenFactoryV1";
import { verifyTempTokenV1OnBase } from "../../utils/contract-verification/TempTokenV1";

export const useTempTokenState = () => {
  const { network } = useNetworkContext();
  const { localNetwork, explorerUrl } = network;
  const toast = useToast();

  const [newTokenName, setNewTokenName] = useState<string>("temp1");
  const [newTokenSymbol, setNewTokenSymbol] = useState<string>("temp1");

  const { verifyTempToken } = useVerifyTempToken({
    onError: () => {
      console.log("error");
    },
  });

  const contract = getContractFromNetwork(
    Contract.TEMP_TOKEN_FACTORY_V1,
    localNetwork
  );

  const {
    createTempToken,
    createTempTokenData,
    createTempTokenTxData,
    isCreateTempTokenLoading,
  } = useCreateTempToken(
    {
      name: newTokenName,
      symbol: newTokenSymbol,
    },
    contract,
    {
      onWriteSuccess: (data) => {
        toast({
          title: "Token Created",
          description: "Your token has been created",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      },
      onWriteError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
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
                verifyEvent success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        const topics = decodeEventLog({
          abi: contract.abi,
          data: data.logs[2].data,
          topics: data.logs[2].topics,
        });
        console.log("topics", topics);
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
            args.feeDestination as `0x${string}`,
            args.protocolFeePercent as bigint,
            args.streamerFeePercent as bigint,
            contract.address as `0x${string}`,
          ]
        );
        // remove 0x prefix from encoded

        // await verifyTempToken({
        //   tempTokenContractAddress: args.tokenAddress as `0x${string}`,
        //   encodedConstructorArguments: encoded.startsWith("0x")
        //     ? encoded.substring(2)
        //     : encoded,
        // });
        await verifyTempTokenV1OnBase(
          args.tokenAddress as `0x${string}`,
          encoded.startsWith("0x") ? encoded.substring(2) : encoded
        );
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

  return {
    newTokenName,
    newTokenSymbol,
    createTempToken,
    createTempTokenData,
    createTempTokenTxData,
    isCreateTempTokenLoading,
    handleNewTokenName,
    handleNewTokenSymbol,
  };
};
