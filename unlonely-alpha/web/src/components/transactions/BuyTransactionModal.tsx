import { Text, Input, Flex, useToast, Box } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useBalance } from "wagmi";
import Link from "next/link";

import { useUser } from "../../hooks/context/useUser";
import {
  filteredInput,
  formatIncompleteNumber,
} from "../../utils/validation/input";
import centerEllipses from "../../utils/centerEllipses";
import { TransactionModalTemplate } from "./TransactionModalTemplate";
import { ModalButton } from "../general/button/ModalButton";
import {
  useBuyCreatorToken,
  useCalculateEthAmount,
} from "../../hooks/contracts/useArcadeContract";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { InteractionType } from "../../constants";
import useUpdateUserCreatorTokenQuantity from "../../hooks/server/arcade/useUpdateTokenQuantity";
import CreatorTokenAbi from "../../constants/abi/CreatorToken.json";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useApproval } from "../../hooks/contracts/useApproval";
import { getContractFromNetwork } from "../../utils/contract";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { useNetworkContext } from "../../hooks/context/useNetwork";

export default function BuyTransactionModal({
  title,
  isOpen,
  icon,
  callback,
  handleClose,
}: {
  title: string;
  isOpen: boolean;
  icon?: JSX.Element;
  callback?: () => void;
  handleClose: () => void;
}) {
  const { isStandalone } = useUserAgent();

  const { user, userAddress, walletIsConnected } = useUser();
  const { channel, token, holders, arcade } = useChannelContext();
  const { addToChatbot } = arcade;
  const { network } = useNetworkContext();
  const { matchingChain, localNetwork, explorerUrl } = network;
  const { channelQueryData } = channel;
  const {
    userTokenBalance,
    refetchUserTokenBalance,
    ownerTokenBalance,
    refetchOwnerTokenBalance,
  } = token;
  const { refetchTokenHolders } = holders;
  const { data: userEthBalance, refetch: refetchUserEthBalance } = useBalance({
    address: userAddress as `0x${string}`,
  });

  const contract = getContractFromNetwork("unlonelyArcade", localNetwork);

  const [amount, setAmount] = useState("");
  const [amountOption, setAmountOption] = useState<
    "custom" | "5" | "10" | "15" | "25" | "50"
  >("5");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const toast = useToast();

  const buyTokenAmount_bigint = useMemo(
    () =>
      parseUnits(
        formatIncompleteNumber(
          amountOption === "custom" ? amount : amountOption
        ) as `${number}`,
        18
      ),
    [amountOption, amount]
  );

  const { allowance: ownerAllowance, refetchAllowance } = useApproval(
    channelQueryData?.token?.address as `0x${string}`,
    CreatorTokenAbi,
    channelQueryData?.owner?.address as `0x${string}`,
    contract?.address as `0x${string}`,
    contract?.chainId as number,
    BigInt(0)
  );

  const { amountIn } = useCalculateEthAmount(
    channelQueryData?.token?.address as `0x${string}`,
    contract,
    buyTokenAmount_bigint
  );

  const { updateUserCreatorTokenQuantity } = useUpdateUserCreatorTokenQuantity({
    onError: (error: any) => {
      // console.log(error);
    },
  });

  const { buyCreatorToken, buyCreatorTokenTxLoading } = useBuyCreatorToken(
    {
      creatorTokenAddress: channelQueryData?.token?.address as `0x${string}`,
      amountIn,
      amountOut: buyTokenAmount_bigint,
    },
    contract,
    {
      onWriteSuccess: (data) => {
        handleClose();
        toast({
          duration: 9000,
          isClosable: true,
          position: "top-right",
          render: () => (
            <Box as="button" borderRadius="md" bg="#287ab0" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.hash}`}
                passHref
              >
                buyCreatorToken pending, click to view
              </Link>
            </Box>
          ),
        });
      },
      onTxSuccess: async (data) => {
        toast({
          duration: 9000,
          isClosable: true,
          position: "top-right",
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                buyCreatorToken success, click to view
              </Link>
            </Box>
          ),
        });
        callback?.();
        refetchAllowance?.();
        refetchOwnerTokenBalance?.();
        refetchUserEthBalance?.();
        refetchUserTokenBalance?.();
        await updateUserCreatorTokenQuantity({
          tokenAddress: channelQueryData?.token?.address as `0x${string}`,
          purchasedAmount: Number(
            amountOption === "custom" ? amount : amountOption
          ),
        });
        addToChatbot({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.BUY,
          title: `${user?.username ?? centerEllipses(userAddress, 15)} bought ${
            amountOption === "custom" ? amount : amountOption
          } $${channelQueryData?.token?.symbol}!`,
          description: "Buy",
        });
        refetchTokenHolders?.();
      },
    }
  );

  const handleSend = async () => {
    if (!buyCreatorToken) return;
    await buyCreatorToken();
  };

  const handleInputChange = (event: any) => {
    const input = event.target.value;
    const filtered = filteredInput(input);
    setAmount(filtered);
  };

  const canSend = useMemo(() => {
    if (amountOption === "custom" && buyTokenAmount_bigint <= BigInt(0))
      return false;
    if (!buyCreatorToken) return false;
    return true;
  }, [buyTokenAmount_bigint, amountOption, buyCreatorToken]);

  useEffect(() => {
    if (!walletIsConnected) {
      setErrorMessage("connect wallet first");
    } else if (!matchingChain) {
      setErrorMessage("wrong network");
    } else if (
      ownerAllowance < buyTokenAmount_bigint ||
      (ownerTokenBalance?.value &&
        ownerTokenBalance?.value < buyTokenAmount_bigint)
    ) {
      setErrorMessage("there are not enough tokens on sale");
    } else if (userEthBalance?.value && amountIn > userEthBalance?.value) {
      setErrorMessage("you don't have enough ETH to spend");
    } else {
      setErrorMessage("");
    }
  }, [
    buyTokenAmount_bigint,
    ownerAllowance,
    userEthBalance?.value,
    amountIn,
    walletIsConnected,
    matchingChain,
  ]);

  return (
    <TransactionModalTemplate
      title={title}
      confirmButton={"purchase"}
      isOpen={isOpen}
      icon={icon}
      isModalLoading={buyCreatorTokenTxLoading ?? false}
      canSend={canSend}
      onSend={handleSend}
      handleClose={handleClose}
      size={isStandalone ? "sm" : "md"}
    >
      <Flex direction={"column"} gap="16px">
        <Text textAlign={"center"} fontSize="25px" color="#BABABA">
          you own{" "}
          {`${truncateValue(userTokenBalance?.formatted ?? "0", 3)} $${
            channelQueryData?.token?.symbol
          }`}
        </Text>
        <Flex justifyContent={"space-between"}>
          <ModalButton
            width="120px"
            height="50px"
            fade={amountOption === "5" ? 1 : 0.2}
            onClick={() => setAmountOption("5")}
          >
            <Text fontSize="20px">5</Text>
          </ModalButton>
          <ModalButton
            width="120px"
            height="50px"
            fade={amountOption === "10" ? 1 : 0.2}
            onClick={() => setAmountOption("10")}
          >
            <Text fontSize="20px">10</Text>
          </ModalButton>
          <ModalButton
            width="120px"
            height="50px"
            fade={amountOption === "15" ? 1 : 0.2}
            onClick={() => setAmountOption("15")}
          >
            <Text fontSize="20px">15</Text>
          </ModalButton>
        </Flex>
        <Flex justifyContent={"space-between"}>
          <ModalButton
            width="190px"
            height="50px"
            fade={amountOption === "25" ? 1 : 0.2}
            onClick={() => setAmountOption("25")}
          >
            <Text fontSize="20px">25</Text>
          </ModalButton>
          <ModalButton
            width="190px"
            height="50px"
            fade={amountOption === "50" ? 1 : 0.2}
            onClick={() => setAmountOption("50")}
          >
            <Text fontSize="20px">50</Text>
          </ModalButton>
        </Flex>
        <Flex justifyContent={"space-between"}>
          <ModalButton
            width="100%"
            height="50px"
            fade={amountOption === "custom" ? 1 : 0.2}
            onClick={() => setAmountOption("custom")}
          >
            <Text fontSize="20px">custom amount</Text>
          </ModalButton>
        </Flex>

        {amountOption === "custom" && (
          <Input
            placeholder={`enter amount of $${channelQueryData?.token?.symbol}`}
            value={amount}
            onChange={handleInputChange}
            borderWidth="1px"
            borderRadius="10px"
            borderColor="#244FA7"
            bg="rgba(36, 79, 167, 0.05)"
            variant="unstyled"
            px="16px"
            py="10px"
          />
        )}
        {errorMessage && (
          <Text textAlign={"center"} color="red.400">
            {errorMessage}
          </Text>
        )}
        <Text textAlign={"right"} fontSize="25px" color="#BABABA">
          cost: {`${truncateValue(formatUnits(amountIn, 18) ?? "0", 5)} eth`}
        </Text>
      </Flex>
    </TransactionModalTemplate>
  );
}
