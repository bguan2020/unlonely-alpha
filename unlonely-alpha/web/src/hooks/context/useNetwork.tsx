import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useToast, ToastId } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { usePrivyWagmi } from "@privy-io/wagmi-connector";

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
  const router = useRouter();

  const [matchingChain, setMatchingChain] = useState<boolean>(true);
  const { wallet } = usePrivyWagmi();

  const localNetwork = useMemo(() => {
    const chain = wallet?.chainId?.split(":")[1];
    return (
      NETWORKS.find((n) => String(n.config.chainId) === chain) ?? NETWORKS[0]
    );
  }, [wallet]);

  const _explorerUrl = useMemo(
    () => localNetwork.blockExplorers?.default.url,
    [localNetwork]
  );

  useEffect(() => {
    if (
      wallet?.chainId?.split(":")[1] &&
      wallet?.chainId?.split(":")[1] !== String(NETWORKS[0].config.chainId) &&
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
  }, [wallet]);

  const value = useMemo(() => {
    return {
      network: {
        chainId:
          Number(wallet?.chainId?.split(":")[1]) ?? NETWORKS[0].config.chainId,
        matchingChain,
        localNetwork,
        explorerUrl: _explorerUrl ?? "",
      },
    };
  }, [wallet, matchingChain, localNetwork, _explorerUrl]);

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
};
