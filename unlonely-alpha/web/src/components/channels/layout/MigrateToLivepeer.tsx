import {
  useToast,
  Flex,
  IconButton,
  Spinner,
  Button,
  Text,
} from "@chakra-ui/react";
import copy from "copy-to-clipboard";
import { useState, useEffect } from "react";
import { FaRegCopy } from "react-icons/fa";
import { STREAMER_MIGRATION_URL_QUERY_PARAM } from "../../../constants";
import { useChannelContext } from "../../../hooks/context/useChannel";
import useMigrateChannelToLivepeer from "../../../hooks/server/channel/useMigrateChannelToLivepeer";

export const MigrateToLivePeer = () => {
  const { channel } = useChannelContext();
  const { channelQueryData } = channel;
  const { migrateChannelToLivepeer } = useMigrateChannelToLivepeer({});
  const toast = useToast();

  const [livepeerStreamId, setLivepeerStreamId] = useState<string>("");
  const [livepeerPlaybackId, setLivepeerPlaybackId] = useState<string>("");
  const [streamKey, setStreamKey] = useState<string>("");
  const [returnedSlug, setReturnedSlug] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const reload = () => {
    window.open(
      `${window.location.href}?${STREAMER_MIGRATION_URL_QUERY_PARAM}=true`,
      "_self"
    );
  };

  const handleCopy = () => {
    toast({
      title: "copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleMigrate = async () => {
    if (!channelQueryData?.slug || !channelQueryData?.owner?.address) {
      return;
    }
    setLoading(true);
    try {
      const res = await migrateChannelToLivepeer({
        slug: channelQueryData?.slug,
        canRecord: true,
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
  };

  useEffect(() => {
    let timeout: any;

    if (
      livepeerStreamId &&
      livepeerPlaybackId &&
      streamKey &&
      returnedSlug === channelQueryData?.slug
    ) {
      setSuccess(true);
      timeout = setTimeout(() => reload(), 3000);
    }
    return () => clearTimeout(timeout);
  }, [
    livepeerStreamId,
    livepeerPlaybackId,
    streamKey,
    returnedSlug,
    channelQueryData?.slug,
  ]);

  return (
    <Flex>
      <Flex direction="column" gap="10px" justifyContent={"center"} p="10px">
        {error ? (
          <>
            <Text textAlign="center">Something went wrong on our end...</Text>
            <Text textAlign="center">
              Please reach out to us and send the following error message:{" "}
            </Text>
            <Flex direction="column" p="5px" bg="rgba(0, 0, 0, 0.5)" gap="10px">
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
                icon={<FaRegCopy size="20px" />}
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
        ) : loading ? (
          <>
            <Text textAlign={"center"}>
              Migrating to new livestreaming framework
            </Text>
            <Text textAlign={"center"}>Please wait...</Text>
            <Flex justifyContent="center">
              <Spinner size="lg" />
            </Flex>
          </>
        ) : success ? (
          <>
            <Text textAlign={"center"}>Migration successful.</Text>
            <Text textAlign={"center"}>
              Reloading your channel page now. Be sure to tell your viewers to
              refresh too.{" "}
            </Text>
            <Flex justifyContent="center">
              <Spinner size="lg" />
            </Flex>
          </>
        ) : (
          <>
            <Text textAlign={"center"}>
              Unlonely has recently upgraded its livestreaming framework.
            </Text>
            <Text textAlign={"center"}>
              Please click the button below to migrate.
            </Text>
            <Button
              color="white"
              bg="#0ca33c"
              _active={{}}
              _focus={{}}
              _hover={{
                transform: "scale(1.05)",
              }}
              onClick={handleMigrate}
            >
              Migrate to Livepeer
            </Button>
          </>
        )}
      </Flex>
    </Flex>
  );
};
