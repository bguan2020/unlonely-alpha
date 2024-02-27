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
} from "@chakra-ui/react";
import AppLayout from "../components/layout/AppLayout";
import { useUser } from "../hooks/context/useUser";
import usePostChannel from "../hooks/server/usePostChannel";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { FaRegCopy } from "react-icons/fa";
import copy from "copy-to-clipboard";
import { useLazyQuery } from "@apollo/client";
import { GET_CHANNEL_SEARCH_RESULTS_QUERY } from "../constants/queries";
import { GetChannelSearchResultsQuery } from "../generated/graphql";
import { alphanumericInput } from "../utils/validation/input";
import { NEW_STREAMER_URL_QUERY_PARAM } from "../constants";

const Onboard = () => {
  const { user, walletIsConnected } = useUser();
  const { login, connectWallet, user: privyUser } = usePrivy();
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

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [getChannelSearchResults] = useLazyQuery<GetChannelSearchResultsQuery>(
    GET_CHANNEL_SEARCH_RESULTS_QUERY,
    {
      fetchPolicy: "network-only",
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

  useEffect(() => {
    let timeout: any;

    if (livepeerStreamId && livepeerPlaybackId && streamKey && returnedSlug) {
      setSuccess(true);
      timeout = setTimeout(redirectToNewChannelPage, 2000);
    }
    return () => clearTimeout(timeout);
  }, [livepeerStreamId, livepeerPlaybackId, streamKey, returnedSlug]);

  useEffect(() => {
    if (newSlug.length > 15) {
      setErrorMessage("channel handle must be 15 characters or less");
    } else if (newSlug.length > 0 && newSlug.length < 3) {
      setErrorMessage("channel handle must be at least 3 characters");
    } else if (!isSlugAvailable) {
      setErrorMessage("channel handle is taken");
    } else {
      setErrorMessage("");
    }
  }, [isSlugAvailable, newSlug]);

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
                  Redirecting you to your new channel page shortly. If you're
                  still not redirected, click{" "}
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
                <Flex direction={"column"} gap="10px">
                  <Text fontSize="25px" fontFamily="LoRes15" color="#f5b6ff">
                    required
                  </Text>
                  <Flex direction={"column"} gap="2px">
                    <Text fontSize="11px" color="#c2c2c2">
                      how will your viewers search for you? (only A-Z, 0-9)
                    </Text>
                    <Tooltip
                      label={errorMessage}
                      placement="bottom"
                      isOpen={errorMessage !== undefined}
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
                  <Input
                    textAlign={"center"}
                    value={`unlonely.app/.../${newSlug || "*handle*"}`}
                    fontSize={"12px"}
                    readOnly={true}
                    color="#17d058"
                  />
                </Flex>
                <Flex direction={"column"} gap="18px">
                  <Text fontSize="25px" fontFamily="LoRes15" color="#f5b6ff">
                    optional (can set later)
                  </Text>
                  <Flex direction={"column"} gap="2px">
                    <Flex
                      alignItems={"center"}
                      justifyContent={"space-between"}
                    >
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
                    <Flex
                      alignItems={"center"}
                      justifyContent={"space-between"}
                    >
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
                <Flex direction="column">
                  <Button
                    color="white"
                    bg="#2562db"
                    isDisabled={
                      errorMessage.length > 0 ||
                      debouncedNewSlug.length === 0 ||
                      loading
                    }
                    _focus={{}}
                    _active={{}}
                    _hover={{}}
                    onClick={!errorMessage ? submitChannel : undefined}
                  >
                    {loading ? (
                      <Flex alignItems={"center"} gap="5px">
                        <Spinner size="sm" />
                        <Text>checking...</Text>
                      </Flex>
                    ) : debouncedNewSlug.length === 0 ? (
                      "channel URL handle is required"
                    ) : (
                      "create channel"
                    )}
                  </Button>
                </Flex>
              </>
            )}
          </Flex>
        </Flex>
      )}
    </AppLayout>
  );
};

export default Onboard;
