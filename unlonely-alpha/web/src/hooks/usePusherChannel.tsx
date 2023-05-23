import { createContext, useContext, useEffect, ReactNode } from "react";
import Pusher from "pusher-js";

const PUSHER_APP_KEY = process.env.REACT_APP_PUSHER_APP_KEY || "93678cd36c050bfa28fd";
const PUSHER_APP_CLUSTER = process.env.REACT_APP_PUSHER_APP_CLUSTER || "us3";

// Initialize pusher instance
const pusher = new Pusher(PUSHER_APP_KEY, {
  cluster: PUSHER_APP_CLUSTER,
});

// Create context
const PusherContext = createContext<Pusher | undefined>(undefined);

// Define the prop types for your provider component
interface PusherProviderProps {
  children: ReactNode;
}

export const PusherProvider: React.FC<PusherProviderProps> = ({ children }) => {
  return (
    <PusherContext.Provider value={pusher}>
      {children}
    </PusherContext.Provider>
  );
};

// Define the callback type
type CallbackType = (data: any) => void;

// Create custom hook
export const usePusherChannel = (channelName: string, eventName: string, callback: CallbackType) => {
  const pusher = useContext(PusherContext);
  
  if (!pusher) {
    throw new Error('usePusherChannel must be used within a PusherProvider');
  }

  const channel = pusher.subscribe(channelName);

  useEffect(() => {
    channel.bind(eventName, callback);

    return () => {
      channel.unbind(eventName, callback);
      pusher.unsubscribe(channelName);
    };
  }, [channel, eventName, callback]);

  return channel;
};

