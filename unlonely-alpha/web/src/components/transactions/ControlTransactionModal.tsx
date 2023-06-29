import {
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
import { PostStreamInteractionInput } from "../../generated/graphql";
import { useApproval } from "../../hooks/contracts/useApproval";
import { useNetwork } from "wagmi";
import { NETWORKS } from "../../constants/networks";
import { getContractFromNetwork } from "../../utils/contract";
import centerEllipses from "../../utils/centerEllipses";
import CreatorTokenAbi from "../../constants/abi/CreatorToken.json";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { useChannelContext } from "../../hooks/context/useChannel";

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
  const { channelBySlug } = channel;
  const { userTokenBalance, refetchUserTokenBalance } = token;

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
    channelBySlug?.token?.address as `0x${string}`,
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

  const tokenAmount_bigint = useMemo(
    () =>
      requiresApproval
        ? BigInt(0)
        : parseUnits(formatIncompleteNumber(amountOption) as `${number}`, 18),
    [amountOption, requiresApproval]
  );

  const { useFeature, useFeatureTxLoading } = useUseFeature(
    {
      creatorTokenAddress: channelBySlug?.token?.address as `0x${string}`,
      featurePrice: tokenAmount_bigint,
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
        console.log("useFeature tx success, text:", localText);
        handleBackendSend();
        addToChatbot?.({
          username: user?.username ?? "",
          address: user?.address ?? "",
          taskType: InteractionType.CONTROL,
          title: `${
            user?.username ?? centerEllipses(user?.address, 15)
          } bought ad space!`,
          description: localText,
        });
        handleClose();
      },
    }
  );

  const handleBackendSend = useCallback(
    async (text?: string) => {
      console.log("calling backend to send text:", text ?? localText);
      postStreamInteraction({
        channelId: channelBySlug?.id,
        text: text ?? localText,
        interactionType: InteractionType.CONTROL,
      });
      callback?.(text ?? localText);
      refetchUserTokenBalance?.();
    },
    [localText]
  );

  const canSend = useMemo(() => {
    console.log(
      "can the user execute transaction? (accountData.address is defined and useFeature is defined)",
      userAddress && useFeature,
      "accountData.address:",
      userAddress,
      "useFeature:",
      useFeature,
      "requiresApproval:",
      requiresApproval
    );
    if (requiresApproval) return false;
    if (!userAddress) return false;
    if (!useFeature) return false;
    return true;
  }, [useFeature, userAddress]);

  const masterLoading = useMemo(() => {
    return loading || (useFeatureTxLoading ?? false) || isApprovalLoading;
  }, [loading, useFeatureTxLoading, isApprovalLoading]);

  const handleSend = async () => {
    if (!useFeature || !addToChatbot) return;
    await useFeature();
  };

  const onSubmit = async (data: PostStreamInteractionInput) => {
    // await handleSend();
    await handleBackendSend();
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
        `you don't have enough ${channelBySlug?.token?.symbol} to spend`
      );
    } else {
      setErrorMessage("");
    }
  }, [walletIsConnected, userTokenBalance, channelBySlug, amountOption]);

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
        <Text textAlign={"center"} fontSize="25px" color="#BABABA">
          you own{" "}
          {`${truncateValue(userTokenBalance?.formatted ?? "0", 3)} $${
            channelBySlug?.token?.symbol
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
              // disabled={
              //   !canSend ||
              //   localText.trim().length > 280 ||
              //   localText.trim().length === 0
              // }
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
