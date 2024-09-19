import React, { useEffect } from "react";
import { HomePageBooEventTokenCountdown } from "./HomepageBooEventCountdown";
import { HomePageBooEventStreamPage } from "./HomepageBooEventStreamPage";
import {
  ChannelProvider,
  useChannelContext,
} from "../../hooks/context/useChannel";
import { SolanaProvider } from "../../hooks/context/useSolana";
import { useUser } from "../../hooks/context/useUser";
import { Box, useToast, Flex, Text, Button } from "@chakra-ui/react";
import { CHANNEL_STATIC_QUERY } from "../../constants/queries";
import { useQuery } from "@apollo/client";

export const eventStartTime = 1933548029;
const slug = "danny";

const BooEventWrapper = () => {
  return (
    <SolanaProvider>
      <ChannelProvider providedSlug={slug}>
        <BooEventWrapperWithSolana />
      </ChannelProvider>
    </SolanaProvider>
  );
};

const BooEventWrapperWithSolana = () => {
  const { channel } = useChannelContext();
  const { handleChannelStaticData } = channel;
  const { activeWallet, handleSolanaAddress, fetchAndSetUserData } = useUser();

  const toast = useToast();

  const { data: channelStatic } = useQuery(CHANNEL_STATIC_QUERY, {
    variables: { slug },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (channelStatic) handleChannelStaticData(channelStatic?.getChannelBySlug);
  }, [channelStatic]);

  useEffect(() => {
    if (
      activeWallet &&
      activeWallet.walletClientType === "phantom" &&
      (window as any)?.solana
    ) {
      const toastId = `solana-prompt-address-adoption-${activeWallet?.address}`;
      if (!toast.isActive(toastId)) {
        toast({
          isClosable: true,
          duration: null,
          id: toastId,
          render: () => (
            <Box bg="rgba(171,159,242,255)" p="10px" borderRadius="15px">
              <Flex direction="column">
                <Text
                  color="#3c315b"
                  fontFamily="Inter"
                  fontSize="20px"
                  fontWeight={"bold"}
                >
                  Would you like to use your solana address as your identity?
                </Text>
                <Text color="#3c315b" fontFamily="Inter">
                  This will affect your profile, how you chat, and how you use
                  certain app features.
                </Text>
                <Flex justifyContent={"space-evenly"}>
                  <Button
                    onClick={() => {
                      toast.close(toastId);
                      console.log("window connecting to phantom");
                      (window as any)?.solana.connect();
                      (window as any)?.solana.on("connect", () => {
                        fetchAndSetUserData(
                          (window as any)?.solana.publicKey.toBase58()
                        );
                        handleSolanaAddress(
                          (window as any)?.solana.publicKey.toBase58()
                        );
                      });
                    }}
                  >
                    Use Solana Address
                  </Button>
                  <Button
                    onClick={() => {
                      toast.close(toastId);
                      handleSolanaAddress(undefined);
                      fetchAndSetUserData(activeWallet?.address);
                    }}
                  >
                    Stay with Ethereum Address
                  </Button>
                </Flex>
              </Flex>
            </Box>
          ),
        });
      }
    } else {
      handleSolanaAddress(undefined);
    }
  }, [activeWallet?.walletClientType, (window as any)?.solana]);

  return (
    <>
      {true ? (
        <HomePageBooEventStreamPage slug={slug} />
      ) : (
        <HomePageBooEventTokenCountdown />
      )}
    </>
  );
};

export default BooEventWrapper;
