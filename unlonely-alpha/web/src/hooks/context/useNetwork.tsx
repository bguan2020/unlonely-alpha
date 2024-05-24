import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useToast,
  ToastId,
  Box,
  Button,
  Flex,
  Text,
  IconButton,
  Image,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { TbWorldExclamation } from "react-icons/tb";

import { NETWORKS } from "../../constants/networks";
import { Network } from "../../constants/types";
import { useUser } from "./useUser";
import { useWallets } from "@privy-io/react-auth";

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
  const { wallets } = useWallets();
  const { user } = useUser();
  const localNetwork = useMemo(() => {
    const chain = wallets[0]?.chainId?.split(":")[1];
    return (
      NETWORKS.find((n) => String(n.config.chainId) === chain) ?? NETWORKS[0]
    );
  }, [wallets]);

  const _explorerUrl = useMemo(
    () => localNetwork.blockExplorers?.default.url,
    [localNetwork]
  );

  useEffect(() => {
    if (
      wallets[0] &&
      user?.address &&
      wallets[0]?.chainId?.split(":")[1] &&
      wallets[0]?.chainId?.split(":")[1] !==
        String(NETWORKS[0].config.chainId) &&
      !router.pathname.startsWith("/bridge")
    ) {
      toastIdRef.current = toast({
        id: "network-warning",
        duration: null,
        isClosable: true,
        position: "top",
        render: () => (
          <Box borderRadius="md" bg="#c21c1c" p="10px">
            <Flex direction={"column"}>
              <Flex justifyContent={"space-between"} alignItems="center">
                <Text textAlign="center" fontSize="18px">
                  <Flex alignItems={"center"} gap="10px">
                    <TbWorldExclamation /> wrong network
                  </Flex>
                </Text>
                <IconButton
                  aria-label="close"
                  _hover={{}}
                  _active={{}}
                  _focus={{}}
                  bg="transparent"
                  icon={<Image alt="close" src="/svg/close.svg" width="20px" />}
                  onClick={() => {
                    if (toastIdRef.current) toast.close(toastIdRef.current);
                  }}
                />
              </Flex>
              <Button
                borderRadius="25px"
                bg={"#131323"}
                _hover={{ transform: "scale(1.05)" }}
                _focus={{}}
                _active={{}}
                color="white"
                onClick={async () => {
                  if (toastIdRef.current) toast.close(toastIdRef.current);
                  await wallets[0].switchChain(NETWORKS[0].config.chainId);
                }}
              >
                <Text fontSize="20px">switch to base</Text>
              </Button>
            </Flex>
          </Box>
        ),
      });
      setMatchingChain(false);
    } else {
      if (toastIdRef.current) {
        toast.close(toastIdRef.current);
      }
      setMatchingChain(true);
    }
  }, [user, wallets, router.pathname]);

  const value = useMemo(() => {
    return {
      network: {
        chainId:
          Number(wallets[0]?.chainId?.split(":")[1]) ??
          NETWORKS[0].config.chainId,
        matchingChain,
        localNetwork,
        explorerUrl: _explorerUrl ?? "",
      },
    };
  }, [wallets, matchingChain, localNetwork, _explorerUrl]);

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
};
