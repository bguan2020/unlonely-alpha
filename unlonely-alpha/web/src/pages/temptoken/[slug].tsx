import { Button, Flex, Text } from "@chakra-ui/react";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect } from "react";

import {
  ChannelProvider,
  useChannelContext,
} from "../../hooks/context/useChannel";
import { useChat } from "../../hooks/chat/useChat";
import AppLayout from "../../components/layout/AppLayout";
import { ChannelStaticQuery } from "../../generated/graphql";
import { CHANNEL_STATIC_QUERY } from "../../constants/queries";
import { TempTokenInterface } from "../../components/channels/layout/temptoken/TempTokenInterface";
import {
  TempTokenProvider,
  useTempTokenContext,
} from "../../hooks/context/useTempToken";
import {
  VersusTempTokenProvider,
  useVersusTempTokenContext,
} from "../../hooks/context/useVersusTempToken";
import { VersusTempTokensInterface } from "../../components/channels/layout/versus/VersusTempTokensInterface";
import { useTempTokenAblyInterpreter } from "../../hooks/internal/temp-token/ui/useTempTokenAblyInterpreter";
import { useVersusTempTokenAblyInterpreter } from "../../hooks/internal/versus-token/ui/useVersusTempTokenAblyInterpreter";
import { calculateMaxWinnerTokensToMint } from "../../utils/calculateMaxWinnerTokensToMint";
import { useIsGameOngoing } from "../../hooks/internal/temp-token/ui/useIsGameOngoing";
import { TransactionModalTemplate } from "../../components/transactions/TransactionModalTemplate";

const FullTempTokenChartPage = () => {
  return (
    <AppLayout isCustomHeader={false} noHeader>
      <ChannelProvider>
        <ChannelLayer />
      </ChannelProvider>
    </AppLayout>
  );
};

const ChannelLayer = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { channel } = useChannelContext();
  const { handleChannelStaticData } = channel;
  const {
    data: channelStatic,
    error: channelStaticError,
    loading: channelStaticLoading,
  } = useQuery<ChannelStaticQuery>(CHANNEL_STATIC_QUERY, {
    variables: { slug },
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (channelStatic)
      handleChannelStaticData(
        (channelStatic["getChannelBySlug"] as any) ?? null
      );
  }, [channelStatic]);

  return (
    <TempTokenProvider>
      <VersusTempTokenProvider>
        <FullTempTokenChart
          channelStaticError={channelStaticError}
          channelStaticLoading={channelStaticLoading}
        />
      </VersusTempTokenProvider>
    </TempTokenProvider>
  );
};

const FullTempTokenChart = ({
  channelStaticError,
  channelStaticLoading,
}: {
  channelStaticError?: any;
  channelStaticLoading?: boolean;
}) => {
  const chat = useChat();
  const { channel } = useChannelContext();
  const { isOwner } = channel;

  const { tempToken } = useTempTokenContext();
  const { gameState } = tempToken;
  const { isFailedGameModalOpen, handleIsFailedGameModalOpen } = gameState;
  const { gameState: versusGameState } = useVersusTempTokenContext();
  const {
    losingToken: losingVersusToken,
    winningToken: winningVersusToken,
    ownerMustPermamint,
    handleOwnerMustPermamint,
  } = versusGameState;

  useTempTokenAblyInterpreter(chat);
  useVersusTempTokenAblyInterpreter(chat);
  const { isGameOngoing, tokenStateView, setTokenStateView } =
    useIsGameOngoing();

  useEffect(() => {
    const init = async () => {
      if (
        isOwner &&
        losingVersusToken.transferredLiquidityOnExpiration > BigInt(0)
      ) {
        if (ownerMustPermamint === true) {
          const { maxNumTokens } = await calculateMaxWinnerTokensToMint(
            Number(losingVersusToken.transferredLiquidityOnExpiration),
            Number(winningVersusToken.totalSupply)
          );
          if (maxNumTokens === 0) {
            handleOwnerMustPermamint(false);
          } else {
            handleOwnerMustPermamint(maxNumTokens);
          }
        }
      } else {
        handleOwnerMustPermamint(false);
      }
    };
    init();
  }, [losingVersusToken, ownerMustPermamint, isOwner, winningVersusToken]);

  return (
    <Flex h="100vh" justifyContent={"space-between"} bg="#131323" p="0.5rem">
      {tokenStateView === "single" ? (
        <Flex direction="column" width="100%">
          <TransactionModalTemplate
            title="Token didn't make it this time :("
            isOpen={isFailedGameModalOpen}
            handleClose={() => handleIsFailedGameModalOpen(false)}
            bg={"#18162F"}
            hideFooter
          >
            <Text>
              {
                "This token couldn't reach the price goal. All remaining liquidity will be sent to the streamer. Better luck next time!"
              }
            </Text>
            <Flex justifyContent={"space-evenly"} gap="5px" my="15px" p={4}>
              <Button
                onClick={() => {
                  handleIsFailedGameModalOpen(false);
                }}
              >
                Continue
              </Button>
            </Flex>
          </TransactionModalTemplate>
          {isOwner && !isGameOngoing && (
            <Button
              w="fit-content"
              h="20px"
              onClick={() => {
                setTokenStateView("versus");
              }}
            >
              versus
            </Button>
          )}
          <TempTokenInterface
            isFullChart
            ablyChannel={chat.channel}
            customLoading={channelStaticLoading}
            noChannelData={channelStaticError !== undefined}
          />
        </Flex>
      ) : (
        <Flex direction="column" width="100%">
          {isOwner && !isGameOngoing && (
            <Button
              w="fit-content"
              h="20px"
              onClick={() => {
                setTokenStateView("single");
              }}
            >
              single
            </Button>
          )}
          <VersusTempTokensInterface
            isFullChart
            ablyChannel={chat.channel}
            customLoading={channelStaticLoading}
            noChannelData={channelStaticError !== undefined}
          />
        </Flex>
      )}
    </Flex>
  );
};

export default FullTempTokenChartPage;
