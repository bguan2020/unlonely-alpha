import { useRouter } from "next/router";
import { createContext, useContext, useMemo, useEffect, useState } from "react";
import {
  CHANNEL_DETAIL_QUERY,
  GET_RECENT_STREAM_INTERACTIONS_BY_CHANNEL_QUERY,
} from "../../constants/queries";
import {
  ChannelDetailQuery,
  GetRecentStreamInteractionsQuery,
} from "../../generated/graphql";
import { ApolloError, useQuery } from "@apollo/client";
// import { InteractionType } from "../../constants";
// import io, { Socket } from "socket.io-client";
import { useBalance } from "wagmi";
import { FetchBalanceResult } from "../../constants/types";
import { useUser } from "./useUser";

export const useChannelContext = () => {
  return useContext(ChannelContext);
};

const ChannelContext = createContext<{
  channel: {
    channelBySlug?: ChannelDetailQuery["getChannelBySlug"];
    data?: ChannelDetailQuery;
    loading: boolean;
    error?: ApolloError;
  };
  recentStreamInteractions: {
    // textOverVideo: string[];
    // socket?: Socket;
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
}>({
  channel: {
    channelBySlug: undefined,
    data: undefined,
    loading: true,
    error: undefined,
  },
  recentStreamInteractions: {
    // textOverVideo: [],
    // socket: undefined,
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
});

export const ChannelProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useUser();
  const router = useRouter();
  const { slug } = router.query;

  const {
    loading: channelDataLoading,
    error: channelDataError,
    data: channelData,
  } = useQuery<ChannelDetailQuery>(CHANNEL_DETAIL_QUERY, {
    variables: { slug },
  });

  const {
    data: recentStreamInteractionsData,
    loading: recentStreamInteractionsDataLoading,
    error: recentStreamInteractionsDataError,
  } = useQuery<GetRecentStreamInteractionsQuery>(
    GET_RECENT_STREAM_INTERACTIONS_BY_CHANNEL_QUERY,
    {
      variables: {
        data: {
          channelId: channelData?.getChannelBySlug?.id,
        },
      },
    }
  );

  const channelBySlug = useMemo(
    () => channelData?.getChannelBySlug,
    [channelData]
  );

  const { data: userTokenBalance, refetch: refetchUserTokenBalance } =
    useBalance({
      address: user?.address as `0x${string}`,
      token: channelData?.getChannelBySlug?.token?.address as `0x${string}`,
    });

  const { data: ownerTokenBalance, refetch: refetchOwnerTokenBalance } =
    useBalance({
      address: channelData?.getChannelBySlug?.owner?.address as `0x${string}`,
      token: channelData?.getChannelBySlug?.token?.address as `0x${string}`,
    });

  const [ablyChatChannel, setAblyChatChannel] = useState<string | undefined>(
    undefined
  );
  const [ablyPresenceChannel, setAblyPresenceChannel] = useState<
    string | undefined
  >(undefined);
  // const [socket, setSocket] = useState<Socket | undefined>(undefined);
  // const [textOverVideo, setTextOverVideo] = useState<string[]>([]);

  useEffect(() => {
    if (channelData?.getChannelBySlug && channelData?.getChannelBySlug.awsId) {
      setAblyChatChannel(`${channelData?.getChannelBySlug.awsId}-chat-channel`);
      setAblyPresenceChannel(
        `${channelData?.getChannelBySlug.awsId}-presence-channel`
      );
    }
  }, [channelData]);

  // useEffect(() => {
  //   const socketInit = async () => {
  //     const url =
  //       process.env.NODE_ENV === "production"
  //         ? "https://sea-lion-app-j3rts.ondigitalocean.app"
  //         : "http://localhost:4000";
  //     const newSocket = io(url, {
  //       transports: ["websocket"],
  //     });

  //     newSocket.on("connect_error", (err) => {
  //       console.log(`Connect error: ${err}`);
  //     });

  //     console.log("socket connected to URL: ", url);
  //     setSocket(newSocket);

  //     newSocket.on("receive-message", (data) => {
  //       /* eslint-disable no-console */
  //       console.log("socket received message", data);
  //       setTextOverVideo((prev) => [...prev, data.message]);
  //     });
  //   };
  //   socketInit();

  //   return () => {
  //     if (!socket) return;
  //     socket.disconnect();
  //   };
  // }, []);

  // useEffect(() => {
  //   if (textOverVideo.length > 0) {
  //     const timer = setTimeout(() => {
  //       setTextOverVideo((prev) => prev.slice(2));
  //     }, 120000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [textOverVideo]);

  // useEffect(() => {
  //   if (!recentStreamInteractionsData) return;
  //   const interactions =
  //     recentStreamInteractionsData.getRecentStreamInteractionsByChannel;
  //   if (interactions && interactions.length > 0) {
  //     const textInteractions = interactions.filter(
  //       (i) => i?.interactionType === InteractionType.CONTROL && i.text
  //     );
  //     setTextOverVideo(textInteractions.map((i) => String(i?.text)));
  //   }
  // }, [recentStreamInteractionsData]);

  const value = useMemo(
    () => ({
      channel: {
        channelBySlug,
        data: channelData,
        loading: channelDataLoading,
        error: channelDataError,
      },
      recentStreamInteractions: {
        // textOverVideo,
        // socket,
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
    }),
    [
      channelBySlug,
      channelData,
      channelDataLoading,
      channelDataError,
      // textOverVideo,
      // socket,
      recentStreamInteractionsData,
      recentStreamInteractionsDataLoading,
      recentStreamInteractionsDataError,
      ablyChatChannel,
      ablyPresenceChannel,
      userTokenBalance,
      refetchUserTokenBalance,
      ownerTokenBalance,
      refetchOwnerTokenBalance,
    ]
  );

  return (
    <ChannelContext.Provider value={value}>{children}</ChannelContext.Provider>
  );
};
