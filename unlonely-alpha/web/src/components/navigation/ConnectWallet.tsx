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
  Link,
} from "@chakra-ui/react";
import {
  ConnectedWallet,
  useConnectWallet,
  usePrivy,
} from "@privy-io/react-auth";
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
import { GET_CHANNELS_BY_OWNER_ADDRESS_QUERY } from "../../constants/queries";
import { useLazyQuery } from "@apollo/client";
import { GetChannelsByOwnerAddressQuery } from "../../generated/graphql";

const ConnectWallet = () => {
  const router = useRouter();
  const { user, loginMethod } = useUser();
  const { isStandalone } = useUserAgent();
  const { login, ready, user: privyUser } = usePrivy();
  const { wallet: activeWallet, setActiveWallet } = usePrivyWagmi();
  const { connectWallet } = useConnectWallet({
    onSuccess: (wallet) => {
      setActiveWallet(wallet as ConnectedWallet);
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
  const { user, userAddress, fetchUser } = useUser();
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

  const [
    getChannelsByOwnerAddress,
    {
      loading: getChannelsByOwnerAddressLoading,
      data: getChannelsByOwnerAddressData,
      error: getChannelsByOwnerAddressError,
    },
  ] = useLazyQuery<GetChannelsByOwnerAddressQuery>(
    GET_CHANNELS_BY_OWNER_ADDRESS_QUERY,
    {
      variables: { ownerAddress: userAddress },
      fetchPolicy: "network-only",
    }
  );

  const sortedChannels = useMemo(() => {
    return (
      getChannelsByOwnerAddressData?.getChannelsByOwnerAddress?.sort(
        (a, b) => a?.name?.localeCompare(b?.name ?? "") ?? 0
      ) ?? []
    );
  }, [getChannelsByOwnerAddressData?.getChannelsByOwnerAddress]);

  const { updateUser } = useUpdateUser({});

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
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isChannelsModalOpen) getChannelsByOwnerAddress();
  }, [isChannelsModalOpen]);

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
      <TransactionModalTemplate
        title={`my channels (${
          getChannelsByOwnerAddressData?.getChannelsByOwnerAddress?.length ?? 0
        })`}
        isOpen={isChannelsModalOpen}
        handleClose={() => setIsChannelsModalOpen(false)}
        size={isStandalone ? "sm" : "md"}
        hideFooter
      >
        {getChannelsByOwnerAddressLoading ? (
          <Flex justifyContent="center">
            <Spinner />
          </Flex>
        ) : (
          <>
            {(getChannelsByOwnerAddressData?.getChannelsByOwnerAddress
              ?.length ?? 0) > 0 ? (
              <Flex
                direction={"column"}
                gap="10px"
                maxHeight="300px"
                overflowY={"scroll"}
              >
                {sortedChannels.map((channel) => (
                  <Link
                    key={channel?.slug}
                    href={`${window.location.origin}/channels/${channel?.slug}`}
                  >
                    <Flex
                      _hover={{
                        bg: "#1f1f3c",
                        transition: "0.3s",
                      }}
                      direction="column"
                      p="10px"
                      bg="rgba(0, 0, 0, 0.5)"
                      borderRadius={"15px"}
                    >
                      <Flex>
                        <Text>{channel?.name}</Text>
                      </Flex>
                      <Flex justifyContent={"space-between"}>
                        <Text fontSize="12px" color="#acacac">
                          /{channel?.slug}
                        </Text>
                      </Flex>
                    </Flex>
                  </Link>
                ))}
              </Flex>
            ) : (
              <Flex justifyContent="center">
                <Text>no channels, start by creating one</Text>
              </Flex>
            )}
          </>
        )}
      </TransactionModalTemplate>
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
          <MenuItem
            bg={"#131323"}
            _hover={{ bg: "#1f1f3c" }}
            _focus={{}}
            _active={{}}
            onClick={() => setIsChannelsModalOpen(true)}
          >
            <Text>my channels</Text>
          </MenuItem>
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
