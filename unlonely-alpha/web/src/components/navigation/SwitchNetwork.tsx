import { Button, Text } from "@chakra-ui/react";
import { useNetwork, useAccount } from "wagmi";

import WalletModalBody from "../general/WalletModal/WalletModalBody";
import WalletModalFooter from "../general/WalletModal/WalletModalFooter";
import WalletModalHeader from "../general/WalletModal/WalletModalHeader";
import WalletModalRoot from "../general/WalletModal/WalletModalRoot";
import { ETHEREUM_MAINNET_CHAIN_ID } from "../../constants";

const SwitchNetwork: React.FunctionComponent = () => {
  const [_, switchNetwork] = useNetwork();
  const [__, disconnect] = useAccount({
    fetchEns: false,
  });

  return (
    <WalletModalRoot
      TriggerButton={<Button variant="shiny.red">WRONG NETWORK</Button>}
    >
      <WalletModalHeader
        styles={
          !switchNetwork
            ? { minHeight: "100px", gap: "25px", justifyContent: "flex-end" }
            : { minHeight: "100px", gap: "25px" }
        }
      >
        Wrong Network!
      </WalletModalHeader>
      <WalletModalBody>
        <Text
          textAlign="center"
          fontSize="16px"
          fontWeight="600"
          lineHeight="22px"
          marginBottom="10px"
          marginTop="4px"
        >
          Please switch to Mainnet from your wallet
        </Text>
      </WalletModalBody>
      <WalletModalFooter>
        {switchNetwork && (
          <Button
            variant="full"
            background="#101D94"
            borderRadius="sm"
            onClick={async () => {
              await switchNetwork(ETHEREUM_MAINNET_CHAIN_ID);
            }}
          >
            Switch to Mainnet
          </Button>
        )}
        <Button
          variant="full"
          borderRadius="sm"
          onClick={disconnect}
          display={["none", "inline-flex"]}
        >
          Sign Out
        </Button>
      </WalletModalFooter>
    </WalletModalRoot>
  );
};

export default SwitchNetwork;
