import React, { useEffect } from "react";
import { HomePageBooEventTokenCountdown } from "./HomepageBooEventCountdown";
import { HomePageBooEventStreamPage } from "./HomepageBooEventStreamPage";
import { ChannelProvider } from "../../hooks/context/useChannel";
import { SolanaProvider } from "../../hooks/context/useSolana";
import { useUser } from "../../hooks/context/useUser";
import { Box, useToast, Flex, Text, Button } from "@chakra-ui/react";

export const eventStartTime = 1933548029;
const slug = "danny";

const BooEventWrapper = () => {
  return (
    <SolanaProvider>
      <BooEventWrapperWithSolana />
    </SolanaProvider>
  );
};

const BooEventWrapperWithSolana = () => {
  const { activeWallet, handleInjectedUserData, handleSolanaAddress } =
    useUser();

  const toast = useToast();

  useEffect(() => {
    if (
      activeWallet &&
      activeWallet.walletClientType === "phantom" &&
      (window as any)?.solana
    ) {
      handleSolanaAddress((window as any)?.solana.publicKey.toBase58());
      handleInjectedUserData({
        username: undefined,
        address: undefined,
      });
      const toastId = `solana-prompt-address-adoption-${activeWallet?.address}`;
      if (!toast.isActive(toastId)) {
        toast({
          isClosable: true,
          duration: null,
          id: toastId,
          render: () => (
            <Box bg="rgba(171,159,242,255)" p="10px" borderRadius="15px">
              <Flex direction="column">
                <Text color="#3c315b" fontFamily="Inter">
                  Would you like to use your solana address as your username for
                  now?
                </Text>
                <Flex justifyContent={"space-evenly"}>
                  <Button
                    onClick={() => {
                      toast.close(toastId);
                      console.log("window connecting to phantom");
                      (window as any)?.solana.connect();
                      (window as any)?.solana.on("connect", () => {
                        handleInjectedUserData({
                          username: undefined,
                          address: (window as any)?.solana.publicKey.toBase58(),
                        });
                      });
                    }}
                  >
                    Yes
                  </Button>
                  <Button
                    onClick={() => {
                      toast.close(toastId);
                    }}
                  >
                    No
                  </Button>
                </Flex>
              </Flex>
            </Box>
          ),
        });
      }
    } else {
      handleInjectedUserData({
        username: undefined,
        address: undefined,
      });
      handleSolanaAddress(undefined);
    }
  }, [activeWallet?.walletClientType, (window as any)?.solana]);

  return (
    <>
      {true ? (
        <ChannelProvider providedSlug={slug}>
          <HomePageBooEventStreamPage slug={slug} />
        </ChannelProvider>
      ) : (
        <HomePageBooEventTokenCountdown />
      )}
    </>
  );
};

export default BooEventWrapper;
