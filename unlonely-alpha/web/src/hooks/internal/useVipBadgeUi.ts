import { useEffect } from "react";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import {
  useGenerateKey,
  useGetHolderBalance,
  useSupply,
} from "../contracts/useTournament";
import { CHAT_MESSAGE_EVENT, Contract, InteractionType } from "../../constants";
import { getContractFromNetwork } from "../../utils/contract";
import { useChannelContext } from "../context/useChannel";
import { useNetworkContext } from "../context/useNetwork";
import { useUser } from "../context/useUser";
import { ChatReturnType } from "../chat/useChat";
import { isAddress, isAddressEqual } from "viem";

export const useVipBadgeUi = (chat: ChatReturnType) => {
  const { user } = useUser();
  const { channel, leaderboard } = useChannelContext();
  const { network } = useNetworkContext();
  const { localNetwork } = network;
  const { channelQueryData, handleTotalBadges } = channel;
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
    user?.address as `0x${string}`,
    tournamentContract
  );

  useEffect(() => {
    const init = async () => {
      if (chat.receivedMessages.length === 0) return;
      const latestMessage =
        chat.receivedMessages[chat.receivedMessages.length - 1];
      if (
        latestMessage &&
        latestMessage.data.body &&
        latestMessage.name === CHAT_MESSAGE_EVENT &&
        Date.now() - latestMessage.timestamp < 12000
      ) {
        const body = latestMessage.data.body;
        if (
          body.split(":")[0] === InteractionType.BUY_BADGES &&
          Date.now() - latestMessage.timestamp < 12000
        ) {
          if (body.split(":")[4] === generatedKey) {
            if (
              isAddress(user?.address ?? "") &&
              isAddress(body.split(":")[1]) &&
              isAddressEqual(
                body.split(":")[1] as `0x${string}`,
                user?.address as `0x${string}`
              )
            ) {
              setVipBadgeBalance((prev) =>
                String(Number(prev) + Number(body.split(":")[2]))
              );
            }
            setVipBadgeSupply(BigInt(body.split(":")[3]));
          }
        }
      }
    };
    init();
  }, [chat.receivedMessages]);

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
};
