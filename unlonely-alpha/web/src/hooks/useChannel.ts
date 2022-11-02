import Ably from "ably/promises";
import { useEffect } from "react";
import { useUser } from "./useUser";

const ably = new Ably.Realtime.Promise({ authUrl: `/api/createTokenRequest` });

export default function useChannel(
  channelName: string,
  callbackOnMessage: (message: any) => void
) {
  const channel = ably.channels.get(channelName);

  // explain this code below
  const onMount = () => {
    channel.subscribe((msg) => {
      callbackOnMessage(msg);
    });
  };

  const onUnmount = () => {
    channel.unsubscribe();
  };

  const useEffectHook = () => {
    onMount();
    return () => {
      onUnmount();
    };
  };

  useEffect(useEffectHook);

  return [channel, ably];
}
