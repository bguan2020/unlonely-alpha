import { Text, Input, Flex, useToast } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "../../hooks/context/useUser";
import { ChatBot } from "../../constants/types";
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
import { formatUnits, parseUnits } from "viem";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { InteractionType } from "../../constants";
import useUpdateUserCreatorTokenQuantity from "../../hooks/server/arcade/useUpdateTokenQuantity";
import CreatorTokenAbi from "../../constants/abi/CreatorToken.json";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useApproval } from "../../hooks/contracts/useApproval";
import { useBalance, useNetwork } from "wagmi";
import { NETWORKS } from "../../constants/networks";
import { getContractFromNetwork } from "../../utils/contract";

export default function BuyTransactionModal({
  title,
  isOpen,
  icon,
  callback,
  handleClose,
  addToChatbot,
}: {
  title: string;
  isOpen: boolean;
  icon?: JSX.Element;
  callback?: () => void;
  handleClose: () => void;
  addToChatbot?: (chatBotMessageToAdd: ChatBot) => void;
}) {
  const { user, userAddress } = useUser();
  const { channel, token } = useChannelContext();
  const { channelBySlug } = channel;
  const {
    userTokenBalance,
    refetchUserTokenBalance,
    ownerTokenBalance,
    refetchOwnerTokenBalance,
  } = token;
  const { data: userEthBalance, refetch: refetchUserEthBalance } = useBalance({
    address: userAddress as `0x${string}`,
  });

  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return (
      NETWORKS.find((n) => n.config.chainId === network.chain?.id) ??
      NETWORKS[0]
    );
  }, [network]);
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
    channelBySlug?.token?.address as `0x${string}`,
    CreatorTokenAbi,
    channelBySlug?.owner?.address as `0x${string}`,
    contract?.address as `0x${string}`,
    contract?.chainId as number,
    BigInt(0)
  );

  const { amountIn } = useCalculateEthAmount(
    channelBySlug?.token?.address as `0x${string}`,
    buyTokenAmount_bigint
  );

  const { updateUserCreatorTokenQuantity } = useUpdateUserCreatorTokenQuantity({
    onError: (error: any) => {
      // console.log(error);
    },
  });

  const { buyCreatorToken, buyCreatorTokenTxLoading } = useBuyCreatorToken(
    {
      creatorTokenAddress: channelBySlug?.token?.address as `0x${string}`,
      amountIn,
      amountOut: buyTokenAmount_bigint,
    },
    {
      onTxSuccess: async (data) => {
        toast({
          title: "buyCreatorToken",
          description: "success",
          status: "success",
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        callback?.();
        refetchAllowance?.();
        refetchOwnerTokenBalance?.();
        refetchUserEthBalance?.();
        refetchUserTokenBalance?.();
        await updateUserCreatorTokenQuantity({
          tokenAddress: channelBySlug?.token?.address as `0x${string}`,
          purchasedAmount: Number(
            amountOption === "custom" ? amount : amountOption
          ),
        });
        addToChatbot?.({
          username: user?.username ?? "",
          address: userAddress ?? "",
          taskType: InteractionType.BUY,
          title: "Buy",
          description: `${
            user?.username ?? centerEllipses(userAddress, 15)
          } bought ${amountOption === "custom" ? amount : amountOption} $${
            channelBySlug?.token?.symbol
          }!`,
        });
        handleClose();
      },
    }
  );

  const handleSend = async () => {
    if (!buyCreatorToken || !addToChatbot) return;
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
    if (!userAddress) {
      setErrorMessage("connect wallet first");
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
    userAddress,
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
    >
      <Flex direction={"column"} gap="16px">
        <Text textAlign={"center"} fontSize="25px" color="#BABABA">
          you own{" "}
          {`${truncateValue(userTokenBalance?.formatted ?? "0", 3)} $${
            channelBySlug?.token?.symbol
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
            placeholder={`enter amount of $${channelBySlug?.token?.symbol}`}
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
          cost: {`${truncateValue(formatUnits(amountIn, 18) ?? "0", 3)} eth`}
        </Text>
      </Flex>
    </TransactionModalTemplate>
  );
}
