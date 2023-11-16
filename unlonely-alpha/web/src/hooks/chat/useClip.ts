import { useState } from "react";

import { useUser } from "../context/useUser";
import useCreateClip from "../server/useCreateClip";
import usePostNFC from "../server/usePostNFC";

export const useClip = (
  channelQueryData: any,
  handleIsClipUiOpen: (v: boolean) => void
) => {
  const { user } = useUser();
  const [clipError, setClipError] = useState<null | string>(null);
  const [clipUrl, setClipUrl] = useState<null | any>(null);
  const [clipThumbnail, setClipThumbnail] = useState<null | any>(null);
  const [loading, setLoading] = useState(false);

  const { createClip } = useCreateClip({
    onError: (m) => {
      setClipError(m?.join(",") ?? "An unknown error occurred");
    },
  });
  const { postNFC } = usePostNFC({
    onError: (m) => {
      setClipError(m?.join(",") ?? "An unknown error occurred");
    },
  });

  const handleCreateClip = async (title: string) => {
    if (
      !user?.address ||
      !channelQueryData?.channelArn ||
      !channelQueryData?.livepeerPlaybackId ||
      loading
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

  const submitClip = async (title: string) => {
    if (!clipUrl || !clipThumbnail || !title || loading) return;
    setLoading(true);
    const _res = await postNFC({
      videoLink: clipUrl,
      videoThumbnail: clipThumbnail,
      title,
      openseaLink: "",
    });
    setLoading(false);
    if (!_res?.res?.id) {
      setClipError("An unknown error occurred");
      return;
    }
    setClipError(null);
    setClipUrl(null);
    setClipThumbnail(null);
    return `${window.location.origin}/nfc/${_res?.res?.id}`;
  };

  return {
    handleCreateClip,
    submitClip,
    setClipError,
    clipError,
    clipUrl,
    clipThumbnail,
    loading,
  };
};
