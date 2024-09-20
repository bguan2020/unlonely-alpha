import { ChevronDownIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  Menu,
  MenuButton,
  useToast,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  Box,
  Image,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { HiDotsVertical } from "react-icons/hi";

import { useUser } from "../../hooks/context/useUser";
import useUserAgent from "../../hooks/internal/useUserAgent";
import centerEllipses from "../../utils/centerEllipses";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";
import useUpdateUser from "../../hooks/server/useUpdateUser";
import trailString from "../../utils/trailString";
import { OwnedChannelsModal } from "../channels/OwnedChannelsModal";
import copy from "copy-to-clipboard";
const ConnectWalletDropdown = ({ hideBridge }: { hideBridge?: boolean }) => {
  const router = useRouter();
  const {
    user,
    ready,
    authenticated,
    fetchingUser,
    login,
    connectWallet,
    logout,
  } = useUser();
  const { isStandalone } = useUserAgent();
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const loggedInWithPrivy = authenticated && ready;

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

  return (
    <>
      {ready && !fetchingUser ? (
        <>
          <TransactionModalTemplate
            title="are you sure you want to log out?"
            isOpen={isCloseModalOpen}
            handleClose={() => setIsCloseModalOpen(false)}
            hideFooter
          >
            <Button
              color="white"
              bg="#E09025"
              _hover={{}}
              _focus={{}}
              _active={{}}
              onClick={callLogout}
              width="100%"
              borderRadius="25px"
            >
              logout
            </Button>
          </TransactionModalTemplate>
          {loggedInWithPrivy && user ? (
            <ConnectedDisplay />
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
                    {loggedInWithPrivy ? "Connect" : "Login"}
                  </Text>
                </MenuButton>
              </Flex>
              <MenuList zIndex={1801} bg={"#131323"} borderRadius="0">
                <MenuItem
                  bg={"#131323"}
                  _hover={{ bg: "#1f1f3c" }}
                  _focus={{}}
                  _active={{}}
                  onClick={() => {
                    loggedInWithPrivy ? connectWallet() : login();
                  }}
                >
                  {loggedInWithPrivy ? "connect wallet" : "login"}
                </MenuItem>
                {!hideBridge && (
                  <MenuItem
                    bg={"#131323"}
                    _hover={{ bg: "#1f1f3c" }}
                    _focus={{}}
                    _active={{}}
                    onClick={redirectToBridge}
                  >
                    bridge ETH to base
                    <ExternalLinkIcon />
                  </MenuItem>
                )}
                {loggedInWithPrivy && (
                  <MenuItem
                    bg={"#131323"}
                    _hover={{ bg: "#1f1f3c" }}
                    _focus={{}}
                    _active={{}}
                    onClick={() => setIsCloseModalOpen(true)}
                  >
                    logout
                  </MenuItem>
                )}
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

export default ConnectWalletDropdown;

const ConnectedDisplay = () => {
  // const router = useRouter();

  const {
    activeWallet,
    user,
    fetchUser,
    logout,
    exportWallet,
    handleIsManagingWallets,
  } = useUser();

  const toast = useToast();

  const { isStandalone } = useUserAgent();

  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isChannelsModalOpen, setIsChannelsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { updateUser } = useUpdateUser({});

  // const redirectToBridge = useCallback(() => {
  //   if (isStandalone) {
  //     router.push("/bridge");
  //   } else {
  //     window.open(`${window.location.origin}/bridge`, "_blank");
  //   }
  // }, [isStandalone, router]);

  const callLogout = useCallback(() => {
    logout();
    setIsCloseModalOpen(false);
  }, []);

  const handleCopy = () => {
    toast({
      title: "copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
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
      {!isStandalone && (
        <OwnedChannelsModal
          isOpen={isChannelsModalOpen}
          handleClose={() => setIsChannelsModalOpen(false)}
        />
      )}
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
            _focus={{}}
            _active={{}}
            _hover={{}}
            px="10px"
            bg={"#131323"}
            rightIcon={<ChevronDownIcon />}
            position="relative"
          >
            <Flex alignItems={"center"}>
              <Text fontFamily="LoRes15" fontSize="15px">
                {loading ? (
                  <Spinner />
                ) : isStandalone ? (
                  <HiDotsVertical />
                ) : user?.username ? (
                  trailString(user?.username)
                ) : (
                  centerEllipses(user?.address, 13)
                )}{" "}
              </Text>
            </Flex>
          </MenuButton>
        </Flex>
        <MenuList zIndex={1801} bg={"#131323"} borderRadius="0">
          {!isStandalone && (
            <MenuItem
              bg={"#131323"}
              _hover={{ bg: "#1f1f3c" }}
              _focus={{}}
              _active={{}}
              onClick={() => setIsChannelsModalOpen(true)}
            >
              <Text>my channels</Text>
            </MenuItem>
          )}
          <MenuItem
            bg={"#131323"}
            _hover={{ bg: "#1f1f3c" }}
            _focus={{}}
            _active={{}}
            onClick={() => handleIsManagingWallets(true)}
          >
            <Flex alignItems={"center"} gap="5px">
              <Text>manage wallets</Text>
              <Image src={"/images/privy-orange.png"} height={"20px"} />
            </Flex>
          </MenuItem>
          {user?.address && (
            <MenuItem
              bg={"#131323"}
              _hover={{ bg: "#1f1f3c" }}
              _focus={{}}
              _active={{}}
              onClick={async () => {
                setLoading(true);
                await updateUser({ address: user?.address }).then(
                  async (res) => {
                    await fetchUser();
                    const socials = [];
                    socials.push([
                      res?.res?.newUserData?.username ? true : false,
                      res?.res?.newUserData?.FCHandle ? true : false,
                      res?.res?.newUserData?.lensHandle ? true : false,
                    ]);
                    toast({
                      duration: 5000,
                      isClosable: true,
                      position: "bottom",
                      id: "update-profile",
                      render: () => (
                        <Box
                          bg={res?.res?.error ? "#db3f3f" : "#087a38"}
                          p="10px"
                          borderRadius="15px"
                        >
                          {res?.res?.error ? (
                            <Flex direction="column">
                              <Text>Cannot update profile</Text>
                              <Button
                                p="0"
                                h="5"
                                mt="10px"
                                onClick={() => {
                                  copy(
                                    JSON.stringify({
                                      error: res?.res?.error,
                                      rawDataString: res?.res?.rawDataString,
                                    })
                                  );
                                  handleCopy();
                                }}
                              >
                                copy error
                              </Button>
                            </Flex>
                          ) : (
                            <Flex direction="column">
                              <Text>Profile updated</Text>
                              <Text>
                                ENS{" "}
                                {res?.res?.newUserData?.username ? "✅" : "❌"}{" "}
                                Farcaster{" "}
                                {res?.res?.newUserData?.FCHandle ? "✅" : "❌"}{" "}
                                Lens{" "}
                                {res?.res?.newUserData?.lensHandle
                                  ? "✅"
                                  : "❌"}
                              </Text>
                              {res?.res?.rawDataString && (
                                <Button
                                  p="0"
                                  h="5"
                                  mt="10px"
                                  border={"1px solid white"}
                                  bg="#ffffff92"
                                  _hover={{ bg: "#ffffff" }}
                                  onClick={() => {
                                    copy(String(res?.res?.rawDataString));
                                    handleCopy();
                                  }}
                                >
                                  copy raw profile data
                                </Button>
                              )}
                            </Flex>
                          )}
                        </Box>
                      ),
                    });
                    setLoading(false);
                  }
                );
              }}
            >
              <Text>update ENS/socials</Text>
            </MenuItem>
          )}
          {/* <MenuItem
            bg={"#131323"}
            _hover={{ bg: "#0056b1" }}
            _focus={{}}
            _active={{}}
            onClick={redirectToBridge}
          >
            <Text>bridge ETH to base</Text>
            {!isStandalone && <ExternalLinkIcon />}
          </MenuItem> */}
          {activeWallet?.walletClientType === "privy" && (
            <MenuItem
              bg={"#131323"}
              _hover={{ bg: "#1f1f3c" }}
              _focus={{}}
              _active={{}}
              onClick={exportWallet}
            >
              export wallet
            </MenuItem>
          )}
          {user?.address && (
            <MenuItem
              bg={"#131323"}
              _hover={{ bg: "#1f1f3c" }}
              _focus={{}}
              _active={{}}
              onClick={() => {
                copy(user?.address);
                handleCopy();
              }}
            >
              copy wallet address
            </MenuItem>
          )}
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
  );
};
