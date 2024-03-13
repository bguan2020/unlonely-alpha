import { useCallback, useEffect, useMemo, useState } from "react";
import { CommandData } from "../../constants";
import { CHANNEL_INTERACTABLE_QUERY } from "../../constants/queries";
import { ChannelDetailQuery, ChannelInteractableQuery, ChannelStaticQuery } from "../../generated/graphql";
import { ApolloError, useQuery } from "@apollo/client";
import { merge } from "lodash";
import { Role } from "../../constants/types";

export type UseChannelDetailsType = {
    realTimeChannelDetails: {
        channelName: string;
        channelDescription: string;
        chatCommands: CommandData[];
        allowNfcs: boolean;
    };
    handleRealTimeChannelDetails: (
        channelName: string,
        channelDescription: string,
        chatCommands: CommandData[],
        allowNfcs: boolean
    ) => void;
    channelRoles: Role[];
    channelVibesTokenPriceRange: string[];
    loading: boolean;
    error?: ApolloError;
    channelQueryData: ChannelDetailQuery["getChannelBySlug"];
    handleChannelStaticData: (value: ChannelDetailQuery["getChannelBySlug"]) => void;
    refetchChannel: () => Promise<any>;
    handleChannelVibesTokenPriceRange: (value: string[]) => void;
    handleChannelRoles: (address: string, role: number, isAdding: boolean) => void;
};

export type ChannelDetailsOnlyType = UseChannelDetailsType["realTimeChannelDetails"];

export const useChannelDetailsInitial: UseChannelDetailsType = {
    realTimeChannelDetails: {
        channelName: "",
        channelDescription: "",
        chatCommands: [],
        allowNfcs: true,
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

    const [realTimeChannelDetails, setRealTimeChannelDetails] = useState<ChannelDetailsOnlyType>(useChannelDetailsInitial.realTimeChannelDetails);
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

    const handleRealTimeChannelDetails = useCallback(
      (
        channelName: string,
        channelDescription: string,
        chatCommands: CommandData[],
        allowNfcs: boolean
      ) => {
        setRealTimeChannelDetails({
          channelName,
          channelDescription,
          chatCommands,
          allowNfcs,
        });
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
          channelQueryData.name ?? "",
          channelQueryData.description ?? "",
          channelQueryData?.chatCommands?.filter(
            (command): command is CommandData => command !== null
          ) ?? [],
          channelQueryData?.allowNFCs ?? false
        );
      }
    }, [channelQueryData]);

    return {
      channelQueryData,
      realTimeChannelDetails,
      channelRoles,
      channelVibesTokenPriceRange,
      loading: channelInteractableLoading || channelStatic?.id === "-1",
      error : channelInteractableError,
      handleRealTimeChannelDetails,
      handleChannelStaticData,
      refetchChannel: refetchChannelInteractable,
      handleChannelVibesTokenPriceRange,
      handleChannelRoles
    };
}