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
import { useRouter } from "next/router";

import { NETWORKS } from "../../constants/networks";
import { Network } from "../../constants/types";

export const useNetworkContext = () => {
  return useContext(NetworkContext);
};

const NetworkContext = createContext<{
  network: {
    chainId: number;
    matchingChain: boolean;
    localNetwork: Network;
    explorerUrl: string;
  };
}>({
  network: {
    chainId: 0,
    matchingChain: true,
    localNetwork: NETWORKS[0],
    explorerUrl: NETWORKS[0].blockExplorers?.default.url ?? "",
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
  const router = useRouter();

  const [matchingChain, setMatchingChain] = useState<boolean>(true);
  const localNetwork = useMemo(() => {
    return NETWORKS.find((n) => n.config.chainId === chain?.id) ?? NETWORKS[0];
  }, [chain]);

  const _explorerUrl = useMemo(
    () => localNetwork.blockExplorers?.default.url,
    [localNetwork]
  );

  useEffect(() => {
    if (
      chain?.id &&
      chain?.id !== NETWORKS[0].config.chainId &&
      !router.pathname.startsWith("/bridge")
    ) {
      toastIdRef.current = toast({
        title: "wrong network",
        description: "please connect to the base mainnet",
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
        chainId: chain?.id ?? NETWORKS[0].config.chainId,
        matchingChain,
        localNetwork,
        explorerUrl: _explorerUrl ?? "",
      },
    };
  }, [chain, matchingChain, localNetwork, _explorerUrl]);

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
};
