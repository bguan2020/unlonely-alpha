import { Button, Flex } from "@chakra-ui/react";
import { useConnect } from "wagmi";
import { useEffect, useState } from "react";

import WalletConnectIcon from "../icons/WalletConnectIcon";
import MetaMaskIcon from "../icons/MetaMaskIcon";
import WalletModalHeader from "../general/WalletModal/WalletModalHeader";
import WalletModalRoot from "../general/WalletModal/WalletModalRoot";
import WalletModalBody from "../general/WalletModal/WalletModalBody";
import WalletModalFooter from "../general/WalletModal/WalletModalFooter";
import WalletModalPopup from "../general/WalletModal/WalletModalPopup";

const ConnectAccount: React.FunctionComponent = () => {
  const [
    { data: connectionData, error: connectError, loading: connectLoading },
    connect,
  ] = useConnect();
  const [displayErrorModal, setDisplayErrorModal] = useState(false);
  useEffect(() => {
    setDisplayErrorModal(true);
  }, [connectError]);

  return (
    <WalletModalRoot
      TriggerButton={
        <Button
          background="#717BA7"
          color="white"
          borderRadius="20px"
          marginRight="20px"
        >
          <Flex fontSize="15px" fontWeight="medium">
            Connect Wallet
          </Flex>
        </Button>
      }
    >
      <WalletModalHeader styles={{ marginTop: "33px" }}>
        {connectError && displayErrorModal ? (
          <>Error Connecting: {connectError.message}</>
        ) : (
          "Connect Your Wallet!"
        )}
      </WalletModalHeader>
      <WalletModalBody
        styles={{
          minHeight:
            connectError && displayErrorModal ? "fit-content" : "100px",
        }}
      >
        {connectError && displayErrorModal
          ? "Error connecting to wallet."
          : "Sign into your wallet to authenticate."}
      </WalletModalBody>
      <WalletModalFooter>
        {connectError && displayErrorModal ? (
          <Button
            marginTop="10px"
            variant="full"
            onClick={async () => {
              await setDisplayErrorModal(false);
            }}
          >
            Close
          </Button>
        ) : (
          <>
            <Button
              //display={["none", "inline-flex"]}
              variant="full"
              borderRadius="sm"
              leftIcon={<MetaMaskIcon w="24px" h="24px" />}
              onClick={() => {
                connect(connectionData.connectors[0]);
              }}
            >
              MetaMask
            </Button>
            <Button
              variant="full"
              borderRadius="sm"
              leftIcon={<WalletConnectIcon w="24px" h="24px" />}
              onClick={() => {
                connect(connectionData.connectors[1]);
              }}
            >
              WalletConnect
            </Button>
          </>
        )}
        <WalletModalPopup
          styles={{
            display:
              connectLoading && !connectionData.connected ? "block" : "none",
          }}
        >
          Awaiting connection...
        </WalletModalPopup>
      </WalletModalFooter>
    </WalletModalRoot>
  );
};

export default ConnectAccount;
