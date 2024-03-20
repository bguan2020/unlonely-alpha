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

import { GET_GAMBLABLE_EVENT_USER_RANK_QUERY } from "../../constants/queries";
import {
  GetGamblableEventLeaderboardByChannelIdQuery,
  SharesEvent,
  SharesEventState,
} from "../../generated/graphql";
import { ChatBot } from "../../constants/types";
import { useUser } from "./useUser";
import { UseClipType, useClip, useClipInitial } from "../chat/useClip";
import ChatCommandModal from "../../components/channels/ChatCommandModal";
import EditChannelModal from "../../components/channels/EditChannelModal";
import NotificationsModal from "../../components/channels/NotificationsModal";
import ModeratorModal from "../../components/channels/ModeratorModal";
import { useNetworkContext } from "./useNetwork";
import { AblyChannelPromise } from "../../constants";
import { SelectedUser } from "../../constants/types/chat";
import {
  WelcomeTourStateType,
  useWelcomeTourState,
  welcomeTourStateInitial,
} from "../internal/useWelcomeTourState";
import {
  UseChannelDetailsType,
  useChannelDetails,
  useChannelDetailsInitial,
} from "../internal/useChannelDetails";
import {
  UseTempTokenStateType,
  useTempTokenInitialState,
  useTempTokenState,
} from "../internal/useTempTokenState";

export const useChannelContext = () => {
  return useContext(ChannelContext);
};

const ChannelContext = createContext<{
  channel: {
    latestBet?: SharesEvent;
    handleLatestBet: (value: SharesEvent) => void;
    error?: ApolloError;
    totalBadges: string;
    handleTotalBadges: (value: string) => void;
  } & UseChannelDetailsType &
    UseTempTokenStateType;
  chat: {
    chatChannel?: string;
    presenceChannel?: string;
    addToChatbot: (chatBotMessageToAdd: ChatBot) => void;
    chatBot: ChatBot[];
  } & UseClipType;
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
    handleChatCommandModal: (value: boolean) => void;
    handleModeratorModal: (value: boolean) => void;
    showEditModal: boolean;
    showNotificationsModal: boolean;
    showChatCommandModal: boolean;
    showModeratorModal: boolean;
    vipPool: string;
    handleVipPool: (value: string) => void;
    tradeLoading: boolean;
    handleTradeLoading: (value: boolean) => void;
    selectedUserInChat?: SelectedUser;
    handleSelectedUserInChat: (value?: SelectedUser) => void;
    handleLocalSharesEventState: (value: SharesEventState) => void;
  } & WelcomeTourStateType;
}>({
  channel: {
    latestBet: undefined,
    handleLatestBet: () => undefined,
    error: undefined,
    totalBadges: "0",
    ...useChannelDetailsInitial,
    ...useTempTokenInitialState,
    handleTotalBadges: () => undefined,
  },
  chat: {
    chatChannel: undefined,
    presenceChannel: undefined,
    ...useClipInitial,
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
    handleChatCommandModal: () => undefined,
    handleModeratorModal: () => undefined,
    showEditModal: false,
    showNotificationsModal: false,
    showChatCommandModal: false,
    showModeratorModal: false,
    vipPool: "0",
    handleVipPool: () => undefined,
    tradeLoading: false,
    handleTradeLoading: () => undefined,
    handleLocalSharesEventState: () => undefined,
    selectedUserInChat: undefined,
    handleSelectedUserInChat: () => undefined,
    ...welcomeTourStateInitial,
  },
});

