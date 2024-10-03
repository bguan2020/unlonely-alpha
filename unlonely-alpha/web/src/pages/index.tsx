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
import { useMemo } from "react";

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
  const { connectWallet } = useConnectWallet({
    onError: (err) => {
      console.error("connect wallet error", err);
    },
  });

  return (
    <>
      <p style={{ color: "black" }}>
        hello privy, {wallets.length} {ready} {authenticated}
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
      <button onClick={exportWallet}>Export Wallet</button>
      <button onClick={linkWallet}>Link Wallet</button>
      <button
        onClick={() => {
          const foundWallet = wallets.find(
            (wallet) => (wallet as any).type === "solana"
          );
          if (foundWallet) unlinkWallet(foundWallet.address);
        }}
      >
        Unlink Wallet
      </button>
    </>
  );
}
