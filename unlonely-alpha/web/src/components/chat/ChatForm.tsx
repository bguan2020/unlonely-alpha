import {
  Flex,
  Textarea,
  Stack,
  IconButton,
  Image,
  useToast,
  Box,
  Spinner,
  Text,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
} from "@chakra-ui/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { parseUnits } from "viem";
import copy from "copy-to-clipboard";

import {
  CommandData,
  InteractionType,
  USER_APPROVAL_AMOUNT,
} from "../../constants";
import Commands from "./Commands";
import { EmojiType } from "../../constants/types/chat";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useUser } from "../../hooks/context/useUser";
import EmojiButton from "./emoji/EmojiButton";
import { useApproval } from "../../hooks/contracts/useApproval";
import { getContractFromNetwork } from "../../utils/contract";
import CreatorTokenAbi from "../../constants/abi/CreatorToken.json";
import { formatIncompleteNumber } from "../../utils/validation/input";
import { useUseFeature } from "../../hooks/contracts/useArcadeContract";
import centerEllipses from "../../utils/centerEllipses";
import ConnectWallet from "../navigation/ConnectWallet";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { ChatClip } from "./ChatClip";
import { useNetworkContext } from "../../hooks/context/useNetwork";

type Props = {
  sendChatMessage: (message: string, isGif: boolean, body?: string) => void;
  inputBox: HTMLTextAreaElement | null;
  mobile?: boolean;
  additionalChatCommands?: CommandData[];
  allowPopout?: boolean;
};

const PRICE = "2";

