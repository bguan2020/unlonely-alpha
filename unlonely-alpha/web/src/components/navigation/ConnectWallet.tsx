import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";
import { usePrivyWagmi } from "@privy-io/wagmi-connector";
import { useCallback, useState } from "react";

import { useUser } from "../../hooks/context/useUser";
import centerEllipses from "../../utils/centerEllipses";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";

const ConnectWallet = ({
  shouldSayDisconnect,
}: {
  shouldSayDisconnect?: boolean;
}) => {
  const { user, loginMethod, userAddress } = useUser();
  const { login, ready, linkWallet, logout } = usePrivy();
  const { wallet: activeWallet } = usePrivyWagmi();
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const callLogout = useCallback(() => {
    logout();
    setIsCloseModalOpen(false);
  }, []);

  const redirectToBridge = () => {
    window.open(`${window.location.origin}/bridge`, "_blank");
  };

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
                <Menu>
                  <Flex
                    p="1px"
                    bg={
                      "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
                    }
                  >
                    <MenuButton
                      width={"100%"}
                      as={Button}
                      borderRadius="0"
                      _hover={{ bg: "#020202" }}
                      _focus={{}}
                      _active={{}}
                      bg={"#131323"}
                      rightIcon={<ChevronDownIcon />}
                    >
                      <Text>{centerEllipses(userAddress, 13)}</Text>
                    </MenuButton>
                  </Flex>

                  <MenuList zIndex={5} bg={"#131323"} borderRadius="0">
                    <MenuItem
                      _hover={{ bg: "#1f1f3c" }}
                      _focus={{}}
                      _active={{}}
                      onClick={redirectToBridge}
                    >
                      bridge
                    </MenuItem>
                    <MenuItem
                      _hover={{ bg: "#1f1f3c" }}
                      _focus={{}}
                      _active={{}}
                      onClick={() => setIsCloseModalOpen(true)}
                    >
                      logout
                    </MenuItem>
                  </MenuList>
                </Menu>
              </>
            ) : (
              <Menu>
                <Flex
                  p="1px"
                  bg={
                    "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
                  }
                >
                  <MenuButton
                    width={"100%"}
                    as={Button}
                    borderRadius="0"
                    _hover={{ bg: "#020202" }}
                    _focus={{}}
                    _active={{}}
                    bg={"#131323"}
                    rightIcon={<ChevronDownIcon />}
                  >
                    <Text>Connect</Text>
                  </MenuButton>
                </Flex>

                <MenuList zIndex={5} bg={"#131323"} borderRadius="0">
                  <MenuItem
                    _hover={{ bg: "#1f1f3c" }}
                    _focus={{}}
                    _active={{}}
                    onClick={linkWallet}
                  >
                    connect
                  </MenuItem>
                  <MenuItem
                    _hover={{ bg: "#1f1f3c" }}
                    _focus={{}}
                    _active={{}}
                    onClick={redirectToBridge}
                  >
                    bridge
                  </MenuItem>
                </MenuList>
              </Menu>
            )
          ) : (
            <Menu>
              <Flex
                p="1px"
                bg={
                  "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)"
                }
              >
                <MenuButton
                  width={"100%"}
                  as={Button}
                  borderRadius="0"
                  _hover={{ bg: "#020202" }}
                  _focus={{}}
                  _active={{}}
                  bg={"#131323"}
                  rightIcon={<ChevronDownIcon />}
                >
                  <Text>Login</Text>
                </MenuButton>
              </Flex>

              <MenuList zIndex={5} bg={"#131323"} borderRadius="0">
                <MenuItem
                  _hover={{ bg: "#1f1f3c" }}
                  _focus={{}}
                  _active={{}}
                  onClick={login}
                >
                  login
                </MenuItem>
                <MenuItem
                  _hover={{ bg: "#1f1f3c" }}
                  _focus={{}}
                  _active={{}}
                  onClick={redirectToBridge}
                >
                  bridge
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </>
      ) : (
        <Spinner size="xl" />
      )}
    </>
  );
};

export default ConnectWallet;
