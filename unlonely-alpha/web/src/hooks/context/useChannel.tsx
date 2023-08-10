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
} from "../../generated/graphql";
import { FetchBalanceResult } from "../../constants/types";
import { useUser } from "./useUser";
import { InteractionType } from "../../constants";

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
    refetchTokenHolders?: () => void;
  };
}>({
  channel: {
    channelQueryData: undefined,
    data: undefined,
    loading: true,
    error: undefined,
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
    refetchTokenHolders: () => undefined,
  },
});

export const ChannelProvider = ({
  mobile,
  children,
}: {
  mobile?: boolean;
  children: React.ReactNode;
}) => {
  const { user } = useUser();
  const router = useRouter();
  const { slug, awsId } = router.query;

  const {
    loading: channelDataLoading,
    error: channelDataError,
    data: channelData,
  } = useQuery<ChannelDetailQuery>(CHANNEL_DETAIL_QUERY, {
    variables: { slug },
  });

  const {
    loading: channelMobileDataLoading,
    error: channelMobileDataError,
    data: channelMobileData,
  } = useQuery<ChannelDetailMobileQuery>(CHANNEL_DETAIL_MOBILE_QUERY, {
    variables: { awsId },
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

  useEffect(() => {
    if (channelQueryData && channelQueryData.awsId) {
      setAblyChatChannel(`${channelQueryData.awsId}-chat-channel`);
      setAblyPresenceChannel(`${channelQueryData.awsId}-presence-channel`);
    }
  }, [channelQueryData]);

  const handleRefetchTokenHolders = useCallback(() => {
    getTokenHolders({
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

  const value = useMemo(
    () => ({
      channel: {
        channelQueryData,
        data: channelData,
        mobileData: channelMobileData,
        loading: mobile ? channelMobileDataLoading : channelDataLoading,
        error: mobile ? channelMobileDataError : channelDataError,
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
    ]
  );

  return (
    <ChannelContext.Provider value={value}>{children}</ChannelContext.Provider>
  );
};
