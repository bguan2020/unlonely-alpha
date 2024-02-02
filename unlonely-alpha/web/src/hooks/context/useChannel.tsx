import { useRouter } from "next/router";
import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
  useCallback,
} from "react";
import { ApolloError, useQuery } from "@apollo/client";
import { merge } from "lodash";

import {
  CHANNEL_STATIC_QUERY,
  CHANNEL_INTERACTABLE_QUERY,
  GET_GAMBLABLE_EVENT_USER_RANK_QUERY,
} from "../../constants/queries";
import {
  ChannelDetailQuery,
  ChannelInteractableQuery,
  ChannelStaticQuery,
  GetGamblableEventLeaderboardByChannelIdQuery,
  SharesEvent,
  SharesEventState,
} from "../../generated/graphql";
import { ChatBot, Role } from "../../constants/types";
import { useUser } from "./useUser";
import { useClip } from "../chat/useClip";
import CalendarEventModal from "../../components/channels/CalendarEventModal";
import ChatCommandModal from "../../components/channels/ChatCommandModal";
import EditChannelModal from "../../components/channels/EditChannelModal";
import NotificationsModal from "../../components/channels/NotificationsModal";
import ModeratorModal from "../../components/channels/ModeratorModal";
import { useNetworkContext } from "./useNetwork";
import { AblyChannelPromise } from "../../constants";

export const useChannelContext = () => {
  return useContext(ChannelContext);
};

const ChannelContext = createContext<{
  channel: {
    channelQueryData?: ChannelDetailQuery["getChannelBySlug"];
    ongoingBets: SharesEvent[];
    loading: boolean;
    error?: ApolloError;
    refetchChannel: () => Promise<any>;
    totalBadges: string;
    channelRoles: Role[];
    handleTotalBadges: (value: string) => void;
    handleChannelRoles: (
      address: string,
      role: number,
      isAdding: boolean
    ) => void;
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
    handleModeratorModal: (value: boolean) => void;
    showEditModal: boolean;
    showNotificationsModal: boolean;
    showEventModal: boolean;
    showChatCommandModal: boolean;
    showModeratorModal: boolean;
    vipPool: string;
    tournamentActive: boolean;
    vibesTokenPriceRange: string[];
    handleTournamentActive: (value: boolean) => void;
    handleVipPool: (value: string) => void;
    tradeLoading: boolean;
    handleTradeLoading: (value: boolean) => void;
    handleVibesTokenPriceRange: (value: string[]) => void;
    localSharesEventState?: SharesEventState;
    handleLocalSharesEventState: (value: SharesEventState) => void;
  };
}>({
  channel: {
    channelQueryData: undefined,
    ongoingBets: [],
    loading: true,
    error: undefined,
    refetchChannel: () => Promise.resolve(undefined),
    totalBadges: "0",
    channelRoles: [],
    handleTotalBadges: () => undefined,
    handleChannelRoles: () => undefined,
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
    handleModeratorModal: () => undefined,
    showEditModal: false,
    showNotificationsModal: false,
    showEventModal: false,
    showChatCommandModal: false,
    showModeratorModal: false,
    vipPool: "0",
    vibesTokenPriceRange: [],
    tournamentActive: false,
    handleTournamentActive: () => undefined,
    handleVipPool: () => undefined,
    tradeLoading: false,
    handleTradeLoading: () => undefined,
    handleVibesTokenPriceRange: () => undefined,
    localSharesEventState: undefined,
    handleLocalSharesEventState: () => undefined,
  },
});

