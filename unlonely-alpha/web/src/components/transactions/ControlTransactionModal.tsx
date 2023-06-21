import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { parseUnits } from "viem";
import { FetchBalanceResult } from "../../constants/types";
import { useUseFeature } from "../../hooks/contracts/useArcadeContract";
import { useUser } from "../../hooks/context/useUser";
import { ChatBot } from "../../constants/types";
import { formatIncompleteNumber } from "../../utils/validation/input";
import { ModalButton } from "../general/button/ModalButton";
import { TransactionModalTemplate } from "./TransactionModalTemplate";
import { yupResolver } from "@hookform/resolvers/yup";
import { postStreamInteractionTextSchema } from "../../utils/validation/validation";
import usePostStreamInteraction from "../../hooks/server/usePostStreamInteraction";
import { InteractionType, USER_APPROVAL_AMOUNT } from "../../constants";
import {
  PostStreamInteractionInput,
  ChannelDetailQuery,
} from "../../generated/graphql";
import { useApproval } from "../../hooks/contracts/useApproval";
import { useNetwork } from "wagmi";
import { NETWORKS } from "../../constants/networks";
import { getContractFromNetwork } from "../../utils/contract";
import centerEllipses from "../../utils/centerEllipses";
import CreatorTokenAbi from "../../constants/abi/CreatorToken.json";

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
  const [amountOption, setAmountOption] = useState<"5">("5");
  const [textToSend, setTextToSend] = useState<string>("");

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
    CreatorTokenAbi,
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
        handleBackendSend();
        addToChatbot?.({
          username: user?.username ?? "",
          address: user?.address ?? "",
          taskType: InteractionType.CONTROL,
          title: "Control",
          description: `${
            user?.username ?? centerEllipses(user?.address, 15)
          } bought ad space!`,
        });
      },
    }
  );

  const handleBackendSend = useCallback(async () => {
    postStreamInteraction({
      channelId: channel?.id,
      text: textToSend,
      interactionType: InteractionType.CONTROL,
    });
    callback?.(textToSend);
    setTextToSend("");
  }, [textToSend]);

  const canSend = useMemo(() => {
    if (!user) return false;
    if (!useFeature) return false;
    return true;
  }, [useFeature, user]);

  const masterLoading = useMemo(() => {
    return loading || (useFeatureTxLoading ?? false) || isApprovalLoading;
  }, [loading, useFeatureTxLoading, isApprovalLoading]);

  const handleSend = async () => {
    if (!useFeature || !addToChatbot) return;
    await useFeature();
  };

  const onSubmit = async (data: PostStreamInteractionInput) => {
    setTextToSend(String(data.text));
    await handleSend();
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
            pointerEvents="none"
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
