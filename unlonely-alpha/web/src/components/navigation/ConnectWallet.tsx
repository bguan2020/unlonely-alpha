import { Button, Flex, Text } from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";
import { usePrivyWagmi } from "@privy-io/wagmi-connector";

import centerEllipses from "../../utils/centerEllipses";

const ConnectWallet = () => {
  const { login, ready, authenticated, logout } = usePrivy();
  const { wallet: activeWallet } = usePrivyWagmi();

  if (!ready) return null;

  if (!authenticated) {
    // Use Privy login instead of wagmi's connect
    return (
      <Flex
        p="1px"
        bg={
          "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
        }
        borderRadius="10px"
      >
        <Button
          onClick={login}
          _hover={{}}
          _focus={{}}
          _active={{}}
          bg={"#131323"}
          borderRadius="10px"
        >
          <Text>Login</Text>
        </Button>
      </Flex>
    );
  }

  return (
    <Flex
      p="1px"
      bg={
        "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
      }
      borderRadius="10px"
    >
      <Button
        _hover={{}}
        _focus={{}}
        _active={{}}
        bg={"#131323"}
        borderRadius="10px"
        onClick={logout}
      >
        <Text>{centerEllipses(activeWallet?.address, 13)}</Text>
      </Button>
    </Flex>
  );
};

export default ConnectWallet;
