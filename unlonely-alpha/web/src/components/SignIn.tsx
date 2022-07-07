import { useAccount, useNetwork } from "wagmi";
import { useEffect } from "react";
import cookieCutter from "cookie-cutter";
import addWeeks from "date-fns/addWeeks";

import { ETHEREUM_MAINNET_CHAIN_ID } from "../constants";

import LoggedInAccount from "./navigation/LoggedInAccount";
import ConnectAccount from "./navigation/ConnectAccount";
import SwitchNetwork from "./navigation/SwitchNetwork";

const SignIn: React.FC = () => {
  const [{ data: accountData }] = useAccount({ fetchEns: true });
  const [network] = useNetwork();

  const address = accountData?.address;
  useEffect(() => {
    cookieCutter.set("unlonelyAddress", address || "", {
      expires: addWeeks(new Date(), 2),
    });
  }, [address]);

  return (
    <div>
      {accountData ? (
        network?.data?.chain?.id === ETHEREUM_MAINNET_CHAIN_ID ? (
          <>
            <LoggedInAccount />
          </>
        ) : (
          <SwitchNetwork />
        )
      ) : (
        <ConnectAccount />
      )}
    </div>
  );
};

export default SignIn;
