import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Box,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { parseUnits } from "viem";
import Link from "next/link";

import { ModalButton } from "../general/button/ModalButton";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useUser } from "../../hooks/context/useUser";
import useUpdateChannelCustomButton from "../../hooks/server/useUpdateChannelCustomButton";
import {
  filteredInput,
  formatIncompleteNumber,
} from "../../utils/validation/input";
import { TransactionModalTemplate } from "./TransactionModalTemplate";
import { useUseFeature } from "../../hooks/contracts/useArcadeContract";
import { useApproval } from "../../hooks/contracts/useApproval";
import CreatorTokenAbi from "../../constants/abi/CreatorToken.json";
import { getContractFromNetwork } from "../../utils/contract";
import { InteractionType, USER_APPROVAL_AMOUNT } from "../../constants";
import centerEllipses from "../../utils/centerEllipses";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { useNetworkContext } from "../../hooks/context/useNetwork";

const CUSTOM = "custom";
const SAMPLE1 = "pushup";
const SAMPLE2 = "product review";
const SAMPLE3 = "song request";

const sampleArray = [SAMPLE1, SAMPLE2, SAMPLE3];

export default function CustomTransactionModal({
  title,
  isOpen,
  icon,
  handleClose,
}: {
  title: string;
  isOpen: boolean;
  icon?: JSX.Element;
  handleClose: () => void;
}) {
  const { isStandalone } = useUserAgent();
  const { network } = useNetworkContext();
  const { matchingChain, localNetwork, explorerUrl } = network;

  const { user, userAddress, walletIsConnected } = useUser();
  const toast = useToast();
  const contract = getContractFromNetwork("unlonelyArcade", localNetwork);
  const { channel, token, arcade } = useChannelContext();
  const { addToChatbot } = arcade;

  const { channelQueryData } = channel;
  const { userTokenBalance, refetchUserTokenBalance } = token;

  const isOwner = useMemo(
    () => user?.address === channelQueryData?.owner.address,
    [user, channelQueryData]
  );

  const [currentRequest, setCurrentRequest] = useState<string>("");
  const [currentPrice, setCurrentPrice] = useState<string>("0");

  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [newPrice, setNewPrice] = useState<string>("0");
  const [chosenRequest, setChosenRequest] = useState<string>("");
  const [customRequest, setCustomRequest] = useState<string>("");

  useEffect(() => {
    setCurrentPrice(String(channelQueryData?.customButtonPrice ?? "0"));
    setCurrentRequest(String(channelQueryData?.customButtonAction ?? ""));
    setNewPrice(String(channelQueryData?.customButtonPrice ?? "0"));
    setCustomRequest(String(channelQueryData?.customButtonAction ?? ""));
    setChosenRequest(
      sampleArray.find(
        (s) => s === String(channelQueryData?.customButtonAction ?? "")
      ) ?? CUSTOM
    );
  }, [channelQueryData]);

  const { updateChannelCustomButton, loading: updateLoading } =
    useUpdateChannelCustomButton({});

  const callChange = useCallback(() => {
    updateChannelCustomButton({
      id: channelQueryData?.id,
      customButtonPrice: Number(newPrice),
      customButtonAction:
        chosenRequest === CUSTOM ? customRequest : chosenRequest,
    });
    setIsEditing(false);
  }, [channelQueryData, newPrice, chosenRequest, customRequest]);

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
    parseUnits(currentPrice as `${number}`, 18),
    parseUnits(USER_APPROVAL_AMOUNT, 18),
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
                href={`${explorerUrl}/tx/${data.transactionHash}`}
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
        : parseUnits(formatIncompleteNumber(currentPrice) as `${number}`, 18),
    [currentPrice, requiresApproval]
  );

  const { useFeature, useFeatureTxLoading } = useUseFeature(
    {
      creatorTokenAddress: channelQueryData?.token?.address as `0x${string}`,
      featurePrice: tokenAmount_bigint,
    },
    contract,
    {
      onWriteSuccess: (data) => {
        handleClose();
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#287ab0" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.hash}`}
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
                href={`${explorerUrl}/tx/${data.transactionHash}`}
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
        addToChatbot({
          username: user?.username ?? "",
          address: user?.address ?? "",
          taskType: InteractionType.CUSTOM,
          title: `${
            user?.username ?? centerEllipses(user?.address, 15)
          } paid for ${currentRequest}!`,
          description: "",
        });
        refetchUserTokenBalance?.();
      },
    }
  );

  const canOwnerSend = useMemo(() => {
    // if not owner, can't send
    if (!isOwner) return false;
    // if new price is 0, can't send
    if (Number(formatIncompleteNumber(newPrice)) === 0) return false;
    // if empty custom request, can't send
    if (chosenRequest === CUSTOM && customRequest.length === 0) return false;
    // if custom request and custom price are unchanged, can't send
    if (
      chosenRequest === CUSTOM &&
      channelQueryData?.customButtonAction === customRequest &&
      Number(formatIncompleteNumber(newPrice)) ===
        channelQueryData?.customButtonPrice
    )
      return false;
    // if non-custom request is empty, can't send
    if (chosenRequest !== CUSTOM && chosenRequest.length === 0) return false;
    return true;
  }, [isOwner, newPrice, chosenRequest, customRequest, channelQueryData]);

  const canViewerSend = useMemo(() => {
    if (requiresApproval) return false;
    if (!userAddress) return false;
    if (!useFeature) return false;
    return true;
  }, [useFeature, userAddress, requiresApproval]);

  const determinedBg = useMemo(() => {
    const defaultBg = "#244FA7";
    const customBg = "rgb(214, 98, 20)";
    if (chosenRequest.length > 0) {
      if (chosenRequest === CUSTOM) {
        if (customRequest.length > 0) {
          return customBg;
        }
        return defaultBg;
      }
      return defaultBg;
    } else {
      if (customRequest.length > 0) {
        return customBg;
      }
      return defaultBg;
    }
  }, [chosenRequest, customRequest]);

  const _handleClose = () => {
    setIsEditing(false);
    handleClose();
  };

  useEffect(() => {
    if (!walletIsConnected) {
      setErrorMessage("connect wallet first");
    } else if (!matchingChain) {
      setErrorMessage("wrong network");
    } else if (
      !userTokenBalance?.value ||
      (userTokenBalance?.value &&
        parseUnits(currentPrice as `${number}`, 18) > userTokenBalance?.value)
    ) {
      setErrorMessage(
        `you don't have enough ${channelQueryData?.token?.symbol} to spend`
      );
    } else {
      setErrorMessage("");
    }
  }, [
    walletIsConnected,
    userTokenBalance,
    channelQueryData,
    currentPrice as `${number}`,
    matchingChain,
  ]);

  const txnLoading = useMemo(() => {
    return (useFeatureTxLoading ?? false) || isApprovalLoading;
  }, [useFeatureTxLoading, isApprovalLoading]);

  return (
    <TransactionModalTemplate
      title={title}
      confirmButton={isOwner ? "set" : "send"}
      isOpen={isOpen}
      icon={icon}
      isModalLoading={txnLoading || updateLoading}
      loadingText={updateLoading ? "updating..." : undefined}
      canSend={isOwner ? canOwnerSend : canViewerSend}
      onSend={isOwner ? callChange : useFeature}
      handleClose={_handleClose}
      hideFooter={!isEditing && isOwner}
      needsApproval={!isOwner && requiresApproval}
      approve={writeApproval}
      size={isStandalone ? "sm" : "md"}
    >
      <Flex direction={"column"} gap="16px">
        {isOwner ? (
          <>
            {isEditing && (
              <>
                <Flex gap="10px" alignItems="center">
                  <Text>action</Text>
                  <Menu>
                    <MenuButton
                      as={Button}
                      rightIcon={<ChevronDownIcon />}
                      borderWidth="3px"
                      borderRadius="25px"
                      borderColor={determinedBg}
                      bg={determinedBg}
                      _hover={{}}
                      _focus={{}}
                      _active={{}}
                    >
                      {chosenRequest ||
                        channelQueryData?.customButtonAction ||
                        "select option"}
                    </MenuButton>
                    <MenuList bg="#000" border="none">
                      {sampleArray.map((sample) => (
                        <MenuItem
                          bg={"rgb(36, 79, 167)"}
                          opacity="0.8"
                          _hover={{ opacity: "1" }}
                          _focus={{ opacity: "1" }}
                          _active={{ opacity: "1" }}
                          onClick={() => setChosenRequest(sample)}
                        >
                          {sample}
                        </MenuItem>
                      ))}
                      <MenuItem
                        bg={"rgb(214, 98, 20)"}
                        opacity="0.8"
                        _hover={{ opacity: "1" }}
                        _focus={{ opacity: "1" }}
                        _active={{ opacity: "1" }}
                        onClick={() => setChosenRequest(CUSTOM)}
                      >
                        {CUSTOM}
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
                {chosenRequest === CUSTOM && (
                  <Input
                    variant="glow"
                    placeholder='e.g. "do 10 situps"'
                    value={customRequest}
                    onChange={(e) => setCustomRequest(e.target.value)}
                  />
                )}
                <Flex gap="10px" alignItems="center">
                  <Text>price</Text>
                  <Input
                    width="100px"
                    variant="glow"
                    value={newPrice}
                    onChange={(e) =>
                      setNewPrice(filteredInput(e.target.value, false))
                    }
                  />
                </Flex>
              </>
            )}
            {!isEditing && (
              <>
                <Flex gap="10px" alignItems="center" justifyContent={"center"}>
                  <Text fontSize="30px" fontFamily={"LoRes15"}>
                    action:
                  </Text>
                  <Text fontSize="30px">{currentRequest}</Text>
                </Flex>
                <Flex gap="10px" alignItems="center" justifyContent={"center"}>
                  <Text fontSize="30px" fontFamily={"LoRes15"}>
                    price:
                  </Text>
                  <Text fontSize="30px">{currentPrice}</Text>
                </Flex>
                <ModalButton onClick={() => setIsEditing(true)}>
                  edit
                </ModalButton>
              </>
            )}
          </>
        ) : (
          <>
            {channelQueryData?.customButtonAction ? (
              <>
                <Text textAlign={"center"} fontSize="25px" color="#BABABA">
                  you own{" "}
                  {`${truncateValue(userTokenBalance?.formatted ?? "0", 3)} $${
                    channelQueryData?.token?.symbol
                  }`}
                </Text>
                <Flex gap="10px" alignItems="center" justifyContent={"center"}>
                  <Text fontSize="30px" fontFamily={"LoRes15"}>
                    action:
                  </Text>
                  <Text fontSize="30px">{currentRequest}</Text>
                </Flex>
                <Flex gap="10px" alignItems="center" justifyContent={"center"}>
                  <Text fontSize="30px" fontFamily={"LoRes15"}>
                    price:
                  </Text>
                  <Text fontSize="30px">{currentPrice}</Text>
                </Flex>
                {errorMessage && (
                  <Text textAlign={"center"} color="red.400">
                    {errorMessage}
                  </Text>
                )}
              </>
            ) : (
              <Text fontSize="20px" textAlign={"center"}>
                streamer hasn't set a custom action yet
              </Text>
            )}
          </>
        )}
      </Flex>
    </TransactionModalTemplate>
  );
}
