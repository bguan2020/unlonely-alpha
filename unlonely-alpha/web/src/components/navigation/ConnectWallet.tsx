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
  MenuItem,
  MenuList,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";
import { usePrivyWagmi } from "@privy-io/wagmi-connector";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HiDotsVertical } from "react-icons/hi";
import Confetti from "react-confetti";
import { useBalance, useBlockNumber, useFeeData } from "wagmi";
import { isAddress } from "viem";

import { useCacheContext } from "../../hooks/context/useCache";
import { useUser } from "../../hooks/context/useUser";
import useUserAgent from "../../hooks/internal/useUserAgent";
import centerEllipses from "../../utils/centerEllipses";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";
import { useNetworkContext } from "../../hooks/context/useNetwork";

const ConnectWallet = () => {
  const router = useRouter();
  const { user, loginMethod } = useUser();
  const { isStandalone } = useUserAgent();
  const { login, ready, linkWallet } = usePrivy();
  const { wallet: activeWallet } = usePrivyWagmi();

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
          {user ? (
            loginMethod === "privy" ||
            (loginMethod && loginMethod !== "privy" && activeWallet) ? (
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
                    bridge ETH to base
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

  const { logout } = usePrivy();
  const { userAddress } = useUser();
  const { claimableBets } = useCacheContext();
  const { network } = useNetworkContext();
  const { matchingChain } = network;

  const { isStandalone } = useUserAgent();

  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const { data: feeData, refetch } = useFeeData({
    chainId: 84531,
  });
  const blockNumber = useBlockNumber({
    watch: true,
  });
  const { data: userEthBalance, refetch: refetchUserEthBalance } = useBalance({
    address: userAddress as `0x${string}`,
    enabled: isAddress(userAddress as `0x${string}`),
  });
  const isFetching = useRef(false);

  const isLowEthBalance = useMemo(() => {
    if (!userEthBalance || !feeData || !matchingChain) {
      return false;
    }

    return (
      Number(feeData?.formatted?.gasPrice ?? "0") >
      Number(userEthBalance.formatted)
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
    if (!blockNumber.data || isFetching.current) return;
    const calls: any[] = [refetch(), refetchUserEthBalance()];
    const fetch = async () => {
      isFetching.current = true;
      try {
        await Promise.all(calls);
      } catch (err) {
        console.log("connect fetching error", err);
      }
      isFetching.current = false;
    };
    fetch();
  }, [blockNumber.data]);

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
                    {claimableBets.length > 99 ? "99+" : claimableBets.length}
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
