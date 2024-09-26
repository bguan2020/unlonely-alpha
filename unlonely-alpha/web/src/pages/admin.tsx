import {
  Button,
  Flex,
  Input,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";

import AppLayout from "../components/layout/AppLayout";
import { useUser } from "../hooks/context/useUser";
import AdminNotifications from "../components/general/AdminNotifications";
import useSoftDeleteChannel from "../hooks/server/channel/useSoftDeleteChannel";
import { TempTokenAdmin } from "../components/admin/TempTokenAdmin";
import Metrics from "./metrics";
import Header from "../components/navigation/Header";
import { ADMIN_GRAPH_QUERY_PARAM } from "../constants";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import ModalTerminal, {
  IFormConfigurator,
  INITIAL_FORM_CONFIG,
} from "../components/transactions/SolanaJupiterTerminal";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
const admins = process.env.NEXT_PUBLIC_ADMINS?.split(",");

export default function AdminPage() {
  const { user } = useUser();

  const isAdmin = useMemo(() => {
    if (admins !== undefined && user?.address) {
      const userAddress = user.address;
      return admins.some((admin) => userAddress === admin);
    }
    return false;
  }, [user, admins]);

  const { watch, reset, setValue, formState } = useForm<IFormConfigurator>({
    defaultValues: INITIAL_FORM_CONFIG,
  });

  const watchAllFields = watch();

  // Set the network to use (e.g., 'mainnet-beta', 'devnet')
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = clusterApiUrl(network);

  // Initialize wallet adapters you want to support
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

  return (
    <AppLayout isCustomHeader={false} noHeader>
      <Header />
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <ModalTerminal
              rpcUrl={
                "https://solana-mainnet.g.alchemy.com/v2/-D7ZPwVOE8mWLx2zsHpYC2dpZDNkhzjf"
              }
              formProps={watchAllFields.formProps}
              simulateWalletPassthrough={
                watchAllFields.simulateWalletPassthrough
              }
              strictTokenList={watchAllFields.strictTokenList}
              defaultExplorer={watchAllFields.defaultExplorer}
              useUserSlippage={watchAllFields.useUserSlippage}
            />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
      {isAdmin && <AdminContent />}
      {!isAdmin && <Text>You're not supposed to be here.</Text>}
    </AppLayout>
  );
}

const AdminContent = () => {
  const toast = useToast();
  const [isGraphs, setIsGraphs] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (router.query[ADMIN_GRAPH_QUERY_PARAM]) setIsGraphs(true);
  }, [router]);

  const [channelSlugToDelete, setChannelSlugToDelete] = useState<string>("");
  const { softDeleteChannel, loading: softDeleteChannelLoading } =
    useSoftDeleteChannel({
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Channel soft deleted",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setChannelSlugToDelete("");
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete channel",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      },
    });

  return (
    <Flex direction="column" p="10px" gap="20px" bg="#131323">
      <Button onClick={() => setIsGraphs((prev) => !prev)}>
        {isGraphs ? "go to functions" : "go to graphs"}
      </Button>
      {isGraphs ? (
        <Metrics />
      ) : (
        <>
          <Text fontSize="25px" fontFamily="Neue Pixel Sans">
            delete channel
          </Text>
          <Flex gap={"10px"} alignItems="flex-end">
            <VStack>
              <Text>slug</Text>
              <Input
                variant="glow"
                width="300px"
                isInvalid={channelSlugToDelete.length === 0}
                value={channelSlugToDelete}
                onChange={(e) => setChannelSlugToDelete(e.target.value)}
              />
            </VStack>
            {softDeleteChannelLoading ? (
              <Spinner />
            ) : (
              <Button
                color="white"
                bg="#2562db"
                _hover={{}}
                _focus={{}}
                _active={{}}
                onClick={() =>
                  softDeleteChannel({
                    slug: channelSlugToDelete,
                  })
                }
                isDisabled={channelSlugToDelete.length === 0}
              >
                Send
              </Button>
            )}
          </Flex>
          <Text fontSize="25px" fontFamily="Neue Pixel Sans">
            admin notifications
          </Text>
          <AdminNotifications />
          <TempTokenAdmin />
        </>
      )}
    </Flex>
  );
};
