import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { useEffect } from "react";
import cookieCutter from "cookie-cutter";
import addWeeks from "date-fns/addWeeks";

type Visibility = "always" | "connected" | "not_connected";

const ConnectWallet: React.FunctionComponent<{
  show?: Visibility;
}> = ({ show = "always" }) => {
  const { isConnected, address } = useAccount();

  useEffect(() => {
    cookieCutter.set("unlonelyAddress", address || "", {
      expires: addWeeks(new Date(), 2),
    });
  }, [address]);

  if (
    (show === "connected" && !isConnected) ||
    (show === "not_connected" && isConnected)
  )
    return null;

  return <ConnectKitButton />;
};

export default ConnectWallet;
