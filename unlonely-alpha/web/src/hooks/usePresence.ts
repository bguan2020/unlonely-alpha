import { Types } from "ably";
import Ably from "ably/promises";
import { useEffect, useState } from 'react';
import { User } from "../generated/graphql.jsx";

export type PresenceDataAndPresenceUpdateFunction<T> = [
    presenceData: PresenceMessage<T>[],
    updateStatus: (messageOrPresenceObject: T) => void
];

export type OnPresenceMessageReceived<T> = (presenceData: PresenceMessage<T>) => void;
export type UseStatePresenceUpdate = (presenceData: Types.PresenceMessage[]) => void;

const ably = new Ably.Realtime.Promise({ authUrl: `/api/createTokenRequest` });

export function usePresence<T = any>(channelNameOrNameAndOptions: any, user: User | undefined): PresenceDataAndPresenceUpdateFunction<T> {

    const channelName = typeof channelNameOrNameAndOptions === 'string'
        ? channelNameOrNameAndOptions 
        : channelNameOrNameAndOptions.channelName;

    const channel = typeof channelNameOrNameAndOptions === 'string'
        ? ably.channels.get(channelName) 
        : ably.channels.get(channelName, channelNameOrNameAndOptions.options);

    const [presenceData, updatePresenceData] = useState([]) as [any, any];

    const updatePresence = async (message?: Types.PresenceMessage) => {
      const snapshot = await channel.presence.get();
      updatePresenceData(snapshot);
  }

    const onMount = async () => {
        channel.presence.subscribe("enter", updatePresence);
        channel.presence.subscribe("leave", updatePresence);
        channel.presence.subscribe("update", updatePresence);
        await channel.presence.enter({ user });

        const snapshot = await channel.presence.get();
        updatePresenceData(snapshot);
    }

    const onUnmount = () => {
        channel.presence.leave();
        channel.presence.unsubscribe("enter");
        channel.presence.unsubscribe("leave");
        channel.presence.unsubscribe("update");
    }

    const useEffectHook = () => {
        onMount();
        return () => { onUnmount(); };
    };

    useEffect(useEffectHook, []);
    
    const updateStatus = (messageOrPresenceObject: T) => {
        channel.presence.update(messageOrPresenceObject);
    };

    return [presenceData, updateStatus];
}

interface PresenceMessage<T = any> {
    action: Types.PresenceAction;
    clientId: string;
    connectionId: string;
    data: T;
    encoding: string;
    id: string;
    timestamp: number;
}
