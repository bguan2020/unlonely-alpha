import { useCallback, useEffect, useMemo, useState } from "react";
import { CommandData } from "../../constants";
import { CHANNEL_INTERACTABLE_QUERY } from "../../constants/queries";
import {
  ChannelDetailQuery,
  ChannelInteractableQuery,
  ChannelStaticQuery,
} from "../../generated/graphql";
import { ApolloError, useQuery } from "@apollo/client";
import { merge } from "lodash";
import { Role } from "../../constants/types";

export type UseChannelDetailsType = {
  realTimeChannelDetails: {
    channelName: string;
    channelDescription: string;
    chatCommands: CommandData[];
    allowNfcs: boolean;
    isLive: boolean;
  };
  handleRealTimeChannelDetails: (
    input: {
      channelName?: string,
      channelDescription?: string,
      chatCommands?: CommandData[],
      allowNfcs?: boolean,
      isLive?: boolean
    }
  ) => void;
  channelRoles: Role[];
  channelVibesTokenPriceRange: string[];
  loading: boolean;
  error?: ApolloError;
  channelQueryData: ChannelDetailQuery["getChannelBySlug"];
  handleChannelStaticData: (
    value: ChannelDetailQuery["getChannelBySlug"]
  ) => void;
  refetchChannel: () => Promise<any>;
  handleChannelVibesTokenPriceRange: (value: string[]) => void;
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
  loading: false,
  error: undefined,
  channelQueryData: {
    awsId: "",
    id: "-1",
    slug: "",
    owner: {
      address: "",
    },
  },
  handleChannelStaticData: () => undefined,
  refetchChannel: () => Promise.resolve(undefined),
  handleChannelVibesTokenPriceRange: () => undefined,
  handleChannelRoles: () => undefined,
};

export const useChannelDetails = (slug: string | string[] | undefined) => {
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

  const [realTimeChannelDetails, setRealTimeChannelDetails] =
    useState<ChannelDetailsOnlyType>(
      useChannelDetailsInitial.realTimeChannelDetails
    );
  const [channelRoles, setChannelRoles] = useState<Role[]>([]);
  const [channelVibesTokenPriceRange, setChannelVibesTokenPriceRange] =
    useState<string[]>([]);

  const handleChannelStaticData = useCallback(
    (value: ChannelDetailQuery["getChannelBySlug"]) => {
      setChannelStatic(value);
    },
    []
  );

  const handleChannelVibesTokenPriceRange = useCallback((value: string[]) => {
    setChannelVibesTokenPriceRange(value);
  }, []);

  // handleRealTimeChannelDetails, all parameters are optional, for those that are not provided, the previous value is used, make it a mapping parameter for easy input
  const handleRealTimeChannelDetails = useCallback(
    (
      input: {
        channelName?: string,
        channelDescription?: string,
        chatCommands?: CommandData[],
        allowNfcs?: boolean,
        isLive?: boolean
      }
    ) => {
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
          prev.filter((r) => r.address !== address && r.role !== role)
        );
      }
    },
    []
  );

  useEffect(() => {
    if (channelQueryData?.vibesTokenPriceRange) {
      const filteredArray = channelQueryData?.vibesTokenPriceRange.filter(
        (str): str is string => str !== null
      );
      if (filteredArray.length === 2) {
        setChannelVibesTokenPriceRange(filteredArray);
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
    if (channelQueryData) {
      handleRealTimeChannelDetails(
        {channelName: channelQueryData.name ?? "",
        channelDescription: channelQueryData.description ?? "",
        chatCommands: channelQueryData?.chatCommands?.filter(
          (command): command is CommandData => command !== null
        ) ?? [],
        allowNfcs: channelQueryData?.allowNFCs ?? false,
        isLive: channelQueryData?.isLive ?? false}
      );
    }
  }, [channelQueryData]);

  return {
    channelQueryData,
    realTimeChannelDetails,
    channelRoles,
    channelVibesTokenPriceRange,
    loading: channelInteractableLoading || channelStatic?.id === "-1",
    error: channelInteractableError,
    handleRealTimeChannelDetails,
    handleChannelStaticData,
    refetchChannel: refetchChannelInteractable,
    handleChannelVibesTokenPriceRange,
    handleChannelRoles,
  };
};
