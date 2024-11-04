import { useLazyQuery } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { createPublicClient, http } from "viem";
import { Contract, EventTypeForContract } from "../../constants";
import { NETWORKS } from "../../constants/networks";
import { GET_UNCLAIMED_EVENTS_QUERY } from "../../constants/queries";
import { GetUnclaimedEventsQuery, SharesEvent } from "../../generated/graphql";
import { useUser } from "../context/useUser";
import { getContractFromNetwork } from "../../utils/contract";
import { useNetworkContext } from "../context/useNetwork";

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
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const contractData = getContractFromNetwork(Contract.SHARES_V2, localNetwork);

  const [getUnclaimedEvents] = useLazyQuery<GetUnclaimedEventsQuery>(
    GET_UNCLAIMED_EVENTS_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

  useEffect(() => {
    const init = async () => {
      if (
        !contractData.address ||
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
      let unclaimedBets: SharesEvent[] = [];
      try {
        const data = await getUnclaimedEvents({
          variables: {
            data: {
              userAddress: user?.address as `0x${string}`,
              chainId: contractData.chainId,
            },
          },
        });
        unclaimedBets =
          data?.data?.getUnclaimedEvents?.filter(
            (event): event is SharesEvent =>
              event !== null && event?.chainId === contractData.chainId
          ) || [];
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
        const promises = unclaimedBets.map((event) =>
          publicClient.readContract({
            address: contractData.address,
            abi: contractData.abi,
            functionName: "getVotePayout",
            args: [
              event.sharesSubjectAddress as string,
              event.id,
              EventTypeForContract.YAY_NAY_VOTE,
              user?.address as `0x${string}`,
            ],
          })
        );
        payouts = await Promise.all(promises);
      } catch (err) {
        console.log("claimpage getVotePayout", err);
        payouts = [];
      }
      const formattedPayouts = payouts.map((payout) => BigInt(String(payout)));
      const combinedBets = unclaimedBets.map((event, i) => ({
        ...event,
        payout: formattedPayouts[i],
      }));
      const claimableBets = combinedBets?.filter(
        (event) => event.payout > BigInt(0) && (event?.resultIndex ?? -1) >= 0
      );
      setClaimableBets(claimableBets);
      isFetching.current = false;
      setFetchingBets(false);
    };
    init();
  }, [user?.address, contractData.address, wagmiAddress, counter]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => prev + 1);
    }, 1000 * 60 * 15);

    return () => clearInterval(interval);
  }, []);

  return { claimableBets, fetchingBets };
};
