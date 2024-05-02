import {
  Flex,
  IconButton,
  PopoverTrigger,
  Text,
  useToast,
  Image,
  Popover,
  PopoverArrow,
  PopoverContent,
  Button,
  Box,
  Step,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
} from "@chakra-ui/react";
import { AblyChannelPromise } from "../../../../constants";
import { useVersusTempTokenContext } from "../../../../hooks/context/useVersusTempToken";
import { VersusTempTokenTimerView } from "../../temp/TempTokenTimer";
import { useWindowSize } from "../../../../hooks/internal/useWindowSize";
import { useChannelContext } from "../../../../hooks/context/useChannel";
import { VersusTempTokenChart } from "./VersusTempTokenChart";
import { useEffect, useState } from "react";
import { VersusTokenCreationModal } from "../../versus/VersusTokenCreationModal";
import { VersusTokenDisclaimerModal } from "../../versus/VersusTokenDisclaimerModal";
import { isAddress, isAddressEqual } from "viem";
import { VersusTokenGameFinishedModal } from "../../versus/VersusTokenGameFinishedModal";
import { TransferLiquidityModule } from "./TransferLiquidityModule";
import { PermamintModule } from "./PermamintModule";
import centerEllipses from "../../../../utils/centerEllipses";
import copy from "copy-to-clipboard";
import { FaRegCopy } from "react-icons/fa";

const steps = [
  { title: "streamer must make winner token tradeable" },
  {
    title: "streamer must pump winner token",
  },
];

