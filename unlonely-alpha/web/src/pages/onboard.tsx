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
import { useCacheContext } from "../hooks/context/useCache";
import { useUser } from "../hooks/context/useUser";
import usePostChannel from "../hooks/server/usePostChannel";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { FaRegCopy } from "react-icons/fa";
import copy from "copy-to-clipboard";

const Onboard = () => {
  const { user, walletIsConnected } = useUser();
  const { channelFeed } = useCacheContext();
  const { login, connectWallet, user: privyUser } = usePrivy();
  const toast = useToast();

  const { postChannel } = usePostChannel({
    onError: () => {
      console.error("Failed to save channel to server.");
    },
  });

  const [newSlug, setNewSlug] = useState<string>("");
  const [newName, setNewName] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [newCanRecord, setNewCanRecord] = useState<boolean>(true);
  const [newAllowNfcs, setNewAllowNfcs] = useState<boolean>(true);

  const [livepeerStreamId, setLivepeerStreamId] = useState<string>("");
  const [livepeerPlaybackId, setLivepeerPlaybackId] = useState<string>("");
  const [streamKey, setStreamKey] = useState<string>("");
  const [returnedSlug, setReturnedSlug] = useState<string>("");

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

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

  const isSlugValid = useMemo(() => {
    return !channelFeed?.find((c) => c !== null && c.slug === newSlug);
  }, [newSlug, channelFeed]);

  const redirectToNewChannelPage = useCallback(() => {
    window.open(`${window.location.origin}/channels/${returnedSlug}`, "_self");
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
    if (!isSlugValid) {
      setErrorMessage("channel handle is taken");
    } else {
      setErrorMessage("");
    }
  }, [isSlugValid, newSlug]);

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
            gap="40px"
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
                    <Text fontSize="12px" color="#c2c2c2">
                      how will your viewers search for you?
                    </Text>
                    <Tooltip
                      label={errorMessage}
                      placement="bottom"
                      isOpen={errorMessage !== undefined}
                      bg="red.600"
                    >
                      <Input
                        placeholder={"channel URL handle"}
                        variant={isSlugValid ? "glow" : "redGlow"}
                        onChange={(e) => setNewSlug(e.target.value)}
                        value={newSlug}
                      />
                    </Tooltip>
                  </Flex>
                  <Input
                    value={`${window.location.origin}/channels/${
                      newSlug || "*your handle*"
                    }`}
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
                    <Text fontSize="12px" color="#c2c2c2">
                      what are you streaming?
                    </Text>
                    <Input
                      placeholder={"channel name"}
                      onChange={(e) => setNewName(e.target.value)}
                      value={newName}
                    />
                  </Flex>
                  <Flex direction={"column"} gap="2px">
                    <Text fontSize="12px" color="#c2c2c2">
                      add anything else you'd like
                    </Text>
                    <Input
                      placeholder={"channel description"}
                      onChange={(e) => setNewDescription(e.target.value)}
                      value={newDescription}
                    />
                  </Flex>
                  <Flex direction={"column"} gap="2px">
                    <Text fontSize="12px" color="#c2c2c2">
                      we record and store your streams for future use
                    </Text>
                    <Flex
                      alignItems={"center"}
                      justifyContent={"space-between"}
                    >
                      <Text>allow recording</Text>
                      <Switch
                        isChecked={newCanRecord}
                        onChange={() => setNewCanRecord((prev) => !prev)}
                      />
                    </Flex>
                  </Flex>
                  <Flex direction={"column"} gap="2px">
                    <Text fontSize="12px" color="#c2c2c2">
                      your viewers may create highlight clips of your streams to
                      share
                    </Text>
                    <Flex
                      alignItems={"center"}
                      justifyContent={"space-between"}
                    >
                      <Text>allow clipping</Text>
                      <Switch
                        isChecked={newAllowNfcs}
                        onChange={() => setNewAllowNfcs((prev) => !prev)}
                      />
                    </Flex>
                  </Flex>
                </Flex>
                <Flex direction="column">
                  <Button
                    color="white"
                    bg="#2562db"
                    isDisabled={!isSlugValid || newSlug.length === 0 || loading}
                    onClick={submitChannel}
                  >
                    {loading ? (
                      <Spinner />
                    ) : newSlug.length === 0 ? (
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
