import { useModal } from "connectkit";
import { useEffect } from "react";
import { useAccount, useEnsAvatar, useEnsName } from "wagmi";

import NextHead from "../../components/layout/NextHead";
import ConnectWallet from "../../components/navigation/ConnectWallet";

export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default function MobileConnectWallet() {
  const { open, setOpen } = useModal();
  const account = useAccount({
    onConnect() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (window.ReactNativeWebView !== undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.ReactNativeWebView.postMessage("wallet_connected");
      }
    },
    onDisconnect() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (window.ReactNativeWebView !== undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.ReactNativeWebView.postMessage("wallet_disconnected");
      }
    },
  });
  const { data: ensName, isLoading: isNameLoading } = useEnsName({
    address: account.address,
  });
  const { data: ensAvatar, isLoading: isAvatarLoading } = useEnsAvatar({
    name: ensName,
  });

  useEffect(() => {
    const walletData = {
      address: account.address,
      ensName: ensName,
      ensAvatar: ensAvatar,
    };

    if (walletData.address && !isNameLoading && !isAvatarLoading) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (window.ReactNativeWebView !== undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.ReactNativeWebView.postMessage(JSON.stringify(walletData));
      }
    }
  }, [account, ensName, ensAvatar]);

  useEffect(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (window.ReactNativeWebView !== undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.ReactNativeWebView.postMessage("ck_modal_closed");
      }

      setTimeout(() => setOpen(true), 1000);
    }
  }, [open]);

  return (
    <>
      <NextHead
        title="Unlonely"
        image="/images/favicon-32x32.png"
        description="Never watch alone again."
      />
      <style jsx global>{`
        html,
        body {
          background: transparent !important;
        }

        *,
        *:before,
        *:after {
          user-select: none !important;
        }

        div[role="dialog"] {
          --ck-overlay-background: transparent !important;
        }

        .sc-iqcoie.fNQent button,
        .sc-fbPSWO.gZQqvL:nth-child(2) {
          display: none !important;
        }

        .enYPqY::before {
          border-radius: 50px !important;
        }

        .mobile-connectkit-button-load-in-transition {
          opacity: 0;
          display: none;
        }
      `}</style>
      <div className="mobile-connectkit-button-load-in-transition">
        <ConnectWallet />
      </div>
    </>
  );
}
