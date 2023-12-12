import { ChevronDownIcon, ExternalLinkIcon } from "@chakra-ui/icons";
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
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { HiDotsVertical } from "react-icons/hi";

import { useCacheContext } from "../../hooks/context/useCache";
import { useUser } from "../../hooks/context/useUser";
import useUserAgent from "../../hooks/internal/useUserAgent";
import centerEllipses from "../../utils/centerEllipses";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";

const ConnectWallet = () => {
  const router = useRouter();
  const { user, loginMethod, userAddress } = useUser();
  const { isStandalone } = useUserAgent();
  const { login, ready, linkWallet, logout } = usePrivy();
  const { wallet: activeWallet } = usePrivyWagmi();
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const { claimableBets } = useCacheContext();

  const callLogout = useCallback(() => {
    logout();
    setIsCloseModalOpen(false);
  }, []);

  const redirectToBridge = useCallback(() => {
    if (isStandalone) {
      router.push("/bridge");
    } else {
      window.open(`${window.location.origin}/bridge`, "_blank");
    }
  }, [isStandalone, router]);

  const redirectToClaim = useCallback(() => {
    if (isStandalone) {
      router.push("/claim");
    } else {
      window.open(`${window.location.origin}/claim`, "_blank");
    }
  }, [isStandalone, router]);

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
                      _hover={{
                        bg: claimableBets.length > 0 ? "#E09025" : "#020202",
                      }}
                      _focus={{}}
                      _active={{}}
                      px="10px"
                      bg={claimableBets.length > 0 ? "#E09025" : "#131323"}
                      rightIcon={<ChevronDownIcon />}
                    >
                      <Flex alignItems={"center"}>
                        <Text fontFamily="LoRes15" fontSize="15px">
                          {isStandalone ? (
                            <HiDotsVertical />
                          ) : (
                            centerEllipses(userAddress, 13)
                          )}{" "}
                        </Text>
                        {claimableBets.length > 0 && (
                          <Text>
                            <Badge
                              className="hithere"
                              variant="solid"
                              ml="1"
                              colorScheme={"red"}
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
                    <MenuItem
                      bg={claimableBets.length > 0 ? "#E09025" : "#131323"}
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
                            colorScheme={"red"}
                            fontSize="0.7em"
                          >
                            {claimableBets.length > 99
                              ? "99+"
                              : claimableBets.length}
                          </Badge>
                        </Text>
                      )}
                      {!isStandalone && <ExternalLinkIcon />}
                    </MenuItem>
                    <MenuItem
                      bg={"#131323"}
                      _hover={{ bg: "#1f1f3c" }}
                      _focus={{}}
                      _active={{}}
                      onClick={redirectToBridge}
                    >
                      bridge to base ETH
                      {!isStandalone && <ExternalLinkIcon />}
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
                    <ExternalLinkIcon />
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
                  <ExternalLinkIcon />
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
