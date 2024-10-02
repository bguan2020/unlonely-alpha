import { useLazyQuery } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { createPublicClient, http } from "viem";
import { NETWORKS } from "../../constants/networks";
import { GET_UNCLAIMED_EVENTS_QUERY } from "../../constants/queries";
import { GetUnclaimedEventsQuery, SharesEvent } from "../../generated/graphql";
import { useUser } from "../context/useUser";

type UnclaimedBet = SharesEvent & {
  payout: bigint;
};

export type UseGetClaimBetEventsType = {
  claimableBets: UnclaimedBet[];
  fetchingBets: boolean;
};

export const useGetClaimBetEventsInitial: UseGetClaimBetEventsType = {
  claimableBets: [],
  fetchingBets: true,
};

export const useGetClaimBetEvents = () => {
  const isFetching = useRef(false);

  const [fetchingBets, setFetchingBets] = useState<boolean>(true);
  const [claimableBets, setClaimableBets] = useState<UnclaimedBet[]>([]);
  const [counter, setCounter] = useState(0);

  const { user, wagmiAddress } = useUser();

  const [getUnclaimedEvents] = useLazyQuery<GetUnclaimedEventsQuery>(
    GET_UNCLAIMED_EVENTS_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

  useEffect(() => {
    const init = async () => {
      if (
        isFetching.current ||
        !user?.address ||
        !wagmiAddress ||
        window.location.pathname !== "/claim"
      ) {
        setFetchingBets(false);
        return;
      }
      setFetchingBets(true);
      isFetching.current = true;
      const unclaimedBets: any[] = [];
      try {
        
      } catch (err) {
        console.log(
          "claimpage fetching for unclaimed events failed, switching to fetching ongoing bets",
          err
        );
      }
      let payouts: any[] = [];
      try {
        const publicClient = createPublicClient({
          chain: NETWORKS[0],
          transport: http(),
        });
      } catch (err) {
        console.log("claimpage getVotePayout", err);
        payouts = [];
      }
      const formattedPayouts = payouts.map((payout) => BigInt(String(payout)));
      const combinedBets = unclaimedBets.map((event, i) => ({
        ...event,
        payout: formattedPayouts[i],
      }));
      const claimableBets = combinedBets.filter(
        (event) => event.payout > BigInt(0) && (event?.resultIndex ?? -1) >= 0
      );
      setClaimableBets(claimableBets);
      isFetching.current = false;
      setFetchingBets(false);
    };
    init();
  }, [
    user?.address,
    wagmiAddress,
    counter,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => prev + 1);
    }, 1000 * 60 * 15);

    return () => clearInterval(interval);
  }, []);

  return { claimableBets, fetchingBets };
};
