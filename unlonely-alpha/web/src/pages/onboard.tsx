import {
  Button,
  Flex,
  Input,
  Spinner,
  Switch,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import AppLayout from "../components/layout/AppLayout";
import { useCacheContext } from "../hooks/context/useCache";
import { useUser } from "../hooks/context/useUser";
import usePostChannel from "../hooks/server/usePostChannel";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

const Onboard = () => {
  const { user } = useUser();
  const { channelFeed } = useCacheContext();

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
      timeout = setTimeout(redirectToNewChannelPage, 3000);
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
      <Flex>
        <Flex direction="column" p="1rem" gap="40px" margin={"auto"}>
          {!success ? (
            <>
              <Flex direction={"column"} gap="10px">
                <Text fontSize="20px" fontWeight="bold">
                  required
                </Text>
                <Tooltip
                  label={errorMessage}
                  placement="bottom"
                  isOpen={errorMessage !== undefined}
                  bg="red.600"
                >
                  <Input
                    placeholder={"channel handle"}
                    variant={isSlugValid ? "glow" : "redGlow"}
                    onChange={(e) => setNewSlug(e.target.value)}
                    value={newSlug}
                  />
                </Tooltip>
              </Flex>
              <Flex direction={"column"} gap="10px">
                <Text fontSize="20px" fontWeight="bold">
                  optional (can change later)
                </Text>
                <Input
                  placeholder={"channel name"}
                  onChange={(e) => setNewName(e.target.value)}
                  value={newName}
                />
                <Input
                  placeholder={"channel description"}
                  onChange={(e) => setNewDescription(e.target.value)}
                  value={newDescription}
                />
                <Flex alignItems={"center"} justifyContent={"space-between"}>
                  <Text>allow recording</Text>
                  <Switch
                    isChecked={newCanRecord}
                    onChange={() => setNewCanRecord((prev) => !prev)}
                  />
                </Flex>
                <Flex alignItems={"center"} justifyContent={"space-between"}>
                  <Text>allow clipping</Text>
                  <Switch
                    isChecked={newAllowNfcs}
                    onChange={() => setNewAllowNfcs((prev) => !prev)}
                  />
                </Flex>
              </Flex>
              <Flex direction="column">
                <Button
                  isDisabled={!isSlugValid || newSlug.length === 0 || loading}
                  onClick={submitChannel}
                >
                  {loading ? (
                    <Spinner />
                  ) : newSlug.length === 0 ? (
                    "channel handle is required"
                  ) : (
                    "create channel"
                  )}
                </Button>
              </Flex>
            </>
          ) : (
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
          )}
        </Flex>
      </Flex>
    </AppLayout>
  );
};

export default Onboard;
