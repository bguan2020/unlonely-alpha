import { useLazyQuery } from "@apollo/client";
import { NFC_FEED_QUERY } from "../../constants/queries";
import { NfcFeedQuery } from "../../generated/graphql";
import { useEffect, useState } from "react";
import { useUser } from "../../hooks/context/useUser";
import { useChannelContext } from "../../hooks/context/useChannel";

export const ChannelPageNfcsList = () => {
  const { user } = useUser();
  const { channel } = useChannelContext();
  const { channelQueryData } = channel;

  const [call] = useLazyQuery(NFC_FEED_QUERY);
  const [pagesFetched, setPagesFetched] = useState(0);

  useEffect(() => {
    if (!channelQueryData?.id) return;
    const fetchNfcs = async () => {
      const nfcsData = await call({
        variables: {
          data: {
            limit: 35,
            orderBy: "createdAt",
            channelId: Number(channelQueryData.id),
            ownerAddress: user?.address,
          },
        },
      });
      const nfcs: NfcFeedQuery["getNFCFeed"] = nfcsData?.data?.getNFCFeed ?? [];
      console.log(nfcsData);
    };
    fetchNfcs();
  }, [channelQueryData?.id]);

  return null;
};