export const ChannelProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const { user, userAddress } = useUser();
  const router = useRouter();
  const { slug } = router.query;

  const [ablyChatChannel, setAblyChatChannel] = useState<string | undefined>(
    undefined
  );
  const [ablyPresenceChannel, setAblyPresenceChannel] = useState<
    string | undefined
  >(undefined);
  const [isVip, setIsVip] = useState<boolean>(false);

  const [chatBot, setChatBot] = useState<ChatBot[]>([]);

  const [selectedUserInChat, setSelectedUserInChat] = useState<
    SelectedUser | undefined
  >(undefined);

  const [showChatCommandModal, setChatCommandModal] = useState<boolean>(false);
  const [showEditModal, setEditModal] = useState<boolean>(false);
  const [showNotificationsModal, setNotificationsModal] =
    useState<boolean>(false);
  const [showModeratorModal, setModeratorModal] = useState<boolean>(false);

  const [totalBadges, setTotalBadges] = useState<string>("0");
  const [vipPool, setVipPool] = useState<string>("0");
  const [tradeLoading, setTradeLoading] = useState<boolean>(false);
  const channelDetails = useChannelDetails(slug);
  const [latestBet, setLatestBet] = useState<SharesEvent | undefined>(
    undefined
  );

  const isOwner =
    userAddress === channelDetails.channelQueryData?.owner?.address;

  const welcomeTour = useWelcomeTourState(isOwner);
  const tempToken = useTempTokenState(
    Number(channelDetails.channelQueryData?.id)
  );

  const clip = useClip(channelDetails.channelQueryData);

  const ongoingBets = useMemo(
    () =>
      channelDetails.channelQueryData?.sharesEvent?.filter(
        (event): event is SharesEvent =>
          event !== null && event?.chainId === localNetwork.config.chainId
      ) ?? [],
    [channelDetails.channelQueryData?.sharesEvent, localNetwork.config.chainId]
  );

  const { data: userRankData } = useQuery(GET_GAMBLABLE_EVENT_USER_RANK_QUERY, {
    variables: {
      data: {
        channelId: channelDetails.channelQueryData?.id,
        userAddress: user?.address,
        chainId: localNetwork.config.chainId,
      },
    },
  });

  const userRank = useMemo(
    () => userRankData?.getGamblableEventUserRank,
    [userRankData]
  );

  useEffect(() => {
    if (
      channelDetails.channelQueryData &&
      channelDetails.channelQueryData.slug
    ) {
      setAblyChatChannel(
        `${channelDetails.channelQueryData.slug}-chat-channel`
      );
      setAblyPresenceChannel(
        `${channelDetails.channelQueryData.slug}-presence-channel`
      );
    }
  }, [channelDetails.channelQueryData]);

  useEffect(() => {
    if (!ongoingBets || ongoingBets.length === 0) return;
    const latestBet = ongoingBets[0];
    setLatestBet(latestBet);
  }, [ongoingBets]);

  const addToChatbot = useCallback((chatBotMessageToAdd: ChatBot) => {
    setChatBot((prev) => [...prev, chatBotMessageToAdd]);
  }, []);

  const handleEditModal = useCallback((value: boolean) => {
    setEditModal(value);
  }, []);

  const handleNotificationsModal = useCallback((value: boolean) => {
    setNotificationsModal(value);
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

  const handleTradeLoading = useCallback((value: boolean) => {
    setTradeLoading(value);
  }, []);

  const handleLocalSharesEventState = useCallback((value: SharesEventState) => {
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
        latestBet,
        handleLatestBet,
        totalBadges,
        handleTotalBadges,
        ...channelDetails,
        ...tempToken,
      },
      chat: {
        chatChannel: ablyChatChannel,
        presenceChannel: ablyPresenceChannel,
        chatBot,
        addToChatbot,
        ...clip,
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
        handleChatCommandModal,
        handleModeratorModal,
        showEditModal,
        showNotificationsModal,
        showChatCommandModal,
        showModeratorModal,
        vipPool,
        handleVipPool,
        tradeLoading,
        handleTradeLoading,
        selectedUserInChat,
        handleSelectedUserInChat,
        handleLocalSharesEventState,
        ...welcomeTour,
      },
    }),
    [
      channelDetails,
      latestBet,
      handleLatestBet,
      ablyChatChannel,
      ablyPresenceChannel,
      userRank,
      clip,
      userRank,
      isVip,
      handleIsVip,
      addToChatbot,
      handleEditModal,
      handleNotificationsModal,
      handleModeratorModal,
      handleChatCommandModal,
      handleIsVip,
      showEditModal,
      showNotificationsModal,
      showChatCommandModal,
      showModeratorModal,
      chatBot,
      totalBadges,
      handleTotalBadges,
      vipPool,
      handleVipPool,
      tradeLoading,
      handleTradeLoading,
      handleLocalSharesEventState,
      selectedUserInChat,
      handleSelectedUserInChat,
      welcomeTour,
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
    handleChatCommandModal,
    handleModeratorModal,
    showEditModal,
    showNotificationsModal,
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
    </>
  );
};
