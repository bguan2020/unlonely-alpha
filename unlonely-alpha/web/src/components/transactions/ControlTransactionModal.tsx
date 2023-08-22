import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { parseUnits } from "viem";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNetwork } from "wagmi";
import Link from "next/link";

import { useUseFeature } from "../../hooks/contracts/useArcadeContract";
import { useUser } from "../../hooks/context/useUser";
import { ChatBot } from "../../constants/types";
import { formatIncompleteNumber } from "../../utils/validation/input";
import { ModalButton } from "../general/button/ModalButton";
import { TransactionModalTemplate } from "./TransactionModalTemplate";
import { postStreamInteractionTextSchema } from "../../utils/validation/validation";
import usePostStreamInteraction from "../../hooks/server/usePostStreamInteraction";
import { InteractionType, USER_APPROVAL_AMOUNT } from "../../constants";
import { PostStreamInteractionInput } from "../../generated/graphql";
import { useApproval } from "../../hooks/contracts/useApproval";
import { NETWORKS } from "../../constants/networks";
import { getContractFromNetwork } from "../../utils/contract";
import centerEllipses from "../../utils/centerEllipses";
import CreatorTokenAbi from "../../constants/abi/CreatorToken.json";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { useChannelContext } from "../../hooks/context/useChannel";
import useUserAgent from "../../hooks/internal/useUserAgent";

