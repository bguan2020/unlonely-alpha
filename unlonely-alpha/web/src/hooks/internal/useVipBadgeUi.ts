import { useState, useEffect } from "react";
import { Log, isAddressEqual } from "viem";
import { useContractEvent } from "wagmi";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { useGenerateKey, useGetHolderBalance, useSupply } from "../contracts/useTournament";
import { Contract } from "../../constants";
import { getContractFromNetwork } from "../../utils/contract";
import { useChannelContext } from "../context/useChannel";
import { useNetworkContext } from "../context/useNetwork";
import { useUser } from "../context/useUser";

export const useVipBadgeUi = () => {
    const { userAddress } = useUser();
    const { channel, leaderboard } = useChannelContext();
    const { network } = useNetworkContext();
    const { localNetwork } = network;
    const {
      channelQueryData,
      handleTotalBadges,
    } = channel;
    const { handleIsVip } = leaderboard;

    const tournamentContract = getContractFromNetwork(
        Contract.TOURNAMENT,
        localNetwork
      );

    const { key: generatedKey } = useGenerateKey(
        channelQueryData?.owner?.address as `0x${string}`,
        0,
        tournamentContract
      );
    
      const { vipBadgeSupply, setVipBadgeSupply } = useSupply(
        generatedKey,
        tournamentContract
      );
    
      const { vipBadgeBalance, setVipBadgeBalance } = useGetHolderBalance(
        channelQueryData?.owner?.address as `0x${string}`,
        0,
        userAddress as `0x${string}`,
        tournamentContract
      );
    
      const handleUpdate = (tradeEvents: Log[]) => {
        const sortedEvents = tradeEvents.filter(
          (event: any) => (event?.args.trade.eventByte as string) === generatedKey
        );
        if (sortedEvents.length === 0) return;
        let newBalanceAddition = 0;
        for (let i = 0; i < sortedEvents.length; i++) {
          const tradeEvent: any = sortedEvents[i];
          const trader = tradeEvent?.args.trade.trader as `0x${string}`;
          if (userAddress && isAddressEqual(trader, userAddress as `0x${string}`)) {
            newBalanceAddition +=
              ((tradeEvent?.args.trade.isBuy as boolean) ? 1 : -1) *
              Number(tradeEvent?.args.trade.badgeAmount as bigint);
          }
        }
        setVipBadgeSupply(
          (sortedEvents[sortedEvents.length - 1] as any).args.trade.supply as bigint
        );
        setVipBadgeBalance((prev) => String(Number(prev) + newBalanceAddition));
      };
    
      const [incomingTrades, setIncomingTrades] = useState<Log[]>([]);
    
      useContractEvent({
        address: tournamentContract.address,
        abi: tournamentContract.abi,
        eventName: "Trade",
        listener(logs) {
          const init = async () => {
            setIncomingTrades(logs);
          };
          init();
        },
      });
    
      useEffect(() => {
        if (incomingTrades) handleUpdate(incomingTrades);
      }, [incomingTrades]);
    
      useEffect(() => {
        if (Number(vipBadgeBalance) > 0) {
          handleIsVip(true);
        } else {
          handleIsVip(false);
        }
      }, [vipBadgeBalance]);
    
      useEffect(() => {
        handleTotalBadges(truncateValue(Number(vipBadgeSupply), 0));
      }, [vipBadgeSupply]);
}