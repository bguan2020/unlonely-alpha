import { useRouter } from "next/router";
import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
  useCallback,
} from "react";
import { ApolloError, useLazyQuery, useQuery } from "@apollo/client";
import { useBalance } from "wagmi";

import {
  CHANNEL_DETAIL_QUERY,
  GET_GAMBLABLE_EVENT_LEADERBOARD_BY_CHANNEL_ID_QUERY,
  GET_RECENT_STREAM_INTERACTIONS_BY_CHANNEL_QUERY,
  GET_USER_TOKEN_HOLDING_QUERY,
} from "../../constants/queries";
import {
  ChannelDetailQuery,
  GetRecentStreamInteractionsQuery,
  GetGamblableEventLeaderboardByChannelIdQuery,
  SharesEventState,
} from "../../generated/graphql";
import { ChatBot, FetchBalanceResult } from "../../constants/types";
import { useUser } from "./useUser";
import { InteractionType } from "../../constants";
import { useClip } from "../chat/useClip";
import CalendarEventModal from "../../components/channels/CalendarEventModal";
import ChatCommandModal from "../../components/channels/ChatCommandModal";
import EditChannelModal from "../../components/channels/EditChannelModal";
import NotificationsModal from "../../components/channels/NotificationsModal";
import BetModal from "../../components/channels/BetModal";
import ModeratorModal from "../../components/channels/ModeratorModal";
import { useNetworkContext } from "./useNetwork";

export const useChannelContext = () => {
  return useContext(ChannelContext);
};

const ChannelContext = createContext<{
  channel: {
    channelQueryData?: ChannelDetailQuery["getChannelBySlug"];
    data?: ChannelDetailQuery;
    // mobileData?: ChannelDetailMobileQuery;
    loading: boolean;
    error?: ApolloError;
    refetch: () => Promise<any>;
  };
  recentStreamInteractions: {
    textOverVideo: string[];
    addToTextOverVideo: (message: string) => void;
    data?: GetRecentStreamInteractionsQuery;
    loading: boolean;
    error?: ApolloError;
  };
  chat: {
    chatChannel?: string;
    presenceChannel?: string;
    clipping: {
      isClipUiOpen: boolean;
      handleIsClipUiOpen: (value: boolean) => void;
      handleCreateClip: (title: string) => Promise<string | undefined>;
      submitClip: (title: string) => Promise<string | undefined>;
      setClipError: (value: string) => void;
      clipError?: string;
      clipUrl?: string;
      clipThumbnail?: string;
      loading: boolean;
    };
  };
  token: {
    userTokenBalance?: FetchBalanceResult;
    refetchUserTokenBalance?: () => void;
    ownerTokenBalance?: FetchBalanceResult;
    refetchOwnerTokenBalance?: () => void;
  };
  leaderboard: {
    isVip?: boolean;
    userRank: number;
    data?: GetGamblableEventLeaderboardByChannelIdQuery;
    loading: boolean;
    error?: ApolloError;
    refetchGamblableEventLeaderboard?: () => Promise<void>;
    handleIsVip?: (value: boolean) => void;
  };
  arcade: {
    addToChatbot: (chatBotMessageToAdd: ChatBot) => void;
    handleBuyModal: (value: boolean) => void;
    handleTipModal: (value: boolean) => void;
    handleCustomModal: (value: boolean) => void;
    handleChanceModal: (value: boolean) => void;
    handlePvpModal: (value: boolean) => void;
    handleControlModal: (value: boolean) => void;
    handleEditModal: (value: boolean) => void;
    handleNotificationsModal: (value: boolean) => void;
    handleTokenSaleModal: (value: boolean) => void;
    handleEventModal: (value: boolean) => void;
    handleChatCommandModal: (value: boolean) => void;
    handleBetModal: (value: boolean) => void;
    handleModeratorModal: (value: boolean) => void;
    showBuyModal: boolean;
    showBetModal: boolean;
    showTipModal: boolean;
    showCustomModal: boolean;
    showChanceModal: boolean;
    showPvpModal: boolean;
    showControlModal: boolean;
    showEditModal: boolean;
    showNotificationsModal: boolean;
    showTokenSaleModal: boolean;
    showEventModal: boolean;
    showChatCommandModal: boolean;
    showModeratorModal: boolean;
    chatBot: ChatBot[];
  };
}>({
  channel: {
    channelQueryData: undefined,
    data: undefined,
    loading: true,
    error: undefined,
    refetch: () => Promise.resolve(undefined),
  },
  recentStreamInteractions: {
    textOverVideo: [],
    addToTextOverVideo: () => undefined,
    data: undefined,
    loading: true,
    error: undefined,
  },
  chat: {
    chatChannel: undefined,
    presenceChannel: undefined,
    clipping: {
      isClipUiOpen: false,
      handleIsClipUiOpen: () => undefined,
      handleCreateClip: () => Promise.resolve(undefined),
      submitClip: () => Promise.resolve(undefined),
      setClipError: () => undefined,
      clipError: undefined,
      clipUrl: undefined,
      clipThumbnail: undefined,
      loading: false,
    },
  },
  token: {
    userTokenBalance: undefined,
    refetchUserTokenBalance: () => undefined,
    ownerTokenBalance: undefined,
    refetchOwnerTokenBalance: () => undefined,
  },
  leaderboard: {
    isVip: false,
    userRank: -1,
    data: undefined,
    loading: true,
    error: undefined,
    refetchGamblableEventLeaderboard: undefined,
    handleIsVip: () => undefined,
  },
  arcade: {
    addToChatbot: () => undefined,
    handleBuyModal: () => undefined,
    handleTipModal: () => undefined,
    handleCustomModal: () => undefined,
    handleChanceModal: () => undefined,
    handlePvpModal: () => undefined,
    handleControlModal: () => undefined,
    handleEditModal: () => undefined,
    handleNotificationsModal: () => undefined,
    handleTokenSaleModal: () => undefined,
    handleEventModal: () => undefined,
    handleChatCommandModal: () => undefined,
    handleBetModal: () => undefined,
    handleModeratorModal: () => undefined,
    showBuyModal: false,
    showBetModal: false,
    showTipModal: false,
    showCustomModal: false,
    showChanceModal: false,
    showPvpModal: false,
    showControlModal: false,
    showEditModal: false,
    showNotificationsModal: false,
    showTokenSaleModal: false,
    showEventModal: false,
    showChatCommandModal: false,
    showModeratorModal: false,
    chatBot: [],
  },
});

