import {
  Button,
  Flex,
  Input,
  Spinner,
  Switch,
  Text,
  Tooltip,
  useToast,
  IconButton,
  Box,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import AppLayout from "../components/layout/AppLayout";
import { useUser } from "../hooks/context/useUser";
import usePostChannel from "../hooks/server/usePostChannel";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { FaRegCopy } from "react-icons/fa";
import copy from "copy-to-clipboard";
import { useLazyQuery } from "@apollo/client";
import { GET_CHANNEL_SEARCH_RESULTS_QUERY } from "../constants/queries";
import { GetChannelSearchResultsQuery } from "../generated/graphql";
import { alphanumericInput } from "../utils/validation/input";
import { NEW_STREAMER_URL_QUERY_PARAM } from "../constants";
import {
  useGetMintCostAfterFees,
  useMint,
} from "../hooks/contracts/useVibesToken";
import { isAddress } from "viem";
import { useBalance } from "wagmi";
import { NETWORKS } from "../constants/networks";
import { getContractFromNetwork } from "../utils/contract";
import { mintErrors } from "../components/chat/VibesTokenExchange";
import useDebounce from "../hooks/internal/useDebounce";
import { useCacheContext } from "../hooks/context/useCache";
import { useNetworkContext } from "../hooks/context/useNetwork";
import { useRouter } from "next/router";
import useUserAgent from "../hooks/internal/useUserAgent";
import { BiRefresh } from "react-icons/bi";
import { truncateValue } from "../utils/tokenDisplayFormatting";

const REQUIRED_NUMBER_OF_VIBES = 500;

const SLUG_MAX_CHARS = 25;

const Onboard = () => {
  const { user, walletIsConnected } = useUser();

  const { login, connectWallet, user: privyUser } = usePrivy();

  return (
    <AppLayout isCustomHeader={false}>
      {!user?.address || !walletIsConnected ? (
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          width="100%"
          height="calc(70vh)"
          direction="column"
          gap="10px"
        >
          <Text fontSize="20px">You must sign in to create a channel</Text>
          <Button
            color="white"
            bg="#2562db"
            _hover={{
              bg: "#1c4d9e",
            }}
            _focus={{}}
            _active={{}}
            onClick={() => {
              privyUser ? connectWallet() : login();
            }}
          >
            Sign in now
          </Button>
        </Flex>
      ) : (
        <LoggedInOnboard />
      )}
    </AppLayout>
  );
};

const LoggedInOnboard = () => {
  const { user, userAddress } = useUser();
  const router = useRouter();
  const { isStandalone } = useUserAgent();
  const { userVibesBalance, lastChainInteractionTimestamp } = useCacheContext();
  const { network } = useNetworkContext();
  const { matchingChain, explorerUrl } = network;
  const toast = useToast();

  const { postChannel } = usePostChannel({
    onError: () => {
      console.error("Failed to save channel to server.");
    },
  });

  const [newSlug, setNewSlug] = useState<string>("");
  const [debouncedNewSlug, setDebouncedNewSlug] = useState<string>("");

  const [newName, setNewName] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [newCanRecord, setNewCanRecord] = useState<boolean>(true);
  const [newAllowNfcs, setNewAllowNfcs] = useState<boolean>(true);

  const [livepeerStreamId, setLivepeerStreamId] = useState<string>("");
  const [livepeerPlaybackId, setLivepeerPlaybackId] = useState<string>("");
  const [streamKey, setStreamKey] = useState<string>("");
  const [returnedSlug, setReturnedSlug] = useState<string>("");
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean>(true);

  const [handleErrorMessage, setHandleErrorMessage] = useState<string>("");
  const [vibesErrorMessage, setVibesErrorMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const remainingVibesNeeded = useMemo(
    () =>
      REQUIRED_NUMBER_OF_VIBES -
      Math.floor(Number(userVibesBalance?.formatted)),
    [userVibesBalance]
  );

  const debouncedAmountOfVibes = useDebounce(remainingVibesNeeded, 300);
  const amount_vibes_needed_bigint = useMemo(
    () =>
      debouncedAmountOfVibes > 0 ? BigInt(debouncedAmountOfVibes) : BigInt(0),
    [debouncedAmountOfVibes]
  );

  const [getChannelSearchResults] = useLazyQuery<GetChannelSearchResultsQuery>(
    GET_CHANNEL_SEARCH_RESULTS_QUERY,
    {
      fetchPolicy: "network-only",
    }
  );

  const contract = getContractFromNetwork("vibesTokenV1", NETWORKS[0]);

  const {
    mintCostAfterFees,
    refetch: refetchMintCostAfterFees,
    loading: mintCostAfterFeesLoading,
  } = useGetMintCostAfterFees(amount_vibes_needed_bigint, contract);

  const {
    data: userEthBalance,
    refetch: refetchUserEthBalance,
    isRefetching: isRefetchingUserEthBalance,
  } = useBalance({
    address: userAddress as `0x${string}`,
    enabled: isAddress(userAddress as `0x${string}`),
  });

  const {
    mint,
    refetch: refetchMint,
    isRefetchingMint,
  } = useMint(
    {
      streamer: userAddress as `0x${string}`,
      amount: amount_vibes_needed_bigint,
      value: mintCostAfterFees,
    },
    contract,
    {
      onWriteSuccess: (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#287ab0" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}}/tx/${data.hash}`}
                passHref
              >
                mint pending, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
      onWriteError: (error) => {
        console.log("mint write error", error);
        toast({
          duration: 9000,
          isClosable: true,
          position: "top-right",
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              mint cancelled
            </Box>
          ),
        });
      },
      onTxSuccess: async (data) => {
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                mint success, click to view
              </Link>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
      onTxError: (error) => {
        console.log("mint error", error);
        let message =
          "Unknown error, please check the explorer for more details";
        Object.keys(mintErrors).forEach((key) => {
          if (String(error).includes(key)) {
            message = mintErrors[key];
          }
        });
        toast({
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" p={2}>
              <Flex direction="column">
                <Text>mint error</Text>
                <Text fontSize="15px">{message}</Text>
              </Flex>
            </Box>
          ),
          duration: 9000,
          isClosable: true,
          position: "top-right",
        });
      },
    }
  );

  const handleCopy = () => {
    toast({
      title: "copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const submitChannel = async () => {
    if (user?.address) {
      setLoading(true);
      try {
        const res = await postChannel({
          slug: newSlug,
          ownerAddress: user.address,
          name: newName,
          description: newDescription,
          canRecord: newCanRecord,
          allowNfcs: newAllowNfcs,
        });
        setLivepeerPlaybackId(res?.res?.livepeerPlaybackId || "");
        setLivepeerStreamId(res?.res?.livepeerStreamId || "");
        setStreamKey(res?.res?.streamKey || "");
        setReturnedSlug(res?.res?.slug || "");
      } catch (e) {
        console.error(e);
        setError(String(e));
      }
      setLoading(false);
    }
  };

  const redirectToNewChannelPage = useCallback(() => {
    window.open(
      `${window.location.origin}/channels/${returnedSlug}?${NEW_STREAMER_URL_QUERY_PARAM}=true`,
      "_self"
    );
  }, [returnedSlug]);

  const redirectToBridge = useCallback(() => {
    if (isStandalone) {
      router.push("/bridge");
    } else {
      window.open(`${window.location.origin}/bridge`, "_blank");
    }
  }, [isStandalone, router]);

  useEffect(() => {
    const init = async () => {
      const calls: any[] = [];
      calls.push(refetchMintCostAfterFees());
      calls.push(refetchMint());
      try {
        await Promise.all(calls);
      } catch (err) {
        console.log("cannot fetch vibes balance data", err);
      }
    };
    init();
  }, [lastChainInteractionTimestamp]);

  useEffect(() => {
    let timeout: any;

    if (livepeerStreamId && livepeerPlaybackId && streamKey && returnedSlug) {
      setSuccess(true);
      timeout = setTimeout(redirectToNewChannelPage, 2000);
    }
    return () => clearTimeout(timeout);
  }, [livepeerStreamId, livepeerPlaybackId, streamKey, returnedSlug]);

  useEffect(() => {
    if (newSlug.length > SLUG_MAX_CHARS) {
      setHandleErrorMessage(
        `channel handle must be ${SLUG_MAX_CHARS} characters or less`
      );
    } else if (newSlug.length > 0 && newSlug.length < 3) {
      setHandleErrorMessage("channel handle must be at least 3 characters");
    } else if (!isSlugAvailable) {
      setHandleErrorMessage("channel handle is taken");
    } else {
      setHandleErrorMessage("");
    }
  }, [isSlugAvailable, newSlug]);

  useEffect(() => {
    if (userEthBalance?.value && mintCostAfterFees > userEthBalance?.value) {
      setVibesErrorMessage("insufficient ETH");
    } else {
      setVibesErrorMessage("");
    }
  }, [userEthBalance?.value, mintCostAfterFees]);

  useEffect(() => {
    if (!matchingChain) {
      setErrorMessage("wrong network");
    } else {
      setErrorMessage("");
    }
  }, [matchingChain]);

  useEffect(() => {
    setLoading(true);
    const handler = setTimeout(() => {
      setDebouncedNewSlug(newSlug);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [newSlug]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      if (debouncedNewSlug.length < 3) {
        setLoading(false);
        setIsSlugAvailable(true);
        return;
      }
      const res = await getChannelSearchResults({
        variables: {
          data: { query: newSlug, slugOnly: true },
        },
      });
      setLoading(false);
      setIsSlugAvailable(res.data?.getChannelSearchResults?.length === 0);
    };
    init();
  }, [debouncedNewSlug]);

  useEffect(() => {
    setNewName(`${newSlug}'s unlonely channel :)`);
    setNewDescription("gm & welcome!");
  }, [newSlug]);

  return (
    <Flex>
      <Flex
        direction="column"
        p="1rem"
        gap="30px"
        margin={"auto"}
        bg="#131323"
        width={"400px"}
      >
        {error ? (
          <>
            <Text textAlign="center" fontSize={"3rem"} fontFamily="LoRes15">
              Something went wrong on our end...
            </Text>
            <Text textAlign="center" fontSize="15px">
              Please reach out to us and send the following error message as
              well as info about the channel you wanted to create:{" "}
            </Text>
            <Flex
              direction="column"
              p="15px"
              bg="rgba(0, 0, 0, 0.5)"
              gap="10px"
            >
              <Text
                textAlign="center"
                fontSize="15px"
                noOfLines={1}
                color="red.300"
              >
                {error}
              </Text>
              <IconButton
                aria-label="copy-onboard-error"
                color="white"
                icon={<FaRegCopy size="25px" />}
                height="20px"
                minWidth={"20px"}
                bg="transparent"
                _focus={{}}
                _active={{}}
                _hover={{}}
                onClick={() => {
                  copy(error);
                  handleCopy();
                }}
              />
            </Flex>
          </>
        ) : success ? (
          <>
            <Text textAlign="center" fontSize={"3rem"} fontFamily="LoRes15">
              You're all set! Welcome to Unlonely!
            </Text>
            <Text textAlign="center" fontSize="15px">
              Redirecting you to your new channel page shortly. If you're still
              not redirected, click{" "}
              <Link href={`/channels/${returnedSlug}`}>
                <Text as="span" color="#08c7edff">
                  here
                </Text>
              </Link>
              .
            </Text>
            <Flex justifyContent="center">
              <Spinner size="lg" />
            </Flex>
          </>
        ) : (
          <>
            <Flex direction={"column"} gap="18px">
              <Text fontSize="25px" fontFamily="LoRes15" color="#f5b6ff">
                required
              </Text>
              <Flex direction={"column"} gap="2px">
                <Text fontSize="11px" color="#c2c2c2">
                  how will your viewers search for you? (only A-Z, 0-9)
                </Text>
                <Tooltip
                  label={handleErrorMessage}
                  placement="bottom"
                  isOpen={handleErrorMessage !== undefined}
                  bg="red.600"
                >
                  <Input
                    placeholder={"channel URL handle"}
                    variant={isSlugAvailable ? "glow" : "redGlow"}
                    onChange={(e) =>
                      setNewSlug(alphanumericInput(e.target.value))
                    }
                    value={newSlug}
                  />
                </Tooltip>
              </Flex>
              {amount_vibes_needed_bigint > BigInt(0) && (
                <Flex direction={"column"} gap="2px">
                  <Text fontSize="11px" color="#c2c2c2">
                    to create a channel, you must own {REQUIRED_NUMBER_OF_VIBES}{" "}
                    $VIBES.{" "}
                    <Popover trigger="hover" placement="top" openDelay={200}>
                      <PopoverTrigger>
                        <Text as="span" color="#17d058">
                          why?
                        </Text>
                      </PopoverTrigger>
                      <PopoverContent
                        bg="#343dbb"
                        border="none"
                        width="200px"
                        p="2px"
                      >
                        <PopoverArrow bg="#343dbb" />
                        <Text fontSize="12px" textAlign={"center"}>
                          This is not a fee. This helps us know that you are a
                          real person. These tokens can immediately be traded
                          after channel creation.
                        </Text>
                      </PopoverContent>
                    </Popover>
                  </Text>
                  <Button
                    color={"#ffffff"}
                    bg="#343dbb"
                    _hover={{}}
                    _active={{}}
                    _focus={{}}
                    onClick={mint}
                    isDisabled={
                      mintCostAfterFeesLoading ||
                      isRefetchingMint ||
                      vibesErrorMessage.length > 0
                    }
                  >
                    <Text>
                      {vibesErrorMessage.length > 0
                        ? vibesErrorMessage
                        : `Buy ${truncateValue(
                            Number(amount_vibes_needed_bigint),
                            0
                          )} more $VIBES`}
                    </Text>
                  </Button>
                  {vibesErrorMessage && (
                    <Flex direction="column">
                      <Text fontSize="11px" color="red.300">
                        you don't have enough ETH to buy $VIBES, bridge over
                        some ETH, then refresh your balance
                      </Text>
                      <Flex gap="5px">
                        <Button
                          width="100%"
                          color={"#ffffff"}
                          bg="#343dbb"
                          _hover={{}}
                          _active={{}}
                          _focus={{}}
                          onClick={redirectToBridge}
                        >
                          bridge ETH to Base
                        </Button>
                        <Button
                          color={"#ffffff"}
                          bg="#1a2182"
                          p="0"
                          _hover={{}}
                          _active={{}}
                          _focus={{}}
                          onClick={() => refetchUserEthBalance()}
                          isDisabled={isRefetchingUserEthBalance}
                        >
                          {isRefetchingUserEthBalance ? (
                            <Spinner />
                          ) : (
                            <BiRefresh size="20px" />
                          )}
                        </Button>
                      </Flex>
                    </Flex>
                  )}
                </Flex>
              )}
            </Flex>
            <Flex direction={"column"} gap="18px">
              <Text fontSize="25px" fontFamily="LoRes15" color="#f5b6ff">
                optional (can set later)
              </Text>
              <Flex direction={"column"} gap="2px">
                <Flex alignItems={"center"} justifyContent={"space-between"}>
                  <Text>allow recording</Text>
                  <Switch
                    sx={{
                      // Customizing the track
                      ".chakra-switch__track": {
                        bg: "#cccccc", // Default background color
                        _checked: {
                          bg: "#17d058", // Background color when checked
                        },
                      },
                      // Customizing the thumb
                      ".chakra-switch__thumb": {
                        bg: "#ffffff", // Thumb color
                        _checked: {
                          bg: "#ffffff", // Thumb color when checked (optional if you want the same color)
                        },
                      },
                    }}
                    isChecked={newCanRecord}
                    onChange={() => setNewCanRecord((prev) => !prev)}
                  />
                </Flex>
                <Text fontSize="11px" color="#c2c2c2">
                  we record and store your streams for future use
                </Text>
              </Flex>
              <Flex direction={"column"} gap="2px">
                <Flex alignItems={"center"} justifyContent={"space-between"}>
                  <Text>allow clipping</Text>
                  <Switch
                    sx={{
                      // Customizing the track
                      ".chakra-switch__track": {
                        bg: "#cccccc", // Default background color
                        _checked: {
                          bg: "#17d058", // Background color when checked
                        },
                      },
                      // Customizing the thumb
                      ".chakra-switch__thumb": {
                        bg: "#ffffff", // Thumb color
                        _checked: {
                          bg: "#ffffff", // Thumb color when checked (optional if you want the same color)
                        },
                      },
                    }}
                    isChecked={newAllowNfcs}
                    onChange={() => setNewAllowNfcs((prev) => !prev)}
                  />
                </Flex>
                <Text fontSize="11px" color="#c2c2c2">
                  viewers can make short clips of your streams to share
                </Text>
              </Flex>
            </Flex>
            <Flex direction={"column"} gap="18px">
              <Text fontSize="25px" fontFamily="LoRes15" color="#f5b6ff">
                finish
              </Text>
              <Tooltip
                label={errorMessage}
                placement="bottom"
                isOpen={errorMessage !== undefined}
                bg="red.600"
              >
                <Button
                  color="white"
                  bg="#2562db"
                  isDisabled={
                    handleErrorMessage.length > 0 ||
                    vibesErrorMessage.length > 0 ||
                    errorMessage.length > 0 ||
                    debouncedNewSlug.length === 0 ||
                    amount_vibes_needed_bigint > BigInt(0) ||
                    mintCostAfterFeesLoading ||
                    isRefetchingMint ||
                    loading
                  }
                  _focus={{}}
                  _active={{}}
                  _hover={{}}
                  onClick={submitChannel}
                >
                  {mintCostAfterFeesLoading || isRefetchingMint || loading ? (
                    <Flex alignItems={"center"} gap="5px">
                      <Spinner size="sm" />
                      <Text>checking...</Text>
                    </Flex>
                  ) : debouncedNewSlug.length === 0 ? (
                    "channel URL handle is required"
                  ) : amount_vibes_needed_bigint > BigInt(0) ? (
                    "not enough $VIBES"
                  ) : (
                    "create channel"
                  )}
                </Button>
              </Tooltip>
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default Onboard;
