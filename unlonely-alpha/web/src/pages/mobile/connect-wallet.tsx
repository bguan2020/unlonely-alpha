import { Flex } from "@chakra-ui/react";
import ConnectWallet from "../../components/navigation/ConnectKit";

export default function Chat() {
  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100svh"
    >
      <ConnectWallet />
    </Flex>
  );
}
