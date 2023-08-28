import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNetwork } from "wagmi";
import { useToast, ToastId } from "@chakra-ui/react";

export const useNetworkContext = () => {
  return useContext(NetworkContext);
};

const NetworkContext = createContext<{
  network: {
    chainId: number;
    matchingChain: boolean;
  };
}>({
  network: {
    chainId: 0,
    matchingChain: true,
  },
});

export const NetworkProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>();
  const { chain } = useNetwork();

  const [matchingChain, setMatchingChain] = useState<boolean>(true);

  useEffect(() => {
    if (chain?.id && chain?.id !== 1) {
      toastIdRef.current = toast({
        title: "wrong network",
        description: "please connect to the ethereum mainnet",
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
      setMatchingChain(false);
    } else {
      if (toastIdRef.current) {
        toast.close(toastIdRef.current);
      }
      setMatchingChain(true);
    }
  }, [chain]);

  const value = useMemo(() => {
    return {
      network: {
        chainId: chain?.id ?? 0,
        matchingChain,
      },
    };
  }, [chain, matchingChain]);

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
};

export default NetworkContext;
