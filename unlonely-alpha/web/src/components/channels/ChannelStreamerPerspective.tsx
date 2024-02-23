import {
  Flex,
  Button,
  Text,
  IconButton,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useEffect, useMemo, useState } from "react";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import { FaRegCopy } from "react-icons/fa";
import copy from "copy-to-clipboard";
import LivepeerPlayer from "../stream/LivepeerPlayer";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import LivepeerBroadcast from "../stream/LivepeerBroadcast";
import useMigrateChannelToLivepeer from "../../hooks/server/useMigrateChannelToLivepeer";

const instructions = [
  {
    text: [
      "Copy and paste the stream key into your streaming software.",
      "Use either the RTMP or SRT ingest. The RTMP ingest is more common with OBS users.",
    ],
  },
  {
    text: [
      'Check that your camera and microphone inputs are working before clicking "Go" button.',
      "Be mindful that this feature is experimental and may not work properly sometimes.",
    ],
  },
];

const ChannelStreamerPerspective = () => {
  const toast = useToast();

  const { channel } = useChannelContext();
  const { channelQueryData } = channel;

  const [isBrowserBroadcastSelected, setIsBrowserBroadcastSelected] =
    useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const [showStreamKey, setShowStreamKey] = useState(false);
  const [showRTMPIngest, setShowRTMPIngest] = useState(false);
  const [showSRTIngest, setShowSRTIngest] = useState(false);

  const streamKey = useMemo(() => {
    return channelQueryData?.streamKey ?? "";
  }, [channelQueryData]);

  const playbackId = useMemo(() => {
    return channelQueryData?.livepeerPlaybackId;
  }, [channelQueryData]);

  const handleCopy = () => {
    toast({
      title: "copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  useEffect(() => {
    setShowStreamKey(false);
    setShowRTMPIngest(false);
    setShowSRTIngest(false);
  }, [isBrowserBroadcastSelected]);

  return (
    <Flex width={"100%"} direction={"column"} gap="10px" h="80vh">
      <Flex
        width={"100%"}
        position="relative"
        justifyContent={"center"}
        h="80%"
      >
        <Flex
          zIndex={2}
          position="absolute"
          top="0"
          left={"0"}
          p="2"
          bg="rgba(0, 0, 0, 0.5)"
        >
          <Text fontFamily={"LoRes15"}>PREVIEW</Text>
        </Flex>
        {isBroadcasting ? (
          <LivepeerBroadcast streamKey={streamKey} />
        ) : (
          <LivepeerPlayer playbackId={playbackId} />
        )}
      </Flex>
      <Flex
        bg="#131323"
        p="10px"
        borderRadius="10px"
        h="20%"
        width="100%"
        justifyContent={"center"}
      >
        {playbackId ? (
          <Flex gap="20px" width={"100%"}>
            <Flex direction="column" justifyContent={"space-evenly"}>
              <Text>How to Stream</Text>
              <Button
                bg={isBrowserBroadcastSelected ? "transparent" : "#0c7fc1"}
                color="white"
                _active={{}}
                _focus={{}}
                _hover={{
                  bg: "rgb(22, 93, 134)",
                }}
                onClick={() => setIsBrowserBroadcastSelected(false)}
              >
                streaming software
              </Button>
              <Button
                bg={isBrowserBroadcastSelected ? "#0c7fc1" : "transparent"}
                color="white"
                _active={{}}
                _focus={{}}
                _hover={{
                  bg: "rgb(22, 93, 134)",
                }}
                onClick={() => setIsBrowserBroadcastSelected(true)}
              >
                browser
              </Button>
            </Flex>
            <Flex direction="column" gap="5px">
              {isBrowserBroadcastSelected
                ? instructions[1].text.map((t) => {
                    return <Text fontSize="14px">{t}</Text>;
                  })
                : instructions[0].text.map((t) => {
                    return <Text fontSize="14px">{t}</Text>;
                  })}
            </Flex>
            {!isBrowserBroadcastSelected ? (
              <Flex direction="column" gap="5px">
                <Flex direction="column">
                  <Text fontSize="12px">Stream Key</Text>
                  <Flex alignItems={"center"}>
                    <input
                      style={{
                        border: "1px solid #5e5e5e",
                        background: "transparent",
                        color: "#a3a3a3",
                        padding: "5px",
                        height: "20px",
                        fontSize: "11px",
                      }}
                      readOnly
                      type={showStreamKey ? "text" : "password"}
                      value={streamKey}
                    />
                    <IconButton
                      aria-label="show-stream-key"
                      color="white"
                      icon={
                        showStreamKey ? (
                          <IoMdEye size="20" />
                        ) : (
                          <IoMdEyeOff size="20" />
                        )
                      }
                      height="20px"
                      bg="transparent"
                      _focus={{}}
                      _active={{}}
                      _hover={{}}
                      onClick={() => setShowStreamKey((prev) => !prev)}
                    />
                    <IconButton
                      aria-label="copy-stream-key"
                      color="white"
                      icon={<FaRegCopy />}
                      height="20px"
                      minWidth={"20px"}
                      bg="transparent"
                      _focus={{}}
                      _active={{}}
                      _hover={{}}
                      onClick={() => {
                        copy(streamKey);
                        handleCopy();
                      }}
                    />
                  </Flex>
                </Flex>
                <Flex direction="column">
                  <Text fontSize="12px">RTMP ingest</Text>
                  <Flex alignItems="center">
                    <input
                      style={{
                        border: "1px solid #5e5e5e",
                        background: "transparent",
                        color: "#a3a3a3",
                        padding: "5px",
                        height: "20px",
                        fontSize: "11px",
                      }}
                      readOnly
                      type={showRTMPIngest ? "text" : "password"}
                      value={"rtmp://rtmp.livepeer.com/live"}
                    />
                    <IconButton
                      aria-label="show-rtmp-ingest"
                      color="white"
                      icon={
                        showRTMPIngest ? (
                          <IoMdEye size="20" />
                        ) : (
                          <IoMdEyeOff size="20" />
                        )
                      }
                      height="20px"
                      bg="transparent"
                      _focus={{}}
                      _active={{}}
                      _hover={{}}
                      onClick={() => setShowRTMPIngest((prev) => !prev)}
                    />
                    <IconButton
                      aria-label="copy-rtmp-ingest"
                      color="white"
                      icon={<FaRegCopy />}
                      height="20px"
                      minWidth={"20px"}
                      bg="transparent"
                      _focus={{}}
                      _active={{}}
                      _hover={{}}
                      onClick={() => {
                        copy("rtmp://rtmp.livepeer.com/live");
                        handleCopy();
                      }}
                    />
                  </Flex>
                </Flex>
                <Flex direction="column">
                  <Text fontSize="12px">SRT ingest</Text>
                  <Flex alignItems={"center"}>
                    <input
                      style={{
                        border: "1px solid #5e5e5e",
                        background: "transparent",
                        color: "#a3a3a3",
                        padding: "5px",
                        height: "20px",
                        fontSize: "11px",
                      }}
                      readOnly
                      type={showSRTIngest ? "text" : "password"}
                      value={`srt://rtmp.livepeer.com:2935?streamid=${streamKey}`}
                    />
                    <IconButton
                      aria-label="show-srt-ingest"
                      color="white"
                      icon={
                        showSRTIngest ? (
                          <IoMdEye size="20" />
                        ) : (
                          <IoMdEyeOff size="20" />
                        )
                      }
                      height="20px"
                      bg="transparent"
                      _focus={{}}
                      _active={{}}
                      _hover={{}}
                      onClick={() => setShowSRTIngest((prev) => !prev)}
                    />
                    <IconButton
                      aria-label="copy-srt-ingest"
                      color="white"
                      icon={<FaRegCopy />}
                      height="20px"
                      minWidth={"20px"}
                      bg="transparent"
                      _focus={{}}
                      _active={{}}
                      _hover={{}}
                      onClick={() => {
                        copy(
                          `srt://rtmp.livepeer.com:2935?streamid=${streamKey}`
                        );
                        handleCopy();
                      }}
                    />
                  </Flex>
                </Flex>
              </Flex>
            ) : (
              <Flex direction="column">
                <Button
                  bg="#06aa53"
                  color={"white"}
                  _hover={{}}
                  _focus={{}}
                  _active={{}}
                  onClick={() => {
                    window.open(
                      `https://lvpr.tv/broadcast/${streamKey}`,
                      "_blank"
                    );
                  }}
                >
                  GO <ExternalLinkIcon ml="2px" />
                </Button>
                {/* <Button
                bg="#06aa53"
                color={"white"}
                _hover={{}}
                _focus={{}}
                _active={{}}
                onClick={() => {
                  setIsBroadcasting((prev) => !prev);
                }}
              >
                GO
              </Button> */}
              </Flex>
            )}
          </Flex>
        ) : (
          <MigrateToLivePeer />
        )}
      </Flex>
    </Flex>
  );
};

const MigrateToLivePeer = () => {
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
        ownerAddress: channelQueryData?.owner?.address,
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
      timeout = setTimeout(() => window.location.reload(), 3000);
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
      <Flex direction="column" gap="10px" justifyContent={"center"}>
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
              Unlonely had recently upgraded its livestreaming framework.
            </Text>
            <Text textAlign={"center"}>
              Please click the button below to get your new stream key.
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
              OK, let's see it
            </Button>
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default ChannelStreamerPerspective;