export const VersusTempTokensInterface = ({
  customHeight,
  isFullChart,
  ablyChannel,
  customLoading,
  noChannelData,
}: {
  customHeight?: string;
  isFullChart?: boolean;
  ablyChannel?: AblyChannelPromise;
  customLoading?: boolean;
  noChannelData?: boolean;
}) => {
  const { channel } = useChannelContext();
  const { channelQueryData, isOwner, realTimeChannelDetails } = channel;

  const { gameState } = useVersusTempTokenContext();
  const {
    winningToken,
    canPlayToken,
    isGameOngoing,
    focusedTokenToTrade,
    ownerMustPermamint,
    ownerMustMakeWinningTokenTradeable,
    isGameFinishedModalOpen,
    tokenA,
    tokenB,
    handleCanPlayToken,
    handleFocusedTokenToTrade,
    handleIsGameFinishedModalOpen,
  } = gameState;

  const windowSize = useWindowSize();
  const toast = useToast();

  const [createTokensModalOpen, setCreateTokensModalOpen] = useState(false);
  const [
    versusTempTokenDisclaimerModalOpen,
    setVersusTempTokenDisclaimerModalOpen,
  ] = useState<boolean>(false);

  const openTokenPopout = () => {
    if (!channelQueryData) return;
    const windowFeatures = `width=${windowSize[0] + 100},height=${
      windowSize[1] + 100
    },menubar=yes,toolbar=yes`;
    window.open(
      `${window.location.origin}/token/${channelQueryData?.slug}`,
      "_blank",
      windowFeatures
    );
  };

  useEffect(() => {
    if (isAddress(winningToken.address))
      handleFocusedTokenToTrade(winningToken.contractData);
  }, [winningToken]);

  const handleCopyAddress = () => {
    toast({
      title: "copied token address",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <>
      <Flex
        direction={"column"}
        justifyContent={"space-between"}
        width="100%"
        gap={"5px"}
        h={customHeight ?? "100%"}
      >
        <VersusTokenCreationModal
          title={"Create Tokens"}
          isOpen={createTokensModalOpen}
          handleClose={() => setCreateTokensModalOpen(false)}
        />
        <VersusTokenDisclaimerModal
          isOpen={versusTempTokenDisclaimerModalOpen}
          handleClose={() => setVersusTempTokenDisclaimerModalOpen(false)}
        />
        <VersusTokenGameFinishedModal
          title={"Time's up"}
          isOpen={isGameFinishedModalOpen && isAddress(winningToken.address)}
          handleClose={() => handleIsGameFinishedModalOpen(false)}
        />
        <Flex justifyContent={"space-between"} alignItems={"center"}>
          {!canPlayToken && (
            <Flex direction={"column"}>
              {isAddress(winningToken.address) && isAddress(tokenA.address) ? (
                <>
                  <Text
                    fontSize={"20px"}
                    color={
                      isAddressEqual(
                        winningToken.address,
                        tokenA.address as `0x${string}`
                      )
                        ? "rgba(255, 36, 36, 1)"
                        : "rgba(42, 217, 255, 1)"
                    }
                    fontWeight="bold"
                  >
                    ${winningToken.symbol}
                  </Text>
                  <Flex alignItems="center">
                    <Text
                      fontSize={"10px"}
                      color={
                        isAddressEqual(
                          winningToken.address,
                          tokenA.address as `0x${string}`
                        )
                          ? "rgba(255, 36, 36, 1)"
                          : "rgba(42, 217, 255, 1)"
                      }
                    >
                      {centerEllipses(winningToken.address, 13)}
                    </Text>
                    <IconButton
                      aria-label={`copy-${winningToken.address}`}
                      color="#b5b5b5"
                      icon={<FaRegCopy />}
                      height="10px"
                      minWidth={"10px"}
                      bg="transparent"
                      _focus={{}}
                      _active={{}}
                      _hover={{
                        color: "white",
                      }}
                      onClick={() => {
                        copy(winningToken.address);
                        handleCopyAddress();
                      }}
                    />
                  </Flex>
                </>
              ) : (
                <Text fontWeight="bold" fontSize={"20px"}>
                  <Text as="span" color="rgba(255, 36, 36, 1)">
                    ${tokenA.symbol}
                  </Text>{" "}
                  VS{" "}
                  <Text as="span" color="rgba(42, 217, 255, 1)">
                    ${tokenB.symbol}
                  </Text>
                </Text>
              )}
            </Flex>
          )}
          {isOwner && (
            <>
              {!isGameOngoing &&
                !ownerMustPermamint &&
                !ownerMustMakeWinningTokenTradeable && (
                  <Button
                    onClick={() => setCreateTokensModalOpen(true)}
                    h="20px"
                  >
                    Create tokens
                  </Button>
                )}
              {!isGameOngoing && ownerMustMakeWinningTokenTradeable && (
                <TransferLiquidityModule />
              )}
              {!isGameOngoing && ownerMustPermamint && <PermamintModule />}
            </>
          )}
          {isFullChart && <VersusTempTokenTimerView disableChatbot={true} />}
          {!isFullChart && (
            <Flex>
              {canPlayToken && (
                <Popover trigger="hover" placement="top" openDelay={500}>
                  <PopoverTrigger>
                    <IconButton
                      aria-label="close"
                      _focus={{}}
                      _hover={{ transform: "scale(1.15)" }}
                      _active={{ transform: "scale(1.3)" }}
                      bg="transparent"
                      icon={
                        <Image alt="close" src="/svg/close.svg" width="20px" />
                      }
                      onClick={() => {
                        handleCanPlayToken(false);
                      }}
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    bg="#8d3b00"
                    border="none"
                    width="100%"
                    p="2px"
                  >
                    <PopoverArrow bg="#8d3b00" />
                    <Text fontSize="12px" textAlign={"center"}>
                      stop playing
                    </Text>
                  </PopoverContent>
                </Popover>
              )}
              <Popover trigger="hover" placement="top" openDelay={500}>
                <PopoverTrigger>
                  <IconButton
                    onClick={openTokenPopout}
                    aria-label="token-popout"
                    _focus={{}}
                    _hover={{ transform: "scale(1.15)" }}
                    _active={{ transform: "scale(1.3)" }}
                    icon={<Image src="/svg/pop-out.svg" height={"20px"} />}
                    bg="transparent"
                    minWidth="auto"
                  />
                </PopoverTrigger>
                <PopoverContent bg="#008d75" border="none" width="100%" p="2px">
                  <PopoverArrow bg="#008d75" />
                  <Text fontSize="12px" textAlign={"center"}>
                    pop out chart in a new window!
                  </Text>
                </PopoverContent>
              </Popover>
            </Flex>
          )}
        </Flex>
        {canPlayToken && (
          <Flex justifyContent={"center"} gap="5px">
            <Button
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg={
                focusedTokenToTrade === undefined ||
                isAddressEqual(
                  focusedTokenToTrade?.address as `0x${string}`,
                  tokenA.address as `0x${string}`
                )
                  ? "rgba(255, 36, 36, 1)"
                  : "#ffffff"
              }
              onClick={() => handleFocusedTokenToTrade(tokenA.contractData)}
            >
              ${tokenA.symbol}
            </Button>
            <Button
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg={
                focusedTokenToTrade === undefined ||
                isAddressEqual(
                  focusedTokenToTrade?.address as `0x${string}`,
                  tokenB.address as `0x${string}`
                )
                  ? "rgba(42, 217, 255, 1)"
                  : "#ffffff"
              }
              onClick={() => handleFocusedTokenToTrade(tokenB.contractData)}
            >
              ${tokenB.symbol}
            </Button>
          </Flex>
        )}
        <Flex flex="1" direction={"column"}>
          <VersusTempTokenChart noChannelData={noChannelData} />
          {!canPlayToken &&
            isGameOngoing &&
            realTimeChannelDetails.isLive &&
            !ownerMustPermamint &&
            !ownerMustMakeWinningTokenTradeable && (
              <Button
                onClick={() => setVersusTempTokenDisclaimerModalOpen(true)}
                h="30%"
              >
                Play
              </Button>
            )}
        </Flex>
      </Flex>
      {!realTimeChannelDetails.isLive && isGameOngoing && (
        <Text>
          Cannot play when stream is offline, please refresh and try again
        </Text>
      )}
      {(ownerMustMakeWinningTokenTradeable || ownerMustPermamint) && (
        <Stepper
          orientation="vertical"
          index={
            ownerMustPermamint ? 1 : ownerMustMakeWinningTokenTradeable ? 0 : 0
          }
        >
          {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>

              <Box>
                <StepTitle>
                  <Text fontFamily="LoRes15">{step.title}</Text>
                </StepTitle>
              </Box>

              <StepSeparator />
            </Step>
          ))}
        </Stepper>
      )}
    </>
  );
};
