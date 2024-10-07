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
import { useNetworkContext } from "./useNetwork";
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
  ChannelWideModalsStateType,
  useChannelWideModalsInitialState,
  useChannelWideModalsState,
} from "../internal/modals/useChannelWideModalsState";
import { useChatBotState } from "../chat/useChatBotState";
import { areAddressesEqual } from "../../utils/validation/wallet";

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
    isOwner: boolean;
  } & UseChannelDetailsType;
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
    vipPool: string;
    handleVipPool: (value: string) => void;
    tradeLoading: boolean;
    handleTradeLoading: (value: boolean) => void;
    selectedUserInChat?: SelectedUser;
    handleSelectedUserInChat: (value?: SelectedUser) => void;
    handleLocalSharesEventState: (value: SharesEventState) => void;
  } & WelcomeTourStateType &
    ChannelWideModalsStateType;
}>({
  channel: {
    latestBet: undefined,
    handleLatestBet: () => undefined,
    error: undefined,
    totalBadges: "0",
    isOwner: false,
    ...useChannelDetailsInitial,
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
    ...useChannelWideModalsInitialState,
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
  providedSlug,
}: {
  children: React.ReactNode;
  providedSlug?: string;
}) => {
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const { user } = useUser();
  const router = useRouter();
  const { slug } = router.query;

  const [ablyChatChannel, setAblyChatChannel] = useState<string | undefined>(
    undefined
  );
  const [ablyPresenceChannel, setAblyPresenceChannel] = useState<
    string | undefined
  >(undefined);
  const [isVip, setIsVip] = useState<boolean>(false);

  const [selectedUserInChat, setSelectedUserInChat] = useState<
    SelectedUser | undefined
  >(undefined);

  const [totalBadges, setTotalBadges] = useState<string>("0");
  const [vipPool, setVipPool] = useState<string>("0");
  const [tradeLoading, setTradeLoading] = useState<boolean>(false);
  const channelDetails = useChannelDetails(providedSlug ?? slug);
  const [latestBet, setLatestBet] = useState<SharesEvent | undefined>(
    undefined
  );

  const isOwner = useMemo(() => {
    if (!user?.address || !channelDetails?.channelQueryData?.owner?.address)
      return false;
    return areAddressesEqual(
      user?.address,
      channelDetails?.channelQueryData?.owner?.address
    );
  }, [user?.address, channelDetails?.channelQueryData?.owner?.address]);

  const welcomeTour = useWelcomeTourState(isOwner);

  const clip = useClip(channelDetails.channelQueryData);
  const channelWideModalsState = useChannelWideModalsState();
  const { chatBot, addToChatbot } = useChatBotState();

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
        isOwner,
        ...channelDetails,
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
        vipPool,
        ...channelWideModalsState,
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
      isOwner,
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
      channelWideModalsState,
      handleIsVip,
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
