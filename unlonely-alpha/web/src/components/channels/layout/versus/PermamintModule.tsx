import { Box, Button, Spinner, useToast } from "@chakra-ui/react";
import { useMintWinnerTokens } from "../../../../hooks/contracts/useTempTokenFactoryV1";
import { useVersusTempTokenContext } from "../../../../hooks/context/useVersusTempToken";
import { useEffect, useState } from "react";
import {
  CHAKRA_UI_TX_TOAST_DURATION,
  Contract,
  InteractionType,
} from "../../../../constants";
import { useNetworkContext } from "../../../../hooks/context/useNetwork";
import {
  getContractFromNetwork,
  returnDecodedTopics,
} from "../../../../utils/contract";
import { isAddressEqual } from "viem";
import Link from "next/link";
import { usePublicClient } from "wagmi";
import { useUser } from "../../../../hooks/context/useUser";
import { useChannelContext } from "../../../../hooks/context/useChannel";

export const PermamintModule = () => {
  const { userAddress, user } = useUser();

  const { gameState } = useVersusTempTokenContext();
  const {
    winningToken,
    losingToken,
    tokenA,
    tokenB,
    ownerMustPermamint,
    handleOwnerMustPermamint,
  } = gameState;

  const { chat, channel } = useChannelContext();
  const { isOwner } = channel;
  const { addToChatbot } = chat;
  const { network } = useNetworkContext();
  const { localNetwork, explorerUrl } = network;
  const toast = useToast();
  const publicClient = usePublicClient();

  const factoryContract = getContractFromNetwork(
    Contract.TEMP_TOKEN_FACTORY_V1,
    localNetwork
  );

  const [amountOfTokensToMint, setAmountOfTokensToMint] = useState<
    number | undefined
  >(undefined);
  const { mintWinnerTokens, isMintWinnerTokensLoading } = useMintWinnerTokens(
    {
      winnerTokenAddress: winningToken?.address as `0x${string}`,
      amountOfTokens: BigInt(amountOfTokensToMint ?? "0"),
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
                mint winner tokens pending, click to view
              </Link>
            </Box>
          ),
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
      },
      onWriteError: (error) => {
        toast({
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              mint winner tokens cancelled
            </Box>
          ),
        });
      },
      onTxSuccess: async (data) => {
        const topics = returnDecodedTopics(
          data.logs,
          factoryContract.abi,
          "FactoryMintedWinnerTokens"
        );
        if (!topics) return;
        const args: any = topics.args;
        console.log("mint winner tokens success", data, args);
        const winnerTokenAddress = args.winnerTokenAddress as `0x${string}`;

        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                mint winner tokens success, click to view
              </Link>
            </Box>
          ),
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });

        let _winningToken = tokenA;
        let _tokenType: "a" | "b" = "a";

        if (
          tokenA.address &&
          isAddressEqual(
            winnerTokenAddress as `0x${string}`,
            tokenA.address as `0x${string}`
          )
        ) {
          _winningToken = tokenA;
        }
        if (
          tokenB.address &&
          isAddressEqual(
            winnerTokenAddress as `0x${string}`,
            tokenB.address as `0x${string}`
          )
        ) {
          _winningToken = tokenB;
          _tokenType = "b";
        }

        const title = `The $${_winningToken.symbol} token's price increased!`;

        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.VERSUS_WINNER_TOKENS_MINTED,
          title,
          description: `${userAddress}:${Number(
            args.amount as bigint
          )}:${String(data.blockNumber)}:${_tokenType}`,
        });
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              mint winner tokens error
            </Box>
          ),
          duration: CHAKRA_UI_TX_TOAST_DURATION, // chakra ui toast duration
          isClosable: true,
          position: "bottom", // chakra ui toast position
        });
      },
    }
  );

  useEffect(() => {
    const init = async () => {
      if (
        typeof ownerMustPermamint === "number" &&
        ownerMustPermamint > 0 &&
        isOwner
      ) {
        setAmountOfTokensToMint(ownerMustPermamint);
      } else {
        handleOwnerMustPermamint(false);
      }
    };
    init();
  }, [winningToken, losingToken, publicClient, ownerMustPermamint, isOwner]);

  return (
    <Button
      onClick={mintWinnerTokens}
      isDisabled={
        isMintWinnerTokensLoading ||
        !mintWinnerTokens ||
        amountOfTokensToMint === 0 ||
        amountOfTokensToMint === undefined
      }
    >
      {isMintWinnerTokensLoading || amountOfTokensToMint === undefined ? (
        <Spinner />
      ) : (
        `Mint Winner Tokens (${amountOfTokensToMint})`
      )}
    </Button>
  );
};
