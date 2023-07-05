import { useState, useEffect } from "react";

export const useGetBadges = (rank?: number) => {
  const [rankUrl, setRankUrl] = useState<string | undefined>(undefined);
  const [rankDesc, setRankDesc] = useState<string>("");

  useEffect(() => {
    if (!rank || rank === -1) {
      setRankUrl(undefined);
      setRankDesc("");
      return;
    }
    switch (rank) {
      case 0:
        setRankUrl("/svg/holder-1st.svg");
        setRankDesc(
          "#1 holder of this channel’s token. Serious 👑👑👑 energy, but you’ve got a target on your back!!"
        );
        break;
      case 1:
        setRankUrl("/svg/holder-2nd.svg");
        setRankDesc("#2 holder of this channel’s token. Pretty impressed...👀");
        break;
      case 2:
        setRankUrl("/svg/holder-3rd.svg");
        setRankDesc(
          "#3 holder of this channel’s token. You’ve just barely made it!"
        );
        break;
      default:
        setRankUrl("/svg/holder-general.svg");
        setRankDesc(
          "Holder of this channel’s token. Congrats, this is your participation badge."
        );
    }
  }, [rank]);

  return {
    rankUrl,
    rankDesc,
  };
};
