import { useEffect, useState } from "react";
import { Contract, NULL_ADDRESS } from "../../../constants";
import { getContractFromNetwork } from "../../../utils/contract";
import { useNetworkContext } from "../../context/useNetwork";
import { useLazyQuery } from "@apollo/client";
import { Log } from "viem";
import { useContractEvent } from "wagmi";
import { GET_TEMP_TOKENS_QUERY } from "../../../constants/queries";
import { GetTempTokensQuery } from "../../../generated/graphql";
import { UseChannelDetailsType } from "../useChannelDetails";

export type UseReadTempTokenStateType = {
  currentActiveTokenAddress: string;
  currentActiveTokenEndTimestamp: bigint;
};

export const useReadTempTokenInitialState: UseReadTempTokenStateType = {
  currentActiveTokenAddress: NULL_ADDRESS,
  currentActiveTokenEndTimestamp: BigInt(0),
};

export const useReadTempTokenState = (  channelDetails: UseChannelDetailsType
    ): UseReadTempTokenStateType => {
    const { network } = useNetworkContext();
    const { localNetwork } = network;
    
    const [currentActiveTokenAddress, setCurrentActiveTokenAddress] =
    useState<string>(NULL_ADDRESS);
  const [currentActiveTokenEndTimestamp, setCurrentActiveTokenEndTimestamp] =
    useState<bigint>(BigInt(0));

    const factoryContract = getContractFromNetwork(
        Contract.TEMP_TOKEN_FACTORY_V1,
        localNetwork
      );
    
    const [incomingLogs, setIncomingLogs] = useState<Log[]>([]);

    useContractEvent({
        address: factoryContract.address,
        abi: factoryContract.abi,
        eventName: "TempTokenCreated",
        listener(logs) {
          console.log("detected TempTokenCreated event", logs);
          const init = async () => {
            setIncomingLogs(logs);
          };
          init();
        },
      });
    
      useEffect(() => {
        if (incomingLogs) handleUpdate(incomingLogs);
      }, [incomingLogs]);
    
      const handleUpdate = async (logs: Log[]) => {
        if (logs.length === 0) return;
        const filteredLogsByOwner = logs.filter(
          (log: any) =>
            (log.args.owner as `0x${string}`) ===
            channelDetails.channelQueryData?.owner.address
        );
        const sortedLogs = filteredLogsByOwner.sort(
          (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
        );
        if (sortedLogs.length === 0) return;
        const latestLog: any = sortedLogs[sortedLogs.length - 1];
        const newEndTimestamp = latestLog?.args.endTimestamp as bigint;
        const newTokenAddress = latestLog?.args.tokenAddress as `0x${string}`;
    
        setCurrentActiveTokenEndTimestamp(newEndTimestamp);
        setCurrentActiveTokenAddress(newTokenAddress);
      };
    
      const [getTempTokensQuery] = useLazyQuery<GetTempTokensQuery>(
        GET_TEMP_TOKENS_QUERY,
        {
          fetchPolicy: "network-only",
        }
      );

      useEffect(() => {
        const init = async () => {
          const res = await getTempTokensQuery({
            variables: {
              data: {
                channelId: String(channelDetails.channelQueryData?.id),
                chainId: localNetwork.config.chainId,
                onlyActiveTokens: true,
              },
            },
          });
          const listOfActiveTokens = res.data?.getTempTokens;
          const latestActiveToken = listOfActiveTokens?.[0];
          if (latestActiveToken) {
            setCurrentActiveTokenEndTimestamp(
              BigInt(latestActiveToken.endUnixTimestamp)
            );
            setCurrentActiveTokenAddress(latestActiveToken.tokenAddress);
          }
        };
        init();
      }, [channelDetails.channelQueryData?.id, localNetwork.config.chainId]);

    return {
        currentActiveTokenAddress,
        currentActiveTokenEndTimestamp,
    };
}