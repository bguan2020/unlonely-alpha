import {
  Flex,
  Button,
  Text,
  IconButton,
  useToast,
  Spinner,
  Switch,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useEffect, useMemo, useState } from "react";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import { FaRegCopy } from "react-icons/fa";
import copy from "copy-to-clipboard";
import LivepeerBroadcast from "../stream/LivepeerBroadcast";
import useMigrateChannelToLivepeer from "../../hooks/server/useMigrateChannelToLivepeer";
import useUpdateChannelAllowNfcs from "../../hooks/server/useUpdateChannelAllowNfcs";
import {
  AblyChannelPromise,
  CHANGE_CHANNEL_DETAILS_EVENT,
} from "../../constants";
import useUpdateLivepeerStreamData from "../../hooks/server/useUpdateLivepeerStreamData";
import { LuClapperboard } from "react-icons/lu";
import { BiVideoRecording } from "react-icons/bi";
import StreamComponent from "../stream/StreamComponent";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { GetLivepeerStreamDataQuery } from "../../generated/graphql";

const ChannelStreamerPerspective = ({
  ablyChannel,
  livepeerData,
}: {
  ablyChannel: AblyChannelPromise;
  livepeerData?: GetLivepeerStreamDataQuery["getLivepeerStreamData"];
}) => {
  const toast = useToast();
  const { isStandalone } = useUserAgent();

  const { channel } = useChannelContext();
  const { channelQueryData, channelDetails } = channel;

  const [canLivepeerRecord, setCanLivepeerRecord] = useState(true);

  const [showStreamKey, setShowStreamKey] = useState(false);
  const [showRTMPIngest, setShowRTMPIngest] = useState(false);
  const [showSRTIngest, setShowSRTIngest] = useState(false);

  const { updateLivepeerStreamData, loading: updateLivepeerStreamDataLoading } =
    useUpdateLivepeerStreamData({});

  const { updateChannelAllowNfcs, loading: updateChannelAllowNfcsLoading } =
    useUpdateChannelAllowNfcs({});

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

  const callNfcsChange = async (newNfcs: boolean) => {
    const res = await updateChannelAllowNfcs({
      id: channelQueryData?.id,
      allowNfcs: newNfcs,
    });
    ablyChannel?.publish({
      name: CHANGE_CHANNEL_DETAILS_EVENT,
      data: {
        body: JSON.stringify({
          channelName: channelDetails?.channelName,
          channelDescription: channelDetails?.channelDescription,
          chatCommands: channelDetails?.chatCommands,
          allowNfcs: res?.res?.allowNFCs ?? false,
        }),
      },
    });
  };

  const callUpdateLivepeerStreamData = async (canRecord: boolean) => {
    const res = await updateLivepeerStreamData({
      streamId: channelQueryData?.livepeerStreamId,
      canRecord,
    });
    setCanLivepeerRecord(res?.res?.record ?? false);
  };

  useEffect(() => {
    const init = async () => {
      if (livepeerData) setCanLivepeerRecord(livepeerData?.record ?? false);
    };
    init();
  }, [livepeerData]);

  return (
    <Flex
      width={"100%"}
      direction={"column"}
      gap="10px"
      h={!isStandalone ? "80vh" : "25vh"}
      data-tour="s-step-1"
      position={isStandalone ? "fixed" : "relative"}
    >
      {!(isStandalone && !playbackId) && (
        <Flex
          width={"100%"}
          position="relative"
          justifyContent={"center"}
          h={
            !isStandalone
              ? playbackId
                ? ["75%", "75%", "75%", "90%"]
                : "80%"
              : "100%"
          }
        >
          {playbackId ? (
            <LivepeerBroadcast streamKey={streamKey} />
          ) : (
            <StreamComponent isStreamer />
          )}
        </Flex>
      )}
      {isStandalone && !playbackId && <MigrateToLivePeer />}
      {!isStandalone && (
        <Flex
          bg="#131323"
          p="10px"
          h={playbackId ? ["25%", "25%", "25%", "10%"] : "20%"}
          width="100%"
          justifyContent={"center"}
        >
          {playbackId && streamKey ? (
            <Flex
              gap="20px"
              width={"100%"}
              alignItems={"center"}
              justifyContent={"space-evenly"}
            >
              <Flex
                gap="15px"
                direction={["column", "column", "column", "row"]}
              >
                <Flex>
                  <Flex direction="column" gap="5px">
                    <Text fontSize="12px">Stream Key</Text>
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
                  </Flex>
                  <Flex direction="column" gap="5px">
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
                <Flex>
                  <Flex direction="column" gap="5px">
                    <Text fontSize="12px">RTMP ingest</Text>
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
                  </Flex>
                  <Flex direction="column" gap="5px">
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
                <Flex>
                  <Flex direction="column" gap="5px">
                    <Text fontSize="12px">SRT ingest</Text>
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
                  </Flex>
                  <Flex direction="column" gap="5px">
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
              <Flex
                gap="0.5rem"
                justifyContent={"space-evenly"}
                direction="column"
              >
                <Popover trigger="hover" placement="right" openDelay={300}>
                  <PopoverTrigger>
                    <Flex alignItems={"center"} gap="0.5rem">
                      <BiVideoRecording size={20} />

                      {updateLivepeerStreamDataLoading ? (
                        <Spinner />
                      ) : (
                        <Switch
                          isChecked={canLivepeerRecord}
                          onChange={() => {
                            callUpdateLivepeerStreamData(!canLivepeerRecord);
                          }}
                        />
                      )}
                    </Flex>
                  </PopoverTrigger>
                  <PopoverContent
                    bg="#343dbb"
                    border="none"
                    width="100%"
                    p="2px"
                  >
                    <PopoverArrow bg="#343dbb" />
                    <Text fontSize="12px" textAlign={"center"}>
                      toggle recording
                    </Text>
                  </PopoverContent>
                </Popover>
                <Popover trigger="hover" placement="right" openDelay={300}>
                  <PopoverTrigger>
                    <Flex alignItems={"center"} gap="0.5rem">
                      <LuClapperboard size={20} />
                      {updateChannelAllowNfcsLoading ? (
                        <Spinner />
                      ) : (
                        <Switch
                          isChecked={channelDetails?.allowNfcs}
                          onChange={() => {
                            callNfcsChange(!channelDetails?.allowNfcs);
                          }}
                        />
                      )}
                    </Flex>
                  </PopoverTrigger>
                  <PopoverContent
                    bg="#343dbb"
                    border="none"
                    width="100%"
                    p="2px"
                  >
                    <PopoverArrow bg="#343dbb" />
                    <Text fontSize="12px" textAlign={"center"}>
                      toggle clipping
                    </Text>
                  </PopoverContent>
                </Popover>
              </Flex>
            </Flex>
          ) : (
            <MigrateToLivePeer />
          )}
        </Flex>
      )}
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
              Unlonely had recently upgraded its livestreaming framework.
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
              OK, let's see it
            </Button>
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default ChannelStreamerPerspective;
