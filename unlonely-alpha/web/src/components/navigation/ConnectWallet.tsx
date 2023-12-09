import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Badge,
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

import { useCacheContext } from "../../hooks/context/useCache";
import { useUser } from "../../hooks/context/useUser";
import centerEllipses from "../../utils/centerEllipses";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";

const ConnectWallet = () => {
  const { user, loginMethod, userAddress } = useUser();
  const { login, ready, linkWallet, logout } = usePrivy();
  const { wallet: activeWallet } = usePrivyWagmi();
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const { claimableBets } = useCacheContext();

  const callLogout = useCallback(() => {
    logout();
    setIsCloseModalOpen(false);
  }, []);

  const redirectToBridge = () => {
    window.open(`${window.location.origin}/bridge`, "_blank");
  };

  const redirectToClaim = () => {
    window.open(`${window.location.origin}/claim`, "_blank");
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
                      color="white"
                      width={"100%"}
                      as={Button}
                      borderRadius="0"
                      _hover={{ bg: "#020202" }}
                      _focus={{}}
                      _active={{}}
                      px="10px"
                      bg={"#131323"}
                      rightIcon={<ChevronDownIcon />}
                    >
                      <Flex alignItems={"center"}>
                        <Text fontFamily="LoRes15" fontSize="15px">
                          {centerEllipses(userAddress, 13)}{" "}
                        </Text>
                        {claimableBets.length > 0 && (
                          <Text className="zooming-text">
                            <Badge
                              variant="solid"
                              ml="1"
                              bg="#c72d28"
                              fontSize="0.7em"
                            >
                              {claimableBets.length > 99
                                ? "99+"
                                : claimableBets.length}
                            </Badge>
                          </Text>
                        )}
                      </Flex>
                    </MenuButton>
                  </Flex>
                  <MenuList zIndex={5} bg={"#131323"} borderRadius="0">
                    {claimableBets.length > 0 && (
                      <MenuItem
                        bg={"#E09025"}
                        _hover={{ bg: "#f07c1d" }}
                        _focus={{}}
                        _active={{}}
                        onClick={redirectToClaim}
                      >
                        claim payouts{" "}
                        {claimableBets.length > 0 && (
                          <Text>
                            <Badge
                              variant="solid"
                              ml="1"
                              colorScheme="red"
                              fontSize="0.7em"
                            >
                              {claimableBets.length > 99
                                ? "99+"
                                : claimableBets.length}
                            </Badge>
                          </Text>
                        )}
                      </MenuItem>
                    )}
                    <MenuItem
                      bg={"#131323"}
                      _hover={{ bg: "#1f1f3c" }}
                      _focus={{}}
                      _active={{}}
                      onClick={redirectToBridge}
                    >
                      bridge to base ETH
                    </MenuItem>
                    <MenuItem
                      bg={"#131323"}
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
                    color="white"
                    width={"100%"}
                    as={Button}
                    borderRadius="0"
                    _hover={{ bg: "#020202" }}
                    _focus={{}}
                    _active={{}}
                    bg={"#131323"}
                    px="10px"
                    rightIcon={<ChevronDownIcon />}
                  >
                    <Text fontFamily="LoRes15" fontSize="15px">
                      Connect
                    </Text>
                  </MenuButton>
                </Flex>

                <MenuList zIndex={5} bg={"#131323"} borderRadius="0">
                  <MenuItem
                    bg={"#131323"}
                    _hover={{ bg: "#1f1f3c" }}
                    _focus={{}}
                    _active={{}}
                    onClick={linkWallet}
                  >
                    connect
                  </MenuItem>
                  <MenuItem
                    bg={"#131323"}
                    _hover={{ bg: "#1f1f3c" }}
                    _focus={{}}
                    _active={{}}
                    onClick={redirectToBridge}
                  >
                    bridge to base ETH
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
                  color="white"
                  width={"100%"}
                  as={Button}
                  borderRadius="0"
                  _hover={{ bg: "#020202" }}
                  _focus={{}}
                  _active={{}}
                  bg={"#131323"}
                  px="10px"
                  rightIcon={<ChevronDownIcon />}
                >
                  <Text fontFamily="LoRes15" fontSize="15px">
                    Login
                  </Text>
                </MenuButton>
              </Flex>

              <MenuList zIndex={5} bg={"#131323"} borderRadius="0">
                <MenuItem
                  bg={"#131323"}
                  _hover={{ bg: "#1f1f3c" }}
                  _focus={{}}
                  _active={{}}
                  onClick={login}
                >
                  login
                </MenuItem>
                <MenuItem
                  bg={"#131323"}
                  _hover={{ bg: "#1f1f3c" }}
                  _focus={{}}
                  _active={{}}
                  onClick={redirectToBridge}
                >
                  bridge to base ETH
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
