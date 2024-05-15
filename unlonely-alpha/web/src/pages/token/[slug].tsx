import { Button, Flex } from "@chakra-ui/react";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import {
  ChannelProvider,
  useChannelContext,
} from "../../hooks/context/useChannel";
import { useChat } from "../../hooks/chat/useChat";
import AppLayout from "../../components/layout/AppLayout";
import { ChannelStaticQuery } from "../../generated/graphql";
import { CHANNEL_STATIC_QUERY } from "../../constants/queries";
import { TempTokenInterface } from "../../components/channels/temp/TempTokenInterface";
import {
  TempTokenProvider,
  useTempTokenContext,
} from "../../hooks/context/useTempToken";
import {
  VersusTempTokenProvider,
  useVersusTempTokenContext,
} from "../../hooks/context/useVersusTempToken";
import { VersusTempTokensInterface } from "../../components/channels/layout/versus/VersusTempTokensInterface";
// import { CAN_USE_VERSUS_MODE_SLUGS } from "../../constants";
import { useTempTokenAblyInterpreter } from "../../hooks/internal/temp-token/ui/useTempTokenAblyInterpreter";
import { useVersusTempTokenAblyInterpreter } from "../../hooks/internal/versus-token/ui/useVersusTempTokenAblyInterpreter";
import { NULL_ADDRESS } from "../../constants";
import { calculateMaxWinnerTokensToMint } from "../../utils/calculateMaxWinnerTokensToMint";

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
  const { channelQueryData, handleChannelStaticData } = channel;
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
    <>
      {/* {CAN_USE_VERSUS_MODE_SLUGS.includes(channelQueryData?.slug ?? "") ? (
        <VersusTempTokenProvider>
          <FullVersusTokenChart
            channelStaticError={channelStaticError}
            channelStaticLoading={channelStaticLoading}
          />
        </VersusTempTokenProvider>
      ) : ( */}
      <TempTokenProvider>
        <VersusTempTokenProvider>
          <FullTempTokenChart
            channelStaticError={channelStaticError}
            channelStaticLoading={channelStaticLoading}
          />
        </VersusTempTokenProvider>
      </TempTokenProvider>
      {/* )} */}
    </>
  );
};

const FullVersusTokenChart = ({
  channelStaticError,
  channelStaticLoading,
}: {
  channelStaticError?: any;
  channelStaticLoading?: boolean;
}) => {
  const chat = useChat();
  useVersusTempTokenAblyInterpreter(chat);

  return (
    <Flex h="100vh" justifyContent={"space-between"} bg="#131323" p="0.5rem">
      <VersusTempTokensInterface
        isFullChart
        ablyChannel={chat.channel}
        customLoading={channelStaticLoading}
        noChannelData={channelStaticError !== undefined}
      />
    </Flex>
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

  const { gameState, loadingCurrentOnMount, loadingLastOnMount } = tempToken;
  const { currentActiveTokenAddress, lastInactiveTokenAddress } = gameState;
  const { gameState: versusGameState, loadingOnMount } =
    useVersusTempTokenContext();
  const {
    isGameOngoing: isVersusGameOngoing,
    losingToken: losingVersusToken,
    winningToken: winningVersusToken,
    ownerMustPermamint,
    ownerMustMakeWinningTokenTradeable,
    handleOwnerMustPermamint,
  } = versusGameState;

  useTempTokenAblyInterpreter(chat);
  useVersusTempTokenAblyInterpreter(chat);

  const [ownerTokenStateView, setOwnerTokenStateView] = useState<
    "single" | "versus"
  >("versus");

  const isVersusOnGoing = useMemo(() => {
    return (
      (isVersusGameOngoing ||
        (typeof ownerMustPermamint === "number" && ownerMustPermamint > 0) ||
        ownerMustMakeWinningTokenTradeable) &&
      !loadingOnMount
    );
  }, [
    isVersusGameOngoing,
    ownerMustPermamint,
    ownerMustMakeWinningTokenTradeable,
    loadingOnMount,
  ]);

  const isSingleOnGoing = useMemo(() => {
    return (
      !loadingCurrentOnMount &&
      (!loadingLastOnMount || !isOwner) &&
      (currentActiveTokenAddress !== NULL_ADDRESS ||
        lastInactiveTokenAddress !== NULL_ADDRESS)
    );
  }, [
    loadingCurrentOnMount,
    loadingLastOnMount,
    currentActiveTokenAddress,
    lastInactiveTokenAddress,
    isOwner,
  ]);

  const isGameOngoing = useMemo(() => {
    return isVersusOnGoing || isSingleOnGoing;
  }, [isVersusOnGoing, isSingleOnGoing]);

  useEffect(() => {
    if (isVersusOnGoing || !isGameOngoing) {
      setOwnerTokenStateView("versus");
    }
  }, [isVersusOnGoing, isGameOngoing]);

  useEffect(() => {
    if (isSingleOnGoing) {
      setOwnerTokenStateView("single");
    }
  }, [isSingleOnGoing]);

  useEffect(() => {
    const init = async () => {
      if (
        isOwner &&
        losingVersusToken?.transferredLiquidityOnExpiration &&
        winningVersusToken?.totalSupply
      ) {
        if (ownerMustPermamint === true) {
          const { maxNumTokens } = await calculateMaxWinnerTokensToMint(
            Number(losingVersusToken?.transferredLiquidityOnExpiration),
            Number(winningVersusToken?.totalSupply)
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
      {ownerTokenStateView === "single" ? (
        <Flex direction="column" width="100%">
          {isOwner && !isGameOngoing && (
            <Button
              w="fit-content"
              h="20px"
              onClick={() => {
                setOwnerTokenStateView("versus");
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
                setOwnerTokenStateView("single");
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