export const ChannelProvider = ({
  mobile,
  children,
}: {
  mobile?: boolean;
  children: React.ReactNode;
}) => {
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const { user, userAddress } = useUser();
  const router = useRouter();
  const { slug } = router.query;

  const {
    loading: channelDataLoading,
    error: channelDataError,
    data: channelData,
    refetch: refetchChannelData,
  } = useQuery<ChannelDetailQuery>(CHANNEL_DETAIL_QUERY, {
    variables: { slug },
    // fetchPolicy: "cache-first",
    nextFetchPolicy: "network-only",
  });

  const channelQueryData = useMemo(
    () => channelData?.getChannelBySlug,
    [channelData, mobile]
  );

  const {
    data: recentStreamInteractionsData,
    loading: recentStreamInteractionsDataLoading,
    error: recentStreamInteractionsDataError,
  } = useQuery<GetRecentStreamInteractionsQuery>(
    GET_RECENT_STREAM_INTERACTIONS_BY_CHANNEL_QUERY,
    {
      variables: {
        data: {
          channelId: channelQueryData?.id,
        },
      },
    }
  );

  const { data: userRankData } = useQuery(GET_USER_TOKEN_HOLDING_QUERY, {
    variables: {
      data: {
        tokenAddress: channelQueryData?.token?.address,
        userAddress: user?.address,
      },
    },
  });

  const userRank = useMemo(
    () =>
      channelQueryData?.token?.address ? userRankData?.getUserTokenHolding : -1,
    [userRankData]
  );

  const [
    getGamblableEventLeaderboard,
    {
      loading: leaderboardLoading,
      error: leaderboardError,
      data: leaderboardData,
    },
  ] = useLazyQuery(GET_GAMBLABLE_EVENT_LEADERBOARD_BY_CHANNEL_ID_QUERY);

  const { data: userTokenBalance, refetch: refetchUserTokenBalance } =
    useBalance({
      address: user?.address as `0x${string}`,
      token: channelQueryData?.token?.address as `0x${string}`,
    });

  const { data: ownerTokenBalance, refetch: refetchOwnerTokenBalance } =
    useBalance({
      address: channelQueryData?.owner?.address as `0x${string}`,
      token: channelQueryData?.token?.address as `0x${string}`,
    });

  const [ablyChatChannel, setAblyChatChannel] = useState<string | undefined>(
    undefined
  );
  const [ablyPresenceChannel, setAblyPresenceChannel] = useState<
    string | undefined
  >(undefined);
  const [textOverVideo, setTextOverVideo] = useState<string[]>([]);
  const [isClipUiOpen, setIsClipUiOpen] = useState<boolean>(false);
  const [isVip, setIsVip] = useState<boolean>(false);

  const handleIsClipUiOpen = useCallback((isClipUiOpen: boolean) => {
    setIsClipUiOpen(isClipUiOpen);
  }, []);

  const [chatBot, setChatBot] = useState<ChatBot[]>([]);

  const [showTipModal, setShowTipModal] = useState<boolean>(false);
  const [showChanceModal, setShowChanceModal] = useState<boolean>(false);
  const [showPvpModal, setShowPvpModal] = useState<boolean>(false);
  const [showControlModal, setShowControlModal] = useState<boolean>(false);
  const [showBuyModal, setShowBuyModal] = useState<boolean>(false);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  const [showTokenSaleModal, setTokenSaleModal] = useState<boolean>(false);
  const [showChatCommandModal, setChatCommandModal] = useState<boolean>(false);
  const [showEditModal, setEditModal] = useState<boolean>(false);
  const [showNotificationsModal, setNotificationsModal] =
    useState<boolean>(false);
  const [showEventModal, setEventModal] = useState<boolean>(false);
  const [showBetModal, setBetModal] = useState<boolean>(false);
  const [showModeratorModal, setModeratorModal] = useState<boolean>(false);

  const {
    handleCreateClip,
    submitClip,
    setClipError,
    clipError,
    clipUrl,
    clipThumbnail,
    loading,
  } = useClip(channelQueryData, handleIsClipUiOpen);

  useEffect(() => {
    if (channelQueryData && channelQueryData.awsId) {
      setAblyChatChannel(`${channelQueryData.awsId}-chat-channel`);
      setAblyPresenceChannel(`${channelQueryData.awsId}-presence-channel`);
    }
  }, [channelQueryData]);

  const handleRefetchGamblableEventLeaderboard = useCallback(async () => {
    await getGamblableEventLeaderboard({
      variables: {
        data: {
          channelId: channelQueryData?.id,
          chainId: localNetwork.config.chainId,
        },
      },
    });
  }, [channelQueryData, localNetwork.config.chainId]);

  useEffect(() => {
    if (textOverVideo.length > 0) {
      const timer = setTimeout(() => {
        setTextOverVideo((prev) => prev.slice(2));
      }, 120000);
      return () => clearTimeout(timer);
    }
  }, [textOverVideo]);

  useEffect(() => {
    if (!recentStreamInteractionsData) return;
    const interactions =
      recentStreamInteractionsData.getRecentStreamInteractionsByChannel;
    if (interactions && interactions.length > 0) {
      const textInteractions = interactions.filter(
        (i) => i?.interactionType === InteractionType.CONTROL && i.text
      );
      setTextOverVideo(textInteractions.map((i) => String(i?.text)));
    }
  }, [recentStreamInteractionsData]);

  const addToTextOverVideo = useCallback((message: string) => {
    setTextOverVideo((prev) => [...prev, message]);
  }, []);

  const addToChatbot = useCallback((chatBotMessageToAdd: ChatBot) => {
    setChatBot((prev) => [...prev, chatBotMessageToAdd]);
  }, []);

  const handleBuyModal = useCallback((value: boolean) => {
    setShowBuyModal(value);
  }, []);

  const handleTipModal = useCallback((value: boolean) => {
    setShowTipModal(value);
  }, []);

  const handleCustomModal = useCallback((value: boolean) => {
    setShowCustomModal(value);
  }, []);

  const handleChanceModal = useCallback((value: boolean) => {
    setShowChanceModal(value);
  }, []);

  const handlePvpModal = useCallback((value: boolean) => {
    setShowPvpModal(value);
  }, []);

  const handleControlModal = useCallback((value: boolean) => {
    setShowControlModal(value);
  }, []);

  const handleEditModal = useCallback((value: boolean) => {
    setEditModal(value);
  }, []);

  const handleNotificationsModal = useCallback((value: boolean) => {
    setNotificationsModal(value);
  }, []);

  const handleTokenSaleModal = useCallback((value: boolean) => {
    setTokenSaleModal(value);
  }, []);

  const handleEventModal = useCallback((value: boolean) => {
    setEventModal(value);
  }, []);

  const handleChatCommandModal = useCallback((value: boolean) => {
    setChatCommandModal(value);
  }, []);

  const handleBetModal = useCallback((value: boolean) => {
    setBetModal(value);
  }, []);

  const handleModeratorModal = useCallback((value: boolean) => {
    setModeratorModal(value);
  }, []);

  const handleIsVip = useCallback((value: boolean) => {
    setIsVip(value);
  }, []);

  const value = useMemo(
    () => ({
      channel: {
        channelQueryData,
        data: channelData,
        // mobileData: channelMobileData,
        loading: channelDataLoading,
        error: channelDataError,
        refetch: refetchChannelData,
      },
      recentStreamInteractions: {
        textOverVideo,
        addToTextOverVideo,
        data: recentStreamInteractionsData,
        loading: recentStreamInteractionsDataLoading,
        error: recentStreamInteractionsDataError,
      },
      chat: {
        chatChannel: ablyChatChannel,
        presenceChannel: ablyPresenceChannel,
        clipping: {
          isClipUiOpen,
          handleIsClipUiOpen,
          handleCreateClip,
          submitClip,
          setClipError,
          clipError: clipError ?? undefined,
          clipUrl,
          clipThumbnail,
          loading,
        },
      },
      token: {
        userTokenBalance,
        refetchUserTokenBalance,
        ownerTokenBalance,
        refetchOwnerTokenBalance,
      },
      leaderboard: {
        userRank,
        isVip,
        data: leaderboardData,
        loading: leaderboardLoading,
        error: leaderboardError,
        refetchGamblableEventLeaderboard:
          handleRefetchGamblableEventLeaderboard,
        handleIsVip,
      },
      arcade: {
        addToChatbot,
        handleBuyModal,
        handleTipModal,
        handleCustomModal,
        handleChanceModal,
        handlePvpModal,
        handleControlModal,
        handleEditModal,
        handleNotificationsModal,
        handleTokenSaleModal,
        handleEventModal,
        handleChatCommandModal,
        handleBetModal,
        handleModeratorModal,
        showBuyModal,
        showTipModal,
        showCustomModal,
        showChanceModal,
        showPvpModal,
        showControlModal,
        showEditModal,
        showNotificationsModal,
        showTokenSaleModal,
        showEventModal,
        showBetModal,
        showChatCommandModal,
        showModeratorModal,
        chatBot,
      },
    }),
    [
      channelQueryData,
      channelData,
      channelDataLoading,
      channelDataError,
      textOverVideo,
      refetchChannelData,
      addToTextOverVideo,
      recentStreamInteractionsData,
      recentStreamInteractionsDataLoading,
      recentStreamInteractionsDataError,
      ablyChatChannel,
      ablyPresenceChannel,
      userTokenBalance,
      refetchUserTokenBalance,
      ownerTokenBalance,
      refetchOwnerTokenBalance,
      userRank,
      isClipUiOpen,
      handleIsClipUiOpen,
      handleCreateClip,
      submitClip,
      setClipError,
      clipError,
      clipUrl,
      clipThumbnail,
      loading,
      userRank,
      isVip,
      leaderboardData,
      leaderboardLoading,
      leaderboardError,
      handleRefetchGamblableEventLeaderboard,
      handleIsVip,
      addToChatbot,
      handleBuyModal,
      handleTipModal,
      handleCustomModal,
      handleChanceModal,
      handlePvpModal,
      handleControlModal,
      handleEditModal,
      handleNotificationsModal,
      handleTokenSaleModal,
      handleEventModal,
      handleBetModal,
      handleModeratorModal,
      handleChatCommandModal,
      handleIsVip,
      showBuyModal,
      showTipModal,
      showCustomModal,
      showChanceModal,
      showPvpModal,
      showControlModal,
      showEditModal,
      showNotificationsModal,
      showTokenSaleModal,
      showEventModal,
      showBetModal,
      showChatCommandModal,
      showModeratorModal,
      chatBot,
    ]
  );

  return (
    <ChannelContext.Provider value={value}>
      <TransactionModals />
      {children}
    </ChannelContext.Provider>
  );
};

