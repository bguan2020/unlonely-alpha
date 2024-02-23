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
import { AblyChannelPromise, CommandData } from "../../constants";
import { SelectedUser } from "../../constants/types/chat";

export const useChannelContext = () => {
  return useContext(ChannelContext);
};

const ChannelContext = createContext<{
  channel: {
    channelQueryData?: ChannelDetailQuery["getChannelBySlug"];
    latestBet?: SharesEvent;
    handleLatestBet: (value: SharesEvent) => void;
    loading: boolean;
    error?: ApolloError;
    refetchChannel: () => Promise<any>;
    totalBadges: string;
    channelDetails: {
      channelName: string;
      channelDescription: string;
      chatCommands: CommandData[];
      allowNfcs: boolean;
    };
    channelRoles: Role[];
    handleTotalBadges: (value: string) => void;
    handleChannelRoles: (
      address: string,
      role: number,
      isAdding: boolean
    ) => void;
    handleChannelStaticData: (
      value: ChannelDetailQuery["getChannelBySlug"]
    ) => void;
    handleChannelDetails: (
      channelName: string,
      channelDescription: string,
      chatCommands: CommandData[],
      allowNfcs: boolean
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
    handleIsVip: (value: boolean) => void;
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
    selectedUserInChat?: SelectedUser;
    handleSelectedUserInChat: (value?: SelectedUser) => void;
    handleLocalSharesEventState: (value: SharesEventState) => void;
  };
}>({
  channel: {
    channelQueryData: undefined,
    latestBet: undefined,
    handleLatestBet: () => undefined,
    loading: true,
    error: undefined,
    refetchChannel: () => Promise.resolve(undefined),
    totalBadges: "0",
    channelDetails: {
      channelName: "",
      channelDescription: "",
      chatCommands: [],
      allowNfcs: true,
    },
    channelRoles: [],
    handleTotalBadges: () => undefined,
    handleChannelRoles: () => undefined,
    handleChannelStaticData: () => undefined,
    handleChannelDetails: () => undefined,
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
    handleLocalSharesEventState: () => undefined,
    selectedUserInChat: undefined,
    handleSelectedUserInChat: () => undefined,
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
    loading: channelInteractableLoading,
    error: channelInteractableError,
    data: channelInteractable,
    refetch: refetchChannelInteractable,
  } = useQuery<ChannelInteractableQuery>(CHANNEL_INTERACTABLE_QUERY, {
    variables: { slug },
    fetchPolicy: "network-only",
  });

  const [channelStatic, setChannelStatic] = useState<
    ChannelStaticQuery["getChannelBySlug"]
  >({
    awsId: "",
    id: "-1",
    slug: "",
    owner: {
      address: "",
    },
  });

  const channelQueryData: ChannelDetailQuery["getChannelBySlug"] =
    useMemo(() => {
      return merge({}, channelInteractable?.getChannelBySlug, channelStatic);
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
  const [isClipUiOpen, setIsClipUiOpen] = useState<boolean>(false);
  const [isVip, setIsVip] = useState<boolean>(false);

  const handleIsClipUiOpen = useCallback((isClipUiOpen: boolean) => {
    setIsClipUiOpen(isClipUiOpen);
  }, []);

  const [chatBot, setChatBot] = useState<ChatBot[]>([]);
  const [vibesTokenPriceRange, setVibesTokenPriceRange] = useState<string[]>(
    []
  );
  const [selectedUserInChat, setSelectedUserInChat] = useState<
    SelectedUser | undefined
  >(undefined);

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
  const [channelDetails, setChannelDetails] = useState<{
    channelName: string;
    channelDescription: string;
    chatCommands: CommandData[];
    allowNfcs: boolean;
  }>({
    channelName: "",
    channelDescription: "",
    chatCommands: [],
    allowNfcs: true,
  });
  const [channelRoles, setChannelRoles] = useState<Role[]>([]);
  const [latestBet, setLatestBet] = useState<SharesEvent | undefined>(
    undefined
  );

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
    setLatestBet(latestBet);
  }, [ongoingBets]);

  useEffect(() => {
    if (channelQueryData) {
      setChannelDetails({
        channelName: channelQueryData.name ?? "",
        channelDescription: channelQueryData.description ?? "",
        chatCommands:
          channelQueryData?.chatCommands?.filter(
            (command): command is CommandData => command !== null
          ) ?? [],
        allowNfcs: channelQueryData?.allowNFCs ?? false,
      });
    }
  }, [channelQueryData]);

  const handleVibesTokenPriceRange = useCallback((value: string[]) => {
    setVibesTokenPriceRange(value);
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

  const handleChannelDetails = useCallback(
    (
      channelName: string,
      channelDescription: string,
      chatCommands: CommandData[],
      allowNfcs: boolean
    ) => {
      setChannelDetails({
        channelName,
        channelDescription,
        chatCommands,
        allowNfcs,
      });
    },
    []
  );

  const handleChannelStaticData = useCallback(
    (value: ChannelDetailQuery["getChannelBySlug"]) => {
      setChannelStatic(value);
    },
    []
  );

  const handleLocalSharesEventState = useCallback((value: SharesEventState) => {
    // setLocalSharesEventState(value);
    setLatestBet((prev) => {
      if (prev) {
        return {
          ...prev,
          eventState: value,
        };
      }
      return prev;
    });
  }, []);

  const handleSelectedUserInChat = useCallback((value?: SelectedUser) => {
    setSelectedUserInChat(value);
  }, []);

  const handleLatestBet = useCallback((value: SharesEvent) => {
    setLatestBet(value);
  }, []);

  const value = useMemo(
    () => ({
      channel: {
        channelQueryData,
        latestBet,
        handleLatestBet,
        loading: channelInteractableLoading || channelStatic?.id === "-1",
        error: channelInteractableError,
        refetchChannel: refetchChannelInteractable,
        totalBadges,
        handleTotalBadges,
        channelDetails,
        channelRoles: channelRoles,
        handleChannelRoles,
        handleChannelStaticData,
        handleChannelDetails,
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
        selectedUserInChat,
        handleSelectedUserInChat,
        handleLocalSharesEventState,
      },
    }),
    [
      channelDetails,
      channelRoles,
      channelQueryData,
      latestBet,
      handleLatestBet,
      handleChannelStaticData,
      handleChannelDetails,
      channelInteractableLoading,
      channelInteractableError,
      refetchChannelInteractable,
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
      handleLocalSharesEventState,
      selectedUserInChat,
      handleSelectedUserInChat,
    ]
  );

  return (
    <ChannelContext.Provider value={value}>{children}</ChannelContext.Provider>
  );
};

export const ChannelWideModals = ({
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
        ablyChannel={ablyChannel}
      />
      <EditChannelModal
        title={"edit title / description"}
        isOpen={showEditModal}
        handleClose={() => handleEditModal(false)}
        ablyChannel={ablyChannel}
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
