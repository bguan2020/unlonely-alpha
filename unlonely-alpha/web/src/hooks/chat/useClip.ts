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

  const fetchData = async () => {
    if (!user?.address || !channelQueryData?.channelArn || loading) return;
    setLoading(true);
    const { res } = await createClip({
      channelArn: channelQueryData.channelArn,
    });
    console.log("useClip fetchData", res);
    // if res.errorMessage is not null, then show error message
    if (res.errorMessage) {
      setClipError(res.errorMessage);
    } else {
      setClipUrl(res.url);
      setClipThumbnail(res.thumbnail);
    }
    setLoading(false);
    handleIsClipUiOpen(true);
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
    fetchData,
    submitClip,
    setClipError,
    clipError,
    clipUrl,
    clipThumbnail,
    loading,
  };
};
