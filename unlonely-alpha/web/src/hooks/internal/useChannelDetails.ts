import { useCallback, useEffect, useMemo, useState } from "react";
import { CommandData } from "../../constants";
import {
  ChannelDetailQuery,
  ChannelStaticQuery,
} from "../../generated/graphql";
import { Role } from "../../constants/types";

export type UseChannelDetailsType = {
  realTimeChannelDetails: {
    channelName: string;
    channelDescription: string;
    chatCommands: CommandData[];
    allowNfcs: boolean;
    isLive: boolean;
  };
  handleRealTimeChannelDetails: (input: {
    channelName?: string;
    channelDescription?: string;
    chatCommands?: CommandData[];
    allowNfcs?: boolean;
    isLive?: boolean;
  }) => void;
  channelRoles: Role[];
  channelVibesTokenPriceRange: string[];
  pinnedChatMessages: string[];
  channelQueryData: ChannelDetailQuery["getChannelBySlug"];
  handleChannelStaticData: (
    value: ChannelDetailQuery["getChannelBySlug"]
  ) => void;
  handleChannelVibesTokenPriceRange: (value: string[]) => void;
  handlePinnedChatMessages: (value: string[]) => void;
  handleChannelRoles: (
    address: string,
    role: number,
    isAdding: boolean
  ) => void;
};

export type ChannelDetailsOnlyType =
  UseChannelDetailsType["realTimeChannelDetails"];

export const useChannelDetailsInitial: UseChannelDetailsType = {
  realTimeChannelDetails: {
    channelName: "",
    channelDescription: "",
    chatCommands: [],
    allowNfcs: true,
    isLive: false,
  },
  handleRealTimeChannelDetails: () => undefined,
  channelRoles: [],
  channelVibesTokenPriceRange: [],
  pinnedChatMessages: [],
  channelQueryData: {
    awsId: "",
    id: "-1",
    slug: "",
    owner: {
      address: "",
    },
  },
  handleChannelStaticData: () => undefined,
  handleChannelVibesTokenPriceRange: () => undefined,
  handlePinnedChatMessages: () => undefined,
  handleChannelRoles: () => undefined,
};

export const useChannelDetails = (slug: string | string[] | undefined) => {
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
      return channelStatic;
    }, [channelStatic]);

  const [realTimeChannelDetails, setRealTimeChannelDetails] =
    useState<ChannelDetailsOnlyType>(
      useChannelDetailsInitial.realTimeChannelDetails
    );
  const [channelRoles, setChannelRoles] = useState<Role[]>([]);
  const [channelVibesTokenPriceRange, setChannelVibesTokenPriceRange] =
    useState<string[]>([]);
  const [pinnedChatMessages, setPinnedChatMessages] = useState<string[]>([]);

  const handleChannelStaticData = useCallback(
    (value: ChannelDetailQuery["getChannelBySlug"]) => {
      setChannelStatic(value);
    },
    []
  );

  const handleChannelVibesTokenPriceRange = useCallback((value: string[]) => {
    setChannelVibesTokenPriceRange(value);
  }, []);

  const handlePinnedChatMessages = useCallback((value: string[]) => {
    setPinnedChatMessages(value);
  }, []);

  // handleRealTimeChannelDetails, all parameters are optional, for those that are not provided, the previous value is used, make it a mapping parameter for easy input
  const handleRealTimeChannelDetails = useCallback(
    (input: {
      channelName?: string;
      channelDescription?: string;
      chatCommands?: CommandData[];
      allowNfcs?: boolean;
      isLive?: boolean;
    }) => {
      setRealTimeChannelDetails((prev) => ({
        channelName: input.channelName ?? prev.channelName,
        channelDescription: input.channelDescription ?? prev.channelDescription,
        chatCommands: input.chatCommands ?? prev.chatCommands,
        allowNfcs: input.allowNfcs ?? prev.allowNfcs,
        isLive: input.isLive ?? prev.isLive,
      }));
    },
    []
  );
  const handleChannelRoles = useCallback(
    (address: string, role: number, isAdding: boolean) => {
      if (isAdding) {
        setChannelRoles((prev) => [...prev, { address, role }]);
      } else {
        setChannelRoles((prev) =>
          prev?.filter((r) => r.address !== address && r.role !== role)
        );
      }
    },
    []
  );

  useEffect(() => {
    if (channelQueryData?.vibesTokenPriceRange) {
      const filteredArray = channelQueryData?.vibesTokenPriceRange?.filter(
        (str): str is string => str !== null
      );
      if (filteredArray.length === 2) {
        setChannelVibesTokenPriceRange(filteredArray);
      }
    }
  }, [channelQueryData?.vibesTokenPriceRange]);

  useEffect(() => {
    if (channelQueryData?.pinnedChatMessages) {
      const filteredArray = channelQueryData?.pinnedChatMessages?.filter(
        (str): str is string => str !== null
      );
      handlePinnedChatMessages(filteredArray);
    }
  }, [channelQueryData?.pinnedChatMessages]);

  useEffect(() => {
    if (channelQueryData?.roles) {
      const filteredArray = channelQueryData?.roles?.filter(
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
    if (channelQueryData) {
      handleRealTimeChannelDetails({
        channelName: channelQueryData.name ?? "",
        channelDescription: channelQueryData.description ?? "",
        chatCommands:
          channelQueryData?.chatCommands?.filter(
            (command): command is CommandData => command !== null
          ) ?? [],
        allowNfcs: channelQueryData?.allowNFCs ?? false,
        isLive: channelQueryData?.isLive ?? false,
      });
    }
  }, [channelQueryData]);

  return {
    channelQueryData,
    realTimeChannelDetails,
    channelRoles,
    channelVibesTokenPriceRange,
    pinnedChatMessages,
    handleRealTimeChannelDetails,
    handleChannelStaticData,
    handleChannelVibesTokenPriceRange,
    handlePinnedChatMessages,
    handleChannelRoles,
  };
};