export const ChannelProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const { user } = useUser();
  const router = useRouter();
  const { slug } = router.query;

  const {
    loading: channelStaticLoading,
    error: channelStaticError,
    data: channelStatic,
  } = useQuery<ChannelStaticQuery>(CHANNEL_STATIC_QUERY, {
    variables: { slug },
    fetchPolicy: "cache-and-network",
  });

  const {
    loading: channelInteractableLoading,
    error: channelInteractableError,
    data: channelInteractable,
    refetch: refetchChannelInteractable,
  } = useQuery<ChannelInteractableQuery>(CHANNEL_INTERACTABLE_QUERY, {
    variables: { slug },
    fetchPolicy: "network-only",
  });

  const channelQueryData: ChannelDetailQuery["getChannelBySlug"] =
    useMemo(() => {
      return merge(
        {},
        channelInteractable?.getChannelBySlug,
        channelStatic?.getChannelBySlug
      );
    }, [channelStatic, channelInteractable]);

  const ongoingBets = useMemo(
    () =>
      channelQueryData?.sharesEvent?.filter(
        (event): event is SharesEvent =>
          event !== null && event?.chainId === localNetwork.config.chainId
      ) ?? [],
    [channelQueryData?.sharesEvent, localNetwork.config.chainId]
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

  const [ablyChatChannel, setAblyChatChannel] = useState<string | undefined>(
    undefined
  );
  const [ablyPresenceChannel, setAblyPresenceChannel] = useState<
    string | undefined
  >(undefined);
  const [textOverVideo, setTextOverVideo] = useState<string[]>([]);
  const [isClipUiOpen, setIsClipUiOpen] = useState<boolean>(false);
  const [isVip, setIsVip] = useState<boolean>(false);
  const [localSharesEventState, setLocalSharesEventState] = useState<
    SharesEventState | undefined
  >(undefined);

  const handleIsClipUiOpen = useCallback((isClipUiOpen: boolean) => {
    setIsClipUiOpen(isClipUiOpen);
  }, []);

  const [chatBot, setChatBot] = useState<ChatBot[]>([]);
  const [vibesTokenPriceRange, setVibesTokenPriceRange] = useState<string[]>(
    []
  );

  const [showChatCommandModal, setChatCommandModal] = useState<boolean>(false);
  const [showEditModal, setEditModal] = useState<boolean>(false);
  const [showNotificationsModal, setNotificationsModal] =
    useState<boolean>(false);
  const [showEventModal, setEventModal] = useState<boolean>(false);
  const [showModeratorModal, setModeratorModal] = useState<boolean>(false);

  const [totalBadges, setTotalBadges] = useState<string>("0");
  const [vipPool, setVipPool] = useState<string>("0");
  const [tournamentActive, setTournamentActive] = useState<boolean>(false);
  const [tradeLoading, setTradeLoading] = useState<boolean>(false);
  const [channelRoles, setChannelRoles] = useState<Role[]>([]);

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

  useEffect(() => {
    if (channelQueryData?.vibesTokenPriceRange) {
      const filteredArray = channelQueryData?.vibesTokenPriceRange.filter(
        (str): str is string => str !== null
      );
      if (filteredArray.length === 2) {
        setVibesTokenPriceRange(filteredArray);
      }
    }
  }, [channelQueryData?.vibesTokenPriceRange]);

  useEffect(() => {
    if (channelQueryData?.roles) {
      const filteredArray = channelQueryData?.roles.filter(
        (
          role
        ): role is {
          id: number;
          userAddress: string;
          role: number;
        } => role !== null
      );
      setChannelRoles(
        filteredArray.map((r) => {
          return {
            address: r.userAddress,
            role: r.role,
          };
        })
      );
    }
  }, [channelQueryData?.roles]);

  useEffect(() => {
    if (!ongoingBets || ongoingBets.length === 0) return;
    const latestBet = ongoingBets[0];
    const eventState = latestBet?.eventState;
    if (eventState !== undefined && eventState !== null)
      setLocalSharesEventState(eventState);
  }, [ongoingBets]);

  useEffect(() => {
    if (textOverVideo.length > 0) {
      const timer = setTimeout(() => {
        setTextOverVideo((prev) => prev.slice(2));
      }, 120000);
      return () => clearTimeout(timer);
    }
  }, [textOverVideo]);

  const handleVibesTokenPriceRange = useCallback((value: string[]) => {
    setVibesTokenPriceRange(value);
  }, []);

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

  const handleTradeLoading = useCallback((value: boolean) => {
    setTradeLoading(value);
  }, []);

  const handleChannelRoles = useCallback(
    (address: string, role: number, isAdding: boolean) => {
      if (isAdding) {
        setChannelRoles((prev) => [...prev, { address, role }]);
      } else {
        setChannelRoles((prev) =>
          prev.filter((r) => r.address !== address && r.role !== role)
        );
      }
    },
    []
  );

  const handleLocalSharesEventState = useCallback((value: SharesEventState) => {
    setLocalSharesEventState(value);
  }, []);

  const value = useMemo(
    () => ({
      channel: {
        channelQueryData,
        ongoingBets: ongoingBets ?? undefined,
        loading: channelStaticLoading || channelInteractableLoading,
        error: channelStaticError || channelInteractableError,
        refetchChannel: refetchChannelInteractable,
        totalBadges,
        handleTotalBadges,
        channelRoles: channelRoles,
        handleChannelRoles,
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
        data: undefined,
        loading: true,
        error: undefined,
        refetchGamblableEventLeaderboard: undefined,
        handleIsVip,
      },
      ui: {
        handleEditModal,
        handleNotificationsModal,
        handleEventModal,
        handleChatCommandModal,
        handleModeratorModal,
        showEditModal,
        showNotificationsModal,
        showEventModal,
        showChatCommandModal,
        showModeratorModal,
        vipPool,
        vibesTokenPriceRange,
        tournamentActive,
        handleTournamentActive,
        handleVipPool,
        tradeLoading,
        handleTradeLoading,
        handleVibesTokenPriceRange,
        localSharesEventState,
        handleLocalSharesEventState,
      },
    }),
    [
      channelRoles,
      channelQueryData,
      ongoingBets,
      channelStaticLoading,
      channelStaticError,
      channelInteractableLoading,
      channelInteractableError,
      textOverVideo,
      refetchChannelInteractable,
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
      vibesTokenPriceRange,
      handleIsVip,
      addToChatbot,
      handleEditModal,
      handleNotificationsModal,
      handleEventModal,
      handleModeratorModal,
      handleChatCommandModal,
      handleIsVip,
      showEditModal,
      showNotificationsModal,
      showEventModal,
      showChatCommandModal,
      showModeratorModal,
      chatBot,
      totalBadges,
      handleTotalBadges,
      vipPool,
      tournamentActive,
      handleTournamentActive,
      handleVipPool,
      tradeLoading,
      handleTradeLoading,
      handleVibesTokenPriceRange,
      handleChannelRoles,
      localSharesEventState,
      handleLocalSharesEventState,
    ]
  );

  return (
    <ChannelContext.Provider value={value}>{children}</ChannelContext.Provider>
  );
};

export const TransactionModals = ({
  ablyChannel,
}: {
  ablyChannel: AblyChannelPromise;
}) => {
  const { ui } = useChannelContext();

  const {
    handleEditModal,
    handleNotificationsModal,
    handleEventModal,
    handleChatCommandModal,
    handleModeratorModal,
    showEditModal,
    showNotificationsModal,
    showEventModal,
    showChatCommandModal,
    showModeratorModal,
  } = ui;

  return (
    <>
      <ModeratorModal
        title={"manage moderators"}
        isOpen={showModeratorModal}
        handleClose={() => handleModeratorModal(false)}
        ablyChannel={ablyChannel}
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
