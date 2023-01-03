import { Box, Flex } from "@chakra-ui/react";
import { useModal } from "connectkit";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import ConnectWallet from "../../components/navigation/ConnectKit";

const styles = `
  html, body {
    background: transparent !important;
  }

  .hkQOmQ {
    --ck-overlay-background: transparent !important;
  }

  .mobile-connectkit-button-load-in-transition {
    opacity: 0;
    animation: ck-load-mobile 0.25s 1s ease forwards;
    padding-bottom: 12px;
  }

  @keyframes ck-load-mobile {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

export default function MobileConnectWallet() {
  const { setOpen } = useModal();
  const account = useAccount({
    onConnect({ address }) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.ReactNativeWebView.postMessage(address);
    },
    onDisconnect() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.ReactNativeWebView.postMessage("wallet_disconnected");
    },
  });

  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <Flex
      flexDirection="column"
      justifyContent="flex-end"
      alignItems="center"
      width="100%"
      height="100svh"
    >
      <style>{styles}</style>
      <div className="mobile-connectkit-button-load-in-transition">
        <Box
          borderRadius="20px"
          bgGradient="linear(to-r, #d16fce, #7655D2, #4173D6, #4ABBDF)"
          padding={2}
        >
          <ConnectWallet />
        </Box>
      </div>
    </Flex>
  );
}
