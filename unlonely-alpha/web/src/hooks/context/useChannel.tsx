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

import {
  CHANNEL_DETAIL_QUERY,
  GET_GAMBLABLE_EVENT_LEADERBOARD_BY_CHANNEL_ID_QUERY,
  GET_GAMBLABLE_EVENT_USER_RANK_QUERY,
} from "../../constants/queries";
import {
  ChannelDetailQuery,
  GetGamblableEventLeaderboardByChannelIdQuery,
} from "../../generated/graphql";
import { ChatBot } from "../../constants/types";
import { useUser } from "./useUser";
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
    loading: boolean;
    error?: ApolloError;
    refetch: () => Promise<any>;
    totalBadges: string;
    handleTotalBadges: (value: string) => void;
  };
  chat: {
    chatChannel?: string;
    presenceChannel?: string;
    addToChatbot: (chatBotMessageToAdd: ChatBot) => void;
    chatBot: ChatBot[];
    clipping: {
      isClipUiOpen: boolean;
      handleIsClipUiOpen: (value: boolean) => void;
      handleCreateClip: (title: string) => Promise<string | undefined>;
      setClipError: (value: string) => void;
      clipError?: string;
      clipUrl?: string;
      clipThumbnail?: string;
      loading: boolean;
    };
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
  ui: {
    handleEditModal: (value: boolean) => void;
    handleNotificationsModal: (value: boolean) => void;
    handleEventModal: (value: boolean) => void;
    handleChatCommandModal: (value: boolean) => void;
    handleBetModal: (value: boolean) => void;
    handleModeratorModal: (value: boolean) => void;
    showBetModal: boolean;
    showEditModal: boolean;
    showNotificationsModal: boolean;
    showEventModal: boolean;
    showChatCommandModal: boolean;
    showModeratorModal: boolean;
    vipPool: string;
    tournamentActive: boolean;
    handleTournamentActive: (value: boolean) => void;
    handleVipPool: (value: string) => void;
  };
}>({
  channel: {
    channelQueryData: undefined,
    data: undefined,
    loading: true,
    error: undefined,
    refetch: () => Promise.resolve(undefined),
    totalBadges: "0",
    handleTotalBadges: () => undefined,
  },
  chat: {
    chatChannel: undefined,
    presenceChannel: undefined,
    clipping: {
      isClipUiOpen: false,
      handleIsClipUiOpen: () => undefined,
      handleCreateClip: () => Promise.resolve(undefined),
      setClipError: () => undefined,
      clipError: undefined,
      clipUrl: undefined,
      clipThumbnail: undefined,
      loading: false,
    },
    chatBot: [],
    addToChatbot: () => undefined,
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
  ui: {
    handleEditModal: () => undefined,
    handleNotificationsModal: () => undefined,
    handleEventModal: () => undefined,
    handleChatCommandModal: () => undefined,
    handleBetModal: () => undefined,
    handleModeratorModal: () => undefined,
    showBetModal: false,
    showEditModal: false,
    showNotificationsModal: false,
    showEventModal: false,
    showChatCommandModal: false,
    showModeratorModal: false,
    vipPool: "0",
    tournamentActive: false,
    handleTournamentActive: () => undefined,
    handleVipPool: () => undefined,
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
  const { user } = useUser();
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

  const { data: userRankData } = useQuery(GET_GAMBLABLE_EVENT_USER_RANK_QUERY, {
    variables: {
      data: {
        channelId: channelQueryData?.id,
        userAddress: user?.address,
        chainId: localNetwork.config.chainId,
      },
    },
  });

  const userRank = useMemo(
    () => userRankData?.getGamblableEventUserRank,
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

  const [showChatCommandModal, setChatCommandModal] = useState<boolean>(false);
  const [showEditModal, setEditModal] = useState<boolean>(false);
  const [showNotificationsModal, setNotificationsModal] =
    useState<boolean>(false);
  const [showEventModal, setEventModal] = useState<boolean>(false);
  const [showBetModal, setBetModal] = useState<boolean>(false);
  const [showModeratorModal, setModeratorModal] = useState<boolean>(false);

  const [totalBadges, setTotalBadges] = useState<string>("0");
  const [vipPool, setVipPool] = useState<string>("0");
  const [tournamentActive, setTournamentActive] = useState<boolean>(false);

  const {
    handleCreateClip,
    setClipError,
    clipError,
    clipUrl,
    clipThumbnail,
    loading,
  } = useClip(channelQueryData, handleIsClipUiOpen);

  useEffect(() => {
    if (channelQueryData && channelQueryData.slug) {
      setAblyChatChannel(`${channelQueryData.slug}-chat-channel`);
      setAblyPresenceChannel(`${channelQueryData.slug}-presence-channel`);
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

  const addToTextOverVideo = useCallback((message: string) => {
    setTextOverVideo((prev) => [...prev, message]);
  }, []);

  const addToChatbot = useCallback((chatBotMessageToAdd: ChatBot) => {
    setChatBot((prev) => [...prev, chatBotMessageToAdd]);
  }, []);

  const handleEditModal = useCallback((value: boolean) => {
    setEditModal(value);
  }, []);

  const handleNotificationsModal = useCallback((value: boolean) => {
    setNotificationsModal(value);
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

  const handleTotalBadges = useCallback((value: string) => {
    setTotalBadges(value);
  }, []);

  const handleVipPool = useCallback((value: string) => {
    setVipPool(value);
  }, []);

  const handleTournamentActive = useCallback((value: boolean) => {
    setTournamentActive(value);
  }, []);

  const value = useMemo(
    () => ({
      channel: {
        channelQueryData,
        data: channelData,
        loading: channelDataLoading,
        error: channelDataError,
        refetch: refetchChannelData,
        totalBadges,
        handleTotalBadges,
      },
      chat: {
        chatChannel: ablyChatChannel,
        presenceChannel: ablyPresenceChannel,
        chatBot,
        addToChatbot,
        clipping: {
          isClipUiOpen,
          handleIsClipUiOpen,
          handleCreateClip,
          setClipError,
          clipError: clipError ?? undefined,
          clipUrl,
          clipThumbnail,
          loading,
        },
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
      ui: {
        handleEditModal,
        handleNotificationsModal,
        handleEventModal,
        handleChatCommandModal,
        handleBetModal,
        handleModeratorModal,
        showEditModal,
        showNotificationsModal,
        showEventModal,
        showBetModal,
        showChatCommandModal,
        showModeratorModal,
        vipPool,
        tournamentActive,
        handleTournamentActive,
        handleVipPool,
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
      ablyChatChannel,
      ablyPresenceChannel,
      userRank,
      isClipUiOpen,
      handleIsClipUiOpen,
      handleCreateClip,
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
      handleEditModal,
      handleNotificationsModal,
      handleEventModal,
      handleBetModal,
      handleModeratorModal,
      handleChatCommandModal,
      handleIsVip,
      showEditModal,
      showNotificationsModal,
      showEventModal,
      showBetModal,
      showChatCommandModal,
      showModeratorModal,
      chatBot,
      totalBadges,
      handleTotalBadges,
      vipPool,
      tournamentActive,
      handleTournamentActive,
      handleVipPool,
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
  const { ui, channel } = useChannelContext();
  const { channelQueryData } = channel;

  const {
    handleEditModal,
    handleNotificationsModal,
    handleEventModal,
    handleChatCommandModal,
    handleBetModal,
    handleModeratorModal,
    showEditModal,
    showNotificationsModal,
    showEventModal,
    showChatCommandModal,
    showBetModal,
    showModeratorModal,
  } = ui;

  return (
    <>
      <ModeratorModal
        title={"manage moderators"}
        isOpen={showModeratorModal}
        handleClose={() => handleModeratorModal(false)}
      />
      <BetModal
        title={
          channelQueryData?.sharesEvent?.[0] ? "manage bet" : "create a bet"
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
    </>
  );
};
