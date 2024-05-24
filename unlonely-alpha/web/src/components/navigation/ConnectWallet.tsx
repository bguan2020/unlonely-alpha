import {
  ChevronDownIcon,
  ExternalLinkIcon,
  WarningIcon,
} from "@chakra-ui/icons";
import {
  Badge,
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
} from "@chakra-ui/react";
import { ConnectedWallet, useConnectWallet } from "@privy-io/react-auth";
import { usePrivyWagmi } from "@privy-io/wagmi-connector";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HiDotsVertical } from "react-icons/hi";
import Confetti from "react-confetti";
import { useBalance, useFeeData } from "wagmi";

import { useCacheContext } from "../../hooks/context/useCache";
import { useUser } from "../../hooks/context/useUser";
import useUserAgent from "../../hooks/internal/useUserAgent";
import centerEllipses from "../../utils/centerEllipses";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";
import { useNetworkContext } from "../../hooks/context/useNetwork";
import useUpdateUser from "../../hooks/server/useUpdateUser";
import trailString from "../../utils/trailString";
import { OwnedChannelsModal } from "../channels/OwnedChannelsModal";
import { formatUnits } from "viem";
import copy from "copy-to-clipboard";

const ConnectWallet = () => {
  const router = useRouter();
  const { user, loginMethod, ready, privyUser, login } = useUser();
  const { isStandalone } = useUserAgent();
  const { wallet: activeWallet, setActiveWallet } = usePrivyWagmi();
  const toast = useToast();
  const { connectWallet } = useConnectWallet({
    onSuccess: (wallet) => {
      setActiveWallet(wallet as ConnectedWallet);
    },
    onError: (err) => {
      console.error("connect wallet error", err);
      toast({
        render: () => (
          <Box as="button" borderRadius="md" bg="#b82929" p={4}>
            <Flex direction="column">
              <Text fontFamily={"LoRes15"} fontSize="20px">
                connect wallet error
              </Text>
              <Text>please copy error log to help developer diagnose</Text>
              <Button
                color="#b82929"
                width="100%"
                bg="white"
                onClick={() => {
                  copy(err.toString());
                  toast({
                    title: "copied to clipboard",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                  });
                }}
                _focus={{}}
                _active={{}}
                _hover={{ background: "#f44343", color: "white" }}
              >
                copy error
              </Button>
            </Flex>
          </Box>
        ),
        duration: 12000,
        isClosable: true,
        position: "top",
      });
    },
  });

  const redirectToBridge = useCallback(() => {
    if (isStandalone) {
      router.push("/bridge");
    } else {
      window.open(`${window.location.origin}/bridge`, "_blank");
    }
  }, [isStandalone, router]);

  return (
    <>
      {ready ? (
        <>
          {user &&
          loginMethod &&
          (loginMethod === "privy" ||
            (loginMethod !== "privy" && activeWallet)) ? (
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
                    Login
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
                    privyUser ? connectWallet() : login();
                  }}
                >
                  {privyUser ? "connect wallet" : "login"}
                </MenuItem>
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

const ConnectedDisplay = () => {
  const router = useRouter();

  const { user, userAddress, loginMethod, fetchUser, logout, exportWallet } =
    useUser();
  const { claimableBets } = useCacheContext();
  const { network } = useNetworkContext();
  const { matchingChain, localNetwork } = network;

  const toast = useToast();

  const { isStandalone } = useUserAgent();

  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isChannelsModalOpen, setIsChannelsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: feeData, refetch: refetchFeeData } = useFeeData({
    chainId: localNetwork.config.chainId,
    enabled: false,
  });
  const { data: userEthBalance, refetch: refetchUserEthBalance } = useBalance({
    address: userAddress as `0x${string}`,
    enabled: false,
  });

  const { updateUser } = useUpdateUser({});

  const isLowEthBalance = useMemo(() => {
    if (!userEthBalance || !feeData || !matchingChain) {
      return false;
    }

    return (
      Number(feeData?.formatted?.gasPrice ?? "0") >
      Number(formatUnits(userEthBalance.value, 18))
    );
  }, [feeData?.formatted?.gasPrice, userEthBalance, matchingChain]);

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

  const callLogout = useCallback(() => {
    logout();
    setIsCloseModalOpen(false);
  }, []);

  const parentRef = useRef<HTMLDivElement>(null);

  const [parentWidth, setParentWidth] = useState(0);
  const [parentHeight, setParentHeight] = useState(0);

  useEffect(() => {
    const updateSize = () => {
      if (parentRef.current) {
        setParentWidth(parentRef.current.offsetWidth);
        setParentHeight(parentRef.current.offsetHeight);
      }
    };

    updateSize(); // Update width on mount

    window.addEventListener("resize", updateSize); // Update width on window resize

    return () => window.removeEventListener("resize", updateSize); // Cleanup listener
  }, [claimableBets.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      const calls: any[] = [refetchFeeData(), refetchUserEthBalance()];
      const fetch = async () => {
        try {
          await Promise.all(calls);
        } catch (err) {
          console.log("connect fetching error", err);
        }
      };
      fetch();
    }, 90000);

    return () => clearInterval(interval);
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
            ref={parentRef}
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
            bg={"#131323"}
            rightIcon={<ChevronDownIcon />}
            position="relative"
          >
            {claimableBets.length > 0 && (
              <Confetti
                width={parentWidth}
                height={parentHeight}
                style={{ zIndex: "2" }}
                numberOfPieces={15}
              />
            )}
            {isLowEthBalance && (
              <Flex
                className="attention"
                position="absolute"
                bottom="-1px"
                alignItems="end"
              >
                <WarningIcon mr="2px" height="1em" />
                <Text fontFamily="LoRes15">LOW ETH</Text>
              </Flex>
            )}
            <Flex alignItems={"center"}>
              <Text fontFamily="LoRes15" fontSize="15px">
                {loading ? (
                  <Spinner />
                ) : isStandalone ? (
                  <HiDotsVertical />
                ) : user?.username ? (
                  trailString(user?.username)
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
                    {claimableBets.length > 99 ? "99+" : claimableBets.length}
                  </Badge>
                </Text>
              )}
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
          {userAddress && (
            <MenuItem
              bg={"#131323"}
              _hover={{ bg: "#1f1f3c" }}
              _focus={{}}
              _active={{}}
              onClick={async () => {
                setLoading(true);
                await updateUser({ address: userAddress }).then(async (res) => {
                  await fetchUser();
                  const socials = [];
                  socials.push([
                    res?.res?.username ? true : false,
                    res?.res?.FCImageUrl ? true : false,
                    res?.res?.lensHandle ? true : false,
                  ]);
                  toast({
                    title: "Profile updated",
                    description:
                      `ENS name ${res?.res?.username ? "✅" : "❌"} ` +
                      `Farcaster ${res?.res?.FCImageUrl ? "✅" : "❌"} ` +
                      `Lens ${res?.res?.lensHandle ? "✅" : "❌"}`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                  });
                  setLoading(false);
                });
              }}
            >
              <Text>update ENS/socials</Text>
            </MenuItem>
          )}
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
                  {claimableBets.length > 99 ? "99+" : claimableBets.length}
                </Badge>
              </Text>
            )}
            {!isStandalone && <ExternalLinkIcon />}
          </MenuItem>
          <MenuItem
            bg={isLowEthBalance ? "#004b9c" : "#131323"}
            _hover={{ bg: "#0056b1" }}
            _focus={{}}
            _active={{}}
            onClick={redirectToBridge}
          >
            <Text>bridge ETH to base</Text>
            {isLowEthBalance && (
              <Text ml="1" className="attention">
                <WarningIcon />
              </Text>
            )}
            {!isStandalone && <ExternalLinkIcon />}
          </MenuItem>
          {loginMethod === "privy" && (
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
          {userAddress && (
            <MenuItem
              bg={"#131323"}
              _hover={{ bg: "#1f1f3c" }}
              _focus={{}}
              _active={{}}
              onClick={() => {
                copy(userAddress);
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
