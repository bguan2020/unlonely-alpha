import {
  usePrivy,
  useWallets,
  useLogin,
  useLogout,
  useConnectWallet,
  WalletWithMetadata,
  ConnectedSolanaWallet,
} from "@privy-io/react-auth";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { useEffect, useMemo } from "react";
import { areAddressesEqual } from "../utils/validation/wallet";

export default function Page() {
  const {
    authenticated,
    ready,
    exportWallet,
    linkWallet,
    unlinkWallet,
    user: privyUser,
  } = usePrivy();
  const { wallets: evmWallets } = useWallets();
  const { wallets: solanaWallets } = useSolanaWallets();

  const wallets = useMemo(
    () => [...evmWallets, ...(solanaWallets as ConnectedSolanaWallet[])],
    [evmWallets, solanaWallets]
  );
  const { setActiveWallet } = useSetActiveWallet();

  const { connectWallet } = useConnectWallet({
    onError: (err) => {
      console.error("connect wallet error", err);
    },
  });

  useEffect(() => {
    const foundEvmWallet = evmWallets.find((w) =>
      areAddressesEqual(w.address, "")
    );
    if (foundEvmWallet) setActiveWallet(foundEvmWallet);
  }, [evmWallets, setActiveWallet]);

  return (
    <>
      <p style={{ color: "black" }}>
        hello privy, {wallets} {ready} {authenticated}
      </p>
      {privyUser?.linkedAccounts
        .filter((account) => account.type === "wallet")
        .map((account) => {
          const foundWallet = undefined;
          return (
            <div>
              <div>
                <button
                  onClick={() => {
                    if (foundWallet) {
                      connectWallet({
                        suggestedAddress: (account as WalletWithMetadata)
                          .address,
                      });
                    }
                  }}
                >
                  {foundWallet ? "set active" : "connect"}
                </button>
              </div>
            </div>
          );
        })}
      <button
        onClick={async () => {
          if (!authenticated) {
            await useLogin();
          } else {
            await useLogout();
          }
        }}
      >
        {authenticated ? "Logout" : "Login"}
      </button>
    </>
  );
}