const TransactionModals = () => {
  const { arcade, channel } = useChannelContext();
  const { channelQueryData } = channel;

  const { userAddress } = useUser();

  const {
    handleEditModal,
    handleNotificationsModal,
    handleTokenSaleModal,
    handleEventModal,
    handleChatCommandModal,
    handleBuyModal,
    handleTipModal,
    handleCustomModal,
    handleChanceModal,
    handlePvpModal,
    handleControlModal,
    handleBetModal,
    handleModeratorModal,
    showEditModal,
    showNotificationsModal,
    showTokenSaleModal,
    showEventModal,
    showChatCommandModal,
    showCustomModal,
    showControlModal,
    showChanceModal,
    showTipModal,
    showBuyModal,
    showBetModal,
    showModeratorModal,
  } = arcade;

  const isOwner = userAddress === channelQueryData?.owner.address;
  const isSharesEventLive =
    channelQueryData?.sharesEvent?.[0]?.eventState === SharesEventState.Live;
  const isSharesEventLock =
    channelQueryData?.sharesEvent?.[0]?.eventState === SharesEventState.Lock;
  const isSharesEventPayout =
    channelQueryData?.sharesEvent?.[0]?.eventState === SharesEventState.Payout;

  const handleClose = useCallback(() => {
    handleTipModal(false);
    handleChanceModal(false);
    handlePvpModal(false);
    handleControlModal(false);
    handleBuyModal(false);
    handleCustomModal(false);
  }, []);

  return (
    <>
      <ModeratorModal
        title={"manage moderators"}
        isOpen={showModeratorModal}
        handleClose={() => handleModeratorModal(false)}
      />
      <BetModal
        title={
          isSharesEventPayout
            ? "stop event"
            : isSharesEventLive
            ? "lock bets"
            : isSharesEventLock
            ? "decide outcome"
            : "create a bet"
        }
        isOpen={showBetModal}
        handleClose={() => handleBetModal(false)}
      />
      <ChatCommandModal
        title={"custom commands"}
        isOpen={showChatCommandModal}
        handleClose={() => handleChatCommandModal(false)}
      />
      <EditChannelModal
        title={"edit title / description"}
        isOpen={showEditModal}
        handleClose={() => handleEditModal(false)}
      />
      <NotificationsModal
        title={"send notifications"}
        isOpen={showNotificationsModal}
        handleClose={() => handleNotificationsModal(false)}
      />
      <CalendarEventModal
        title={"add event"}
        isOpen={showEventModal}
        handleClose={() => handleEventModal(false)}
      />
      {/* <CustomTransactionModal
        icon={
          <Image
            alt="custom"
            src="/svg/arcade/custom.svg"
            width="60px"
            height="60px"
          />
        }
        title={isOwner ? "customize your button!" : "make streamer do X"}
        isOpen={showCustomModal}
        handleClose={handleClose}
      />
      <ControlTransactionModal
        icon={
          <Image
            alt="control"
            src="/svg/arcade/control.svg"
            width="60px"
            height="60px"
          />
        }
        title="control the stream!"
        isOpen={showControlModal}
        handleClose={handleClose}
      />
      <BuyTransactionModal
        title=""
        icon={
          <BuyButton
            tokenName={
              channelQueryData?.token?.symbol
                ? `$${channelQueryData?.token?.symbol}`
                : "token"
            }
            noHover
          />
        }
        isOpen={showBuyModal}
        handleClose={handleClose}
      />
      <TipTransactionModal
        icon={
          <Image
            alt="coin"
            src="/svg/arcade/coin.svg"
            width="60px"
            height="60px"
          />
        }
        title="tip on the stream!"
        isOpen={showTipModal}
        handleClose={handleClose}
      />
      <ChanceTransactionModal
        icon={
          <Image
            alt="dice"
            src="/svg/arcade/dice.svg"
            width="60px"
            height="60px"
          />
        }
        title="feeling lucky? roll the die for a surprise!"
        isOpen={showChanceModal}
        handleClose={handleClose}
      />
      <TokenSaleModal
        title={"offer tokens for sale"}
        isOpen={showTokenSaleModal}
        handleClose={() => handleTokenSaleModal(false)}
      /> */}
    </>
  );
};
