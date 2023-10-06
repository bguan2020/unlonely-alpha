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
import { Image } from "@chakra-ui/react";

import {
  CHANNEL_DETAIL_MOBILE_QUERY,
  CHANNEL_DETAIL_QUERY,
  GET_RECENT_STREAM_INTERACTIONS_BY_CHANNEL_QUERY,
  GET_TOKEN_HOLDERS_BY_CHANNEL_QUERY,
  GET_USER_TOKEN_HOLDING_QUERY,
} from "../../constants/queries";
import {
  ChannelDetailMobileQuery,
  ChannelDetailQuery,
  GetRecentStreamInteractionsQuery,
  GetTokenHoldersByChannelQuery,
  SharesEventState,
} from "../../generated/graphql";
import { ChatBot, FetchBalanceResult } from "../../constants/types";
import { useUser } from "./useUser";
import { InteractionType } from "../../constants";
import { useClip } from "../chat/useClip";
import BuyButton from "../../components/arcade/BuyButton";
import CalendarEventModal from "../../components/channels/CalendarEventModal";
import ChatCommandModal from "../../components/channels/ChatCommandModal";
import EditChannelModal from "../../components/channels/EditChannelModal";
import NotificationsModal from "../../components/channels/NotificationsModal";
import TokenSaleModal from "../../components/channels/TokenSaleModal";
import BuyTransactionModal from "../../components/transactions/BuyTransactionModal";
import ChanceTransactionModal from "../../components/transactions/ChanceTransactionModal";
import ControlTransactionModal from "../../components/transactions/ControlTransactionModal";
import CustomTransactionModal from "../../components/transactions/CustomTransactionModal";
import TipTransactionModal from "../../components/transactions/TipTransactionModal";
import BetModal from "../../components/channels/BetModal";

export const useChannelContext = () => {
  return useContext(ChannelContext);
};

const ChannelContext = createContext<{
  channel: {
    channelQueryData?:
      | ChannelDetailQuery["getChannelBySlug"]
      | ChannelDetailMobileQuery["getChannelByAwsId"];
    data?: ChannelDetailQuery;
    mobileData?: ChannelDetailMobileQuery;
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
  holders: {
    userRank: number;
    data?: GetTokenHoldersByChannelQuery;
    loading: boolean;
    error?: ApolloError;
    refetchTokenHolders?: () => Promise<void>;
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
  holders: {
    userRank: -1,
    data: undefined,
    loading: true,
    error: undefined,
    refetchTokenHolders: undefined,
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
  const { user, userAddress } = useUser();
  const router = useRouter();
  const { slug, awsId } = router.query;

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

  const {
    loading: channelMobileDataLoading,
    error: channelMobileDataError,
    data: channelMobileData,
    refetch: refetchChannelMobileData,
  } = useQuery<ChannelDetailMobileQuery>(CHANNEL_DETAIL_MOBILE_QUERY, {
    variables: { awsId },
    // fetchPolicy: "cache-first",
    nextFetchPolicy: "network-only",
  });

  const channelQueryData = useMemo(
    () =>
      mobile
        ? channelMobileData?.getChannelByAwsId
        : channelData?.getChannelBySlug,
    [channelData, channelMobileData, mobile]
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
    getTokenHolders,
    { loading: holdersLoading, error: holdersError, data: holdersData },
  ] = useLazyQuery(GET_TOKEN_HOLDERS_BY_CHANNEL_QUERY);

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

  const handleRefetchTokenHolders = useCallback(async () => {
    await getTokenHolders({
      variables: {
        data: {
          channelId: channelQueryData?.id,
        },
      },
    });
  }, [channelQueryData]);

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

  const handleClose = useCallback(() => {
    setShowTipModal(false);
    setShowChanceModal(false);
    setShowPvpModal(false);
    setShowControlModal(false);
    setShowBuyModal(false);
    setShowCustomModal(false);
  }, []);

  const value = useMemo(
    () => ({
      channel: {
        channelQueryData,
        data: channelData,
        mobileData: channelMobileData,
        loading: mobile ? channelMobileDataLoading : channelDataLoading,
        error: mobile ? channelMobileDataError : channelDataError,
        refetch: mobile ? refetchChannelMobileData : refetchChannelData,
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
      holders: {
        userRank,
        data: holdersData,
        loading: holdersLoading,
        error: holdersError,
        refetchTokenHolders: handleRefetchTokenHolders,
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
        chatBot,
      },
    }),
    [
      channelQueryData,
      channelMobileData,
      channelMobileDataLoading,
      channelMobileDataError,
      channelData,
      channelDataLoading,
      channelDataError,
      textOverVideo,
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
      holdersData,
      holdersLoading,
      holdersError,
      handleRefetchTokenHolders,
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
      handleChatCommandModal,
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
      <BetModal
        title={
          isSharesEventPayout
            ? "stop payout"
            : isSharesEventLive
            ? "lock bets"
            : isSharesEventLock
            ? "decide outcome"
            : "create a bet"
        }
        isOpen={showBetModal}
        handleClose={() => handleBetModal(false)}
      />
      <TokenSaleModal
        title={"offer tokens for sale"}
        isOpen={showTokenSaleModal}
        handleClose={() => handleTokenSaleModal(false)}
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
      <CustomTransactionModal
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
    </>
  );
};
