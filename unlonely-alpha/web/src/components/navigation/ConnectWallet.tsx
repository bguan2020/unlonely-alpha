import { Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";
import { usePrivyWagmi } from "@privy-io/wagmi-connector";
import { useCallback, useState } from "react";

import { useUser } from "../../hooks/context/useUser";
import centerEllipses from "../../utils/centerEllipses";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";

const ConnectWallet = () => {
  const { user, loginMethod, userAddress } = useUser();
  const { login, ready, linkWallet, logout } = usePrivy();
  const { wallet: activeWallet } = usePrivyWagmi();
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const callLogout = useCallback(() => {
    logout();
    setIsCloseModalOpen(false);
  }, []);

  return (
    <>
      {ready ? (
        <>
          {user ? (
            loginMethod === "privy" ||
            (loginMethod && loginMethod !== "privy" && activeWallet) ? (
              <>
                <TransactionModalTemplate
                  confirmButton="logout"
                  title="are you sure you want to log out?"
                  isOpen={isCloseModalOpen}
                  canSend={true}
                  onSend={callLogout}
                  isModalLoading={false}
                  handleClose={() => setIsCloseModalOpen(false)}
                />
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
                    onClick={() => setIsCloseModalOpen(true)}
                  >
                    <Text>{centerEllipses(userAddress, 13)}</Text>
                  </Button>
                </Flex>
              </>
            ) : (
              <Flex
                p="1px"
                bg={
                  "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
                }
                borderRadius="10px"
              >
                <Button
                  onClick={linkWallet}
                  _hover={{}}
                  _focus={{}}
                  _active={{}}
                  bg={"#131323"}
                  borderRadius="10px"
                >
                  <Text>Connect</Text>
                </Button>
              </Flex>
            )
          ) : (
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
          )}
        </>
      ) : (
        <Spinner size="xl" />
      )}
    </>
  );
};
export default ConnectWallet;
