import { useCallback, useState } from "react";

import { useUser } from "../context/useUser";
import useCreateClip from "../server/channel/useCreateClip";

export type UseClipType = {
  isClipUiOpen: boolean;
  handleIsClipUiOpen: (value: boolean) => void;
  handleCreateClip: (title: string) => Promise<string | undefined>;
  handleClipError: (value: string) => void;
  clipError?: string;
  clipUrl?: string;
  clipThumbnail?: string;
  loading: boolean;
};

export const useClipInitial: UseClipType = {
  isClipUiOpen: false,
  handleIsClipUiOpen: () => undefined,
  handleCreateClip: () => Promise.resolve(undefined),
  handleClipError: () => undefined,
  clipError: undefined,
  clipUrl: undefined,
  clipThumbnail: undefined,
  loading: false,
};

export const useClip = (channelQueryData: any): UseClipType => {
  const { user } = useUser();
  const [clipError, setClipError] = useState<null | string>(null);
  const [clipUrl, setClipUrl] = useState<null | any>(null);
  const [clipThumbnail, setClipThumbnail] = useState<null | any>(null);
  const [loading, setLoading] = useState(false);
  const [isClipUiOpen, setIsClipUiOpen] = useState<boolean>(false);

  const { createClip } = useCreateClip({
    onError: (m) => {
      setClipError(m?.join(",") ?? "An unknown error occurred");
    },
  });

  const handleIsClipUiOpen = useCallback((isClipUiOpen: boolean) => {
    setIsClipUiOpen(isClipUiOpen);
  }, []);

  const handleClipError = useCallback((clipError: string) => {
    setClipError(clipError);
  }, []);

  const handleCreateClip = async (title: string) => {
    if (
      !channelQueryData ||
      !user?.address ||
      loading ||
      (channelQueryData?.livepeerPlaybackId?.length === 0 &&
        channelQueryData?.channelArn?.length === 0)
    ) {
      console.log(
        "useClip cannot handleCreateClip",
        channelQueryData,
        user?.address,
        loading
      );
      return;
    }
    setLoading(true);
    handleIsClipUiOpen(false);
    const { res } = await createClip({
      title,
      channelId: channelQueryData.id,
      livepeerPlaybackId: channelQueryData.livepeerPlaybackId,
      channelArn: channelQueryData.channelArn,
    });
    // if res.errorMessage is not null, then show error message
    if (res?.errorMessage) {
      setClipError(res?.errorMessage);
    } else {
      setClipUrl(res?.url);
      setClipThumbnail(res?.thumbnail);
    }
    setLoading(false);
    handleIsClipUiOpen(true);
    if (!res?.id) return;
    return `${window.location.origin}/nfc/${res?.id}`;
  };

  return {
    isClipUiOpen,
    handleIsClipUiOpen,
    handleCreateClip,
    handleClipError,
    clipError: clipError ?? undefined,
    clipUrl,
    clipThumbnail,
    loading,
  };
};