export default function ControlTransactionModal({
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
  callback?: any;
  handleClose: () => void;
  addToChatbot?: (chatBotMessageToAdd: ChatBot) => void;
}) {
  const { channel, token } = useChannelContext();
  const { channelQueryData } = channel;
  const { userTokenBalance, refetchUserTokenBalance } = token;
  const { isStandalone } = useUserAgent();

  const [amountOption, setAmountOption] = useState<"5">("5");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [localText, setLocalText] = useState<string>("");

  const { user, userAddress, walletIsConnected } = useUser();
  const toast = useToast();
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return (
      NETWORKS.find((n) => n.config.chainId === network.chain?.id) ??
      NETWORKS[0]
    );
  }, [network]);
  const contract = getContractFromNetwork("unlonelyArcade", localNetwork);

  const form = useForm<PostStreamInteractionInput>({
    defaultValues: {},
    resolver: yupResolver(postStreamInteractionTextSchema),
  });
  const { register, formState, handleSubmit } = form;

  const { postStreamInteraction, loading } = usePostStreamInteraction({});

  const {
    requiresApproval,
    writeApproval,
    isTxLoading: isApprovalLoading,
    refetchAllowance,
  } = useApproval(
    channelQueryData?.token?.address as `0x${string}`,
    CreatorTokenAbi,
    user?.address as `0x${string}`,
    contract?.address as `0x${string}`,
    contract?.chainId as number,
    parseUnits(amountOption, 18),
    parseUnits(USER_APPROVAL_AMOUNT, 18),
    {
      onWriteSuccess: (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#287ab0" px={4} h={8}>
              <Link
                target="_blank"
                href={`https://etherscan.io/tx/${data.hash}`}
                passHref
              >
                approve pending, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
      onTxSuccess: (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`https://etherscan.io/tx/${data.transactionHash}`}
                passHref
              >
                approve success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        refetchAllowance();
      },
    }
  );

  const tokenAmount_bigint = useMemo(
    () =>
      requiresApproval
        ? BigInt(0)
        : parseUnits(formatIncompleteNumber(amountOption) as `${number}`, 18),
    [amountOption, requiresApproval]
  );

  const { useFeature, useFeatureTxLoading } = useUseFeature(
    {
      creatorTokenAddress: channelQueryData?.token?.address as `0x${string}`,
      featurePrice: tokenAmount_bigint,
    },
    {
      onWriteSuccess: (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#287ab0" px={4} h={8}>
              <Link
                target="_blank"
                href={`https://etherscan.io/tx/${data.hash}`}
                passHref
              >
                useFeature pending, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
      onTxSuccess: (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`https://etherscan.io/tx/${data.transactionHash}`}
                passHref
              >
                useFeature success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        handleBackendSend();
        handleClose();
      },
    }
  );

  const handleBackendSend = useCallback(
    async (text?: string) => {
      postStreamInteraction({
        channelId: channelQueryData?.id,
        text: text ?? localText,
        interactionType: InteractionType.CONTROL,
      });
      callback?.(text ?? localText);
      addToChatbot?.({
        username: user?.username ?? "",
        address: user?.address ?? "",
        taskType: InteractionType.CONTROL,
        title: `${
          user?.username ?? centerEllipses(user?.address, 15)
        } bought ad space!`,
        description: localText,
      });
      refetchUserTokenBalance?.();
    },
    [localText]
  );

  const canSend = useMemo(() => {
    if (requiresApproval) return false;
    if (!userAddress) return false;
    if (!useFeature) return false;
    return true;
  }, [useFeature, userAddress, requiresApproval]);

  const masterLoading = useMemo(() => {
    return loading || (useFeatureTxLoading ?? false) || isApprovalLoading;
  }, [loading, useFeatureTxLoading, isApprovalLoading]);

  const handleSend = async () => {
    if (!useFeature || !addToChatbot) return;
    await useFeature();
  };

  const onSubmit = async (data: PostStreamInteractionInput) => {
    await handleSend();
    // await handleBackendSend();
  };

  useEffect(() => {
    if (!walletIsConnected) {
      setErrorMessage("connect wallet first");
    } else if (
      !userTokenBalance?.value ||
      (userTokenBalance?.value &&
        parseUnits(amountOption, 18) > userTokenBalance?.value)
    ) {
      setErrorMessage(
        `you don't have enough ${channelQueryData?.token?.symbol} to spend`
      );
    } else {
      setErrorMessage("");
    }
  }, [walletIsConnected, userTokenBalance, channelQueryData, amountOption]);

  return (
    <TransactionModalTemplate
      title={title}
      confirmButton="purchase"
      isOpen={isOpen}
      icon={icon}
      isModalLoading={masterLoading}
      handleClose={handleClose}
      hideFooter
      size={isStandalone ? "sm" : "md"}
    >
      <Flex direction="column" gap="16px">
        <Text textAlign={"center"} fontSize="25px" color="#BABABA">
          you own{" "}
          {`${truncateValue(userTokenBalance?.formatted ?? "0", 3)} $${
            channelQueryData?.token?.symbol
          }`}
        </Text>
        <Flex justifyContent={"space-evenly"} alignItems="center">
          <ModalButton
            width="120px"
            height="50px"
            fade={amountOption === "5" ? 1 : 0.2}
            onClick={() => setAmountOption("5")}
            pointerEvents="none"
          >
            <Text fontSize="20px">5</Text>
          </ModalButton>
          <Text color="#EBE6E6">Cover stream with text</Text>
        </Flex>
        {errorMessage && (
          <Text textAlign={"center"} color="red.400">
            {errorMessage}
          </Text>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          {amountOption === "5" && (
            <FormControl isInvalid={!!formState.errors.text}>
              <Textarea
                id="text"
                placeholder="enter text over stream"
                _placeholder={{ color: "grey" }}
                lineHeight="1.2"
                background="rgba(36, 79, 167, 0.05)"
                borderRadius="10px"
                p="15px"
                borderColor="#244FA7"
                borderWidth="1px"
                boxShadow="#F1F4F8"
                minHeight="4rem"
                fontWeight="medium"
                w="100%"
                height="200px"
                _active={{}}
                _focus={{}}
                variant="unstyled"
                {...register("text")}
                onChange={(e) => {
                  setLocalText(e.target.value);
                }}
              />
              <FormErrorMessage>
                {formState.errors.text?.message}
              </FormErrorMessage>
            </FormControl>
          )}
          <Text
            color={localText.trim().length <= 280 ? "#BABABA" : "red.300"}
            textAlign={"right"}
          >
            {localText.trim().length}/280
          </Text>
          {requiresApproval && (
            <Button
              mt="10px"
              bg="#CB520E"
              _hover={{}}
              _focus={{}}
              _active={{}}
              onClick={writeApproval}
              width="100%"
              disabled={!writeApproval}
              borderRadius="25px"
            >
              approve tokens transfer
            </Button>
          )}
          {!requiresApproval && (
            <Button
              mt="10px"
              bg="#E09025"
              _hover={{}}
              _focus={{}}
              _active={{}}
              width="100%"
              disabled={
                !canSend ||
                localText.trim().length > 280 ||
                localText.trim().length === 0
              }
              type="submit"
              borderRadius="25px"
            >
              {"purchase"}
            </Button>
          )}
        </form>
      </Flex>
    </TransactionModalTemplate>
  );
}