const ChatForm = ({
  sendChatMessage,
  inputBox,
  mobile,
  additionalChatCommands,
  allowPopout,
}: Props) => {
  const { user, walletIsConnected, userAddress: address } = useUser();
  const { isStandalone } = useUserAgent();
  const { network } = useNetworkContext();
  const { matchingChain, localNetwork, explorerUrl } = network;

  const toast = useToast();
  const { channel: channelContext, token, chat, arcade } = useChannelContext();
  const { clipping } = chat;
  const { addToChatbot } = arcade;
  const { handleIsClipUiOpen, loading: clipLoading } = clipping;

  const { channelQueryData } = channelContext;
  const { userTokenBalance, refetchUserTokenBalance } = token;

  const [messageText, setMessageText] = useState<string>("");
  const [commandsOpen, setCommandsOpen] = useState(false);
  const [txTransition, setTxTransition] = useState(false);
  const [error, setError] = useState<string>("");
  const [tooltipError, setTooltipError] = useState<string>("");
  const [gifInTransaction, setGifInTransaction] = useState<string>("");
  const transitioningTxFromApprovalToExec = useRef(false);

  const [blastMode, setBlastMode] = useState(false);

  const contract = getContractFromNetwork("unlonelyArcade", localNetwork);

  const {
    requiresApproval,
    writeApproval,
    isTxLoading: isApprovalLoading,
    isTxSuccess: isApprovalSuccess,
    refetchAllowance,
  } = useApproval(
    channelQueryData?.token?.address as `0x${string}`,
    CreatorTokenAbi,
    user?.address as `0x${string}`,
    contract?.address as `0x${string}`,
    contract?.chainId as number,
    parseUnits(PRICE as `${number}`, 18),
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
        useFeature?.();
        refetchAllowance();
      },
    }
  );

  const tokenAmount_bigint = useMemo(
    () =>
      requiresApproval
        ? BigInt(0)
        : parseUnits(formatIncompleteNumber(PRICE) as `${number}`, 18),
    [requiresApproval]
  );

  const { useFeature, useFeatureTxLoading } = useUseFeature(
    {
      creatorTokenAddress: channelQueryData?.token?.address as `0x${string}`,
      featurePrice: tokenAmount_bigint,
    },
    contract,
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
                useFeature pending, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        setTxTransition(false);
      },
      onWriteError: (error) => {
        toast({
          duration: 9000,
          isClosable: true,
          position: "top-right",
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              useFeature cancelled
            </Box>
          ),
        });
        setTxTransition(false);
        setError(error);
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
        sendChatMessage(
          gifInTransaction !== ""
            ? gifInTransaction
            : messageText.replace(/^\s*\n|\n\s*$/g, ""),
          gifInTransaction !== "",
          `${InteractionType.BLAST}:`
        );
        setGifInTransaction("");
        setTxTransition(false);
        setBlastMode(false);
        refetchUserTokenBalance?.();
        refetchAllowance();
        setMessageText("");
      },
      onTxError: (error) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              useFeature error
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
        setBlastMode(false);
        setGifInTransaction("");
        setTxTransition(false);
        setError(error);
      },
    }
  );

  const txLoading = useMemo(() => {
    return isApprovalLoading || useFeatureTxLoading;
  }, [isApprovalLoading, useFeatureTxLoading]);

  const messageTextIsEmpty =
    messageText.trim().length === 0 || messageText.trim() === "";

  const addEmoji = (emoji: EmojiType) => {
    setMessageText(`${messageText}${emoji.unicodeString}`);
  };

  const sendGif = (gif: string) => {
    if (!blastMode) {
      sendChatMessage(gif, true);
      setMessageText("");
    } else {
      if (channelQueryData?.token?.address) {
        if (tooltipError !== "") return;
        setTxTransition(true);
        setGifInTransaction(gif);
        if (requiresApproval && writeApproval) {
          writeApproval();
        } else {
          useFeature?.();
        }
      } else {
        sendChatMessage(gif, true, `${InteractionType.BLAST}:`);
        setBlastMode(false);
      }
    }
  };

  const handleKeyPress = useCallback(
    async (event: any) => {
      if (event.charCode !== 13 || messageTextIsEmpty) {
        if (event.charCode === 33) {
          setCommandsOpen(true);
        }
        return;
      }
      if (event.charCode === 13) {
        setCommandsOpen(false);
      }
      event.preventDefault();
      if (!blastMode) {
        sendChatMessage(messageText.replace(/^\s*\n|\n\s*$/g, ""), false);
        setMessageText("");
      } else {
        if (channelQueryData?.token?.address) {
          if (tooltipError !== "") return;
          setTxTransition(true);
          setGifInTransaction("");
          if (requiresApproval && writeApproval) {
            writeApproval();
          } else {
            useFeature?.();
          }
        } else {
          sendChatMessage(
            messageText.replace(/^\s*\n|\n\s*$/g, ""),
            false,
            `${InteractionType.BLAST}:`
          );
          setBlastMode(false);
          setMessageText("");
        }
      }
    },
    [
      blastMode,
      messageText,
      requiresApproval,
      writeApproval,
      useFeature,
      messageTextIsEmpty,
      tooltipError,
    ]
  );

  const handleFormSubmission = useCallback(
    async (event: { preventDefault: () => void }) => {
      event.preventDefault();
      if (!blastMode) {
        sendChatMessage(messageText.replace(/^\s*\n|\n\s*$/g, ""), false);
        setMessageText("");
      } else {
        if (channelQueryData?.token?.address) {
          setTxTransition(true);
          setGifInTransaction("");
          if (requiresApproval && writeApproval) {
            writeApproval();
          } else {
            useFeature?.();
          }
        } else {
          sendChatMessage(
            messageText.replace(/^\s*\n|\n\s*$/g, ""),
            false,
            `${InteractionType.BLAST}:`
          );
          setBlastMode(false);
          setMessageText("");
        }
      }
    },
    [blastMode, messageText, requiresApproval, writeApproval, useFeature]
  );

  useEffect(() => {
    if (!matchingChain) {
      setTooltipError("wrong network");
    } else if (
      channelQueryData?.token?.address &&
      blastMode &&
      (!userTokenBalance?.value ||
        (userTokenBalance?.value &&
          parseUnits(PRICE, 18) > userTokenBalance?.value))
    ) {
      setTooltipError(
        `you don't have enough ${channelQueryData?.token?.symbol} to spend`
      );
    } else {
      setTooltipError("");
    }
  }, [channelQueryData, userTokenBalance?.value, blastMode, matchingChain]);

  useEffect(() => {
    if (
      isApprovalSuccess &&
      useFeature &&
      !transitioningTxFromApprovalToExec.current
    ) {
      transitioningTxFromApprovalToExec.current = true;
      useFeature();
    }
  }, [isApprovalSuccess, useFeature]);

  const toastSignIn = () => {
    toast({
      title: "Sign in first.",
      description: "Please sign into your wallet first.",
      status: "warning",
      duration: 9000,
      isClosable: true,
      position: "top",
    });
  };

  const openChatPopout = () => {
    if (!channelQueryData) return;
    const windowFeatures = "width=400,height=600,menubar=yes,toolbar=yes";
    window.open(
      `${window.location.origin}/mobile/chat/${channelQueryData?.slug}`,
      "_blank",
      windowFeatures
    );
  };

  return (
    <>
      <ChatClip />
      <form
        onSubmit={handleFormSubmission}
        className="xeedev-form-i"
        style={{
          position: "relative",
          width: "100%",
          marginBottom: isStandalone ? "15px" : undefined,
        }}
      >
        <Stack direction={"row"} spacing={"10px"}>
          {!walletIsConnected ? (
            <Flex
              justifyContent={"center"}
              direction="column"
              margin="auto"
              gap="5px"
            >
              <Text>you must sign in to chat</Text>
              <ConnectWallet />
            </Flex>
          ) : error ? (
            <Flex direction="column" gap="10px">
              <Text textAlign={"center"} color="#fa8a29">
                There was an error when trying to send your blast message
              </Text>
              <Flex gap="10px">
                <Button
                  width="100%"
                  bg="#b82929"
                  onClick={() => copy(error)}
                  _focus={{}}
                  _hover={{ background: "#f25719" }}
                >
                  copy error
                </Button>
                <Button
                  opacity={"0.5"}
                  border={"1px solid white"}
                  bg={"transparent"}
                  width="100%"
                  onClick={() => setError("")}
                  _focus={{}}
                  _hover={{ opacity: "1" }}
                  _active={{}}
                >
                  close
                </Button>
              </Flex>
            </Flex>
          ) : txLoading ? (
            <Flex direction="column" gap="20px">
              <Flex justifyContent={"center"} p="10px">
                {gifInTransaction !== "" ? (
                  <Image
                    src={gifInTransaction}
                    height="80px"
                    className="zooming-text"
                  />
                ) : (
                  <Spinner size="xl" />
                )}
              </Flex>
              <Text textAlign={"center"}>
                {isApprovalLoading
                  ? "Approving transaction, please do not exit this page..."
                  : "Executing transaction, please do not exit this page..."}
              </Text>
            </Flex>
          ) : txTransition ? (
            <Flex>
              <Text textAlign={"center"} color="#ffe120">
                Please complete the transaction in your wallet.
              </Text>
            </Flex>
          ) : (
            <>
              <Flex
                width="100%"
                position="relative"
                direction="column"
                border={blastMode ? "2px solid red" : "2px solid white"}
                px="10px"
                py="5px"
                borderRadius="12px"
                background={
                  mobile
                    ? "rgba(34, 34, 34, 0.35)"
                    : blastMode
                    ? "rgba(255, 108, 108, 0.35)"
                    : "rgba(255, 255, 255, 0.35)"
                }
              >
                {blastMode && tooltipError === "" && (
                  <Text
                    color={"#b82929"}
                    fontSize="12px"
                    position="absolute"
                    top={-5}
                    whiteSpace="nowrap"
                  >
                    chat blast mode enabled{" "}
                    {channelQueryData?.token?.symbol &&
                      `(cost: ${PRICE} $${channelQueryData?.token?.symbol})`}
                  </Text>
                )}
                {blastMode && tooltipError !== "" && (
                  <Text
                    color={"#b82929"}
                    fontSize="12px"
                    position="absolute"
                    top={-5}
                    whiteSpace="nowrap"
                  >
                    {tooltipError}
                  </Text>
                )}
                <Textarea
                  resize="none"
                  variant="unstyled"
                  maxLength={500}
                  ref={(element) => {
                    inputBox = element;
                  }}
                  value={messageText}
                  color={"white"}
                  fontWeight="medium"
                  placeholder={
                    blastMode
                      ? "blast a message to everyone watching!"
                      : "say something in chat!"
                  }
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  enterKeyHint="send"
                  onChange={(e) => {
                    if (e.target.value === "") {
                      setCommandsOpen(false);
                    }
                    setMessageText(e.target.value);
                  }}
                  onKeyPress={handleKeyPress}
                  style={{ zIndex: 0, minHeight: mobile ? "68px" : "50px" }}
                  height={"100%"}
                />
                <Flex justifyContent={"flex-end"} alignItems="center">
                  {clipLoading ? (
                    <Spinner />
                  ) : (
                    <Popover trigger="hover" placement="top" openDelay={500}>
                      <PopoverTrigger>
                        <IconButton
                          icon={<Image src="/svg/cut.svg" />}
                          aria-label="clip stream"
                          bg="transparent"
                          _focus={{}}
                          _hover={{ transform: "scale(1.15)" }}
                          _active={{ transform: "scale(1.3)" }}
                          onClick={() => {
                            if (user) {
                              handleIsClipUiOpen(true);
                              addToChatbot({
                                username: user?.username ?? "",
                                address: user?.address ?? "",
                                taskType: InteractionType.CLIP,
                                title: `${
                                  user?.username ?? centerEllipses(address, 15)
                                } has just clipped a highlight from this stream!`,
                                description: "",
                              });
                            } else {
                              toastSignIn();
                            }
                          }}
                        />
                      </PopoverTrigger>
                      <PopoverContent
                        bg="#1557c0"
                        border="none"
                        width="100%"
                        p="2px"
                      >
                        <PopoverArrow bg="#1557c0" />
                        <Text fontSize="12px" textAlign={"center"}>
                          clip the last 30 secs as an NFC!
                        </Text>
                      </PopoverContent>
                    </Popover>
                  )}
                  {allowPopout && (
                    <Popover trigger="hover" placement="top" openDelay={500}>
                      <PopoverTrigger>
                        <IconButton
                          onClick={openChatPopout}
                          aria-label="chat-popout"
                          _focus={{}}
                          _hover={{ transform: "scale(1.15)" }}
                          _active={{ transform: "scale(1.3)" }}
                          icon={<Image src="/svg/pop-out.svg" />}
                          bg="transparent"
                        />
                      </PopoverTrigger>
                      <PopoverContent
                        bg="#5d12c6"
                        border="none"
                        width="100%"
                        p="2px"
                      >
                        <PopoverArrow bg="#5d12c6" />
                        <Text fontSize="12px" textAlign={"center"}>
                          pop out chat in a new window!
                        </Text>
                      </PopoverContent>
                    </Popover>
                  )}
                  <Popover trigger="hover" placement="top" openDelay={500}>
                    <PopoverTrigger>
                      <IconButton
                        icon={<Image src="/svg/blast.svg" />}
                        aria-label="clip stream"
                        bg={blastMode ? "red" : "transparent"}
                        _focus={{}}
                        _hover={{ transform: "scale(1.15)" }}
                        _active={{ transform: "scale(1.3)" }}
                        onClick={() => {
                          if (blastMode) {
                            setBlastMode(false);
                          } else {
                            if (user) {
                              setBlastMode(true);
                            } else {
                              toastSignIn();
                            }
                          }
                        }}
                      />
                    </PopoverTrigger>
                    <PopoverContent
                      bg="#c82606"
                      border="none"
                      width="100%"
                      p="2px"
                    >
                      <PopoverArrow bg="#c82606" />
                      <Text fontSize="12px" textAlign={"center"}>
                        blast ur chat across the screen!
                      </Text>
                    </PopoverContent>
                  </Popover>
                  <EmojiButton
                    mobile={mobile}
                    onSelectEmoji={(emoji) => addEmoji(emoji)}
                    onSelectGif={(gif) => sendGif(gif)}
                  />
                  <IconButton
                    type="submit"
                    disabled={
                      messageTextIsEmpty || (tooltipError !== "" && blastMode)
                    }
                    icon={
                      blastMode ? (
                        <Image src="/svg/blast-send.svg" />
                      ) : (
                        <Image src="/svg/send.svg" />
                      )
                    }
                    aria-label="clip stream"
                    bg="transparent"
                    _focus={{}}
                    _hover={{ transform: "scale(1.15)" }}
                    _active={{ transform: "scale(1.3)" }}
                  />
                </Flex>
                <Flex
                  position="absolute"
                  zIndex={3}
                  bottom="5px"
                  left="8px"
                  pt="2px"
                  pb="1px"
                  pl="2px"
                  pr="2px"
                  borderRadius="2rem"
                >
                  <Commands
                    chat={messageText}
                    open={commandsOpen}
                    onClose={() => setCommandsOpen(false)}
                    onCommandClick={(text: string) => {
                      setMessageText(text);
                      setCommandsOpen(false);
                    }}
                    additionalChatCommands={additionalChatCommands}
                  />
                </Flex>
              </Flex>
            </>
          )}
        </Stack>
      </form>
    </>
  );
};

export default ChatForm;
