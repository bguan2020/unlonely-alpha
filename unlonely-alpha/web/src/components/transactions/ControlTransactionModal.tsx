import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { parseUnits } from "viem";
import { FetchBalanceResult } from "../../constants/types";
import { useUseFeature } from "../../hooks/contracts/useArcadeContract";
import { useUser } from "../../hooks/useUser";
import { ChatBot } from "../../pages/channels/brian";
import { formatIncompleteNumber } from "../../utils/validation/input";
import { ModalButton } from "../general/button/ModalButton";
import { TransactionModalTemplate } from "./TransactionModalTemplate";
import { yupResolver } from "@hookform/resolvers/yup";
import { postStreamInteractionTextSchema } from "../../utils/validation/validation";
import usePostStreamInteraction from "../../hooks/usePostStreamInteraction";
import { InteractionType, USER_APPROVAL_AMOUNT } from "../../constants";
import {
  PostStreamInteractionInput,
  ChannelDetailQuery,
} from "../../generated/graphql";
import { useApproval } from "../../hooks/useApproval";
import { erc20ABI, useNetwork } from "wagmi";
import { NETWORKS } from "../../constants/networks";
import { getContractFromNetwork } from "../../utils/contract";

export default function ControlTransactionModal({
  title,
  isOpen,
  tokenContractAddress,
  tokenBalanceData,
  channel,
  icon,
  callback,
  handleClose,
  addToChatbot,
}: {
  title: string;
  isOpen: boolean;
  tokenContractAddress: string;
  channel: ChannelDetailQuery["getChannelBySlug"];
  tokenBalanceData?: FetchBalanceResult;
  icon?: JSX.Element;
  callback?: any;
  handleClose: () => void;
  addToChatbot?: (chatBotMessageToAdd: ChatBot) => void;
}) {
  const [amountOption, setAmountOption] = useState<"5" | "10">("5");

  const { user } = useUser();
  const toast = useToast();
  const network = useNetwork();
  const localNetwork = useMemo(() => {
    return (
      NETWORKS.find((n) => n.config.chainId === network.chain?.id) ??
      NETWORKS[1]
    );
  }, [network]);
  const contract = getContractFromNetwork("unlonelyArcade", localNetwork);

  const form = useForm<PostStreamInteractionInput>({
    defaultValues: {},
    resolver: yupResolver(postStreamInteractionTextSchema),
  });
  const { register, formState, handleSubmit, watch } = form;

  const { postStreamInteraction, loading } = usePostStreamInteraction({});

  const {
    requiresApproval,
    writeApproval,
    isTxLoading: isApprovalLoading,
    refetchAllowance,
  } = useApproval(
    tokenContractAddress as `0x${string}`,
    erc20ABI,
    user?.address as `0x${string}`,
    contract?.address as `0x${string}`,
    contract?.chainId as number,
    parseUnits(amountOption, 18),
    parseUnits(USER_APPROVAL_AMOUNT, 18),
    {
      onTxSuccess: (data) => {
        toast({
          title: "approve",
          description: "success",
          status: "success",
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        refetchAllowance();
      },
    }
  );

  const { useFeature, useFeatureTxLoading } = useUseFeature(
    {
      creatorTokenAddress: tokenContractAddress as `0x${string}`,
      featurePrice: parseUnits(
        formatIncompleteNumber(amountOption) as `${number}`,
        18
      ),
    },
    {
      onTxSuccess: (data) => {
        toast({
          title: "useFeature",
          description: "success",
          status: "success",
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        callback?.();
      },
    }
  );

  const canSend = useMemo(
    () => user !== undefined && useFeature !== undefined,
    [useFeature, user]
  );

  const masterLoading = useMemo(() => {
    return loading || (useFeatureTxLoading ?? false) || isApprovalLoading;
  }, [loading, useFeatureTxLoading, isApprovalLoading]);

  const handleSend = async () => {
    if (!useFeature) return;
    await useFeature();
    if (!addToChatbot) return;
    addToChatbot({
      username: user?.username ?? "",
      address: user?.address ?? "",
      taskType: InteractionType.CONTROL,
      title: "Control",
      description: "CONTROL",
    });
  };

  const onSubmit = async (data: PostStreamInteractionInput) => {
    await handleSend()
      .then(() => {
        postStreamInteraction({
          channelId: channel?.id,
          text: data.text,
          interactionType: InteractionType.CONTROL,
        });
      })
      .then(() => callback?.(data.text));
  };

  return (
    <TransactionModalTemplate
      title={title}
      confirmButton="purchase"
      isOpen={isOpen}
      icon={icon}
      isModalLoading={masterLoading}
      handleClose={handleClose}
      hideFooter
    >
      <Flex direction="column" gap="16px">
        <Flex justifyContent={"space-evenly"} alignItems="center">
          <ModalButton
            width="120px"
            height="50px"
            fade={amountOption === "5" ? 1 : 0.2}
            onClick={() => setAmountOption("5")}
          >
            <Text fontSize="20px">5</Text>
          </ModalButton>
          <Text color="#EBE6E6">Cover stream with text</Text>
        </Flex>
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
              />
              <FormErrorMessage>
                {formState.errors.text?.message}
              </FormErrorMessage>
            </FormControl>
          )}
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
              onClick={handleSend}
              width="100%"
              disabled={!canSend}
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
