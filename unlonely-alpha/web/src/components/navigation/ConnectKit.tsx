import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { useEffect } from "react";
import cookieCutter from "cookie-cutter";
import addWeeks from "date-fns/addWeeks";
import { Button, Flex, Text } from "@chakra-ui/react";

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

  return (
    <ConnectKitButton.Custom>
      {({
        isConnected,
        isConnecting,
        show,
        hide,
        truncatedAddress,
        ensName,
      }) => {
        return (
          <Flex
            p="1px"
            bg={
              "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
            }
            borderRadius="10px"
          >
            <Button
              onClick={show}
              _hover={{}}
              _focus={{}}
              _active={{}}
              bg={"#131323"}
              borderRadius="10px"
            >
              <Text>{isConnected ? truncatedAddress : "Connect"}</Text>
            </Button>
          </Flex>
        );
      }}
    </ConnectKitButton.Custom>
  );
};

export default ConnectWallet;
