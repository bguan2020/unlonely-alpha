import {
  Flex,
  IconButton,
  PopoverTrigger,
  Text,
  Image,
  Popover,
  PopoverArrow,
  PopoverContent,
  Button,
} from "@chakra-ui/react";
import { AblyChannelPromise } from "../../../../constants";
import { useVersusTempTokenContext } from "../../../../hooks/context/useVersusTempToken";
import { VersusTempTokenTimerView } from "../../temp/TempTokenTimer";
import { useWindowSize } from "../../../../hooks/internal/useWindowSize";
import { useChannelContext } from "../../../../hooks/context/useChannel";
import { VersusTempTokenChart } from "./VersusTempTokenChart";
import { useState } from "react";
import { VersusTokenCreationModal } from "../../versus/VersusTokenCreationModal";
import { VersusTokenDisclaimerModal } from "../../versus/VersusTokenDisclaimerModal";
import { VersusTokenExchange } from "../../versus/VersusTokenExchange";
import { isAddressEqual } from "viem";
import { VersusTokenGameFinishedModal } from "../../versus/VersusTokenGameFinishedModal";
import { TransferLiquidityModule } from "./TransferLiquidityModule";
import { PermamintModule } from "./PermamintModule";

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
  const { channelQueryData, isOwner } = channel;

  const { gameState } = useVersusTempTokenContext();
  const {
    canPlayToken,
    isGameOngoing,
    focusedTokenToTrade,
    ownerMustPermamint,
    ownerMustTransferFunds,
    isGameFinishedModalOpen,
    tokenA,
    tokenB,
    handleCanPlayToken,
    handleFocusedTokenToTrade,
    handleIsGameFinishedModalOpen,
  } = gameState;
  const windowSize = useWindowSize();

  console.log(
    "isGameOngoing",
    isGameOngoing,
    ownerMustTransferFunds,
    ownerMustPermamint
  );

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

  return (
    <>
      <Flex
        direction="column"
        justifyContent={"space-between"}
        width="100%"
        p={"10px"}
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
          title={"Game Finished"}
          isOpen={isGameFinishedModalOpen}
          handleClose={() => handleIsGameFinishedModalOpen(false)}
        />
        <Flex justifyContent={"space-between"} alignItems={"center"}>
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
        <VersusTempTokenChart noChannelData={noChannelData} />
        {!canPlayToken && (
          <>
            {isOwner ? (
              <>
                {isGameOngoing &&
                  !ownerMustPermamint &&
                  !ownerMustTransferFunds && (
                    <Button
                      onClick={() =>
                        setVersusTempTokenDisclaimerModalOpen(true)
                      }
                      h="30%"
                    >
                      Play
                    </Button>
                  )}
                {!isGameOngoing &&
                  !ownerMustPermamint &&
                  !ownerMustTransferFunds && (
                    <Button
                      onClick={() => setCreateTokensModalOpen(true)}
                      h="30%"
                    >
                      Create tokens
                    </Button>
                  )}
                {!isGameOngoing && ownerMustTransferFunds && (
                  <TransferLiquidityModule />
                )}
                {!isGameOngoing && ownerMustPermamint && <PermamintModule />}
              </>
            ) : (
              <>
                {isGameOngoing && (
                  <Button
                    onClick={() => setVersusTempTokenDisclaimerModalOpen(true)}
                    h="30%"
                  >
                    Play
                  </Button>
                )}
              </>
            )}
          </>
        )}
        {canPlayToken && <VersusTokenExchange />}
      </Flex>
    </>
  );
};
