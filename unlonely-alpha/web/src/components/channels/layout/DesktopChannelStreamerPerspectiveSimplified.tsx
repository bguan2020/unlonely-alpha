import {
  Flex,
  Text,
  IconButton,
  useToast,
  Spinner,
  Switch,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  Button,
} from "@chakra-ui/react";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { useEffect, useMemo, useState } from "react";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import { FaRegCopy } from "react-icons/fa";
import { FaCode } from "react-icons/fa";
import { RiLiveFill } from "react-icons/ri";

import copy from "copy-to-clipboard";
import useUpdateChannelAllowNfcs from "../../../hooks/server/channel/useUpdateChannelAllowNfcs";
import {
  AblyChannelPromise,
  CHANGE_CHANNEL_DETAILS_EVENT,
  DESKTOP_VIDEO_VH,
  MOBILE_VIDEO_VH,
  STREAMER_MIGRATION_URL_QUERY_PARAM,
} from "../../../constants";
import useUpdateLivepeerStreamData from "../../../hooks/server/channel/useUpdateLivepeerStreamData";
import { LuClapperboard } from "react-icons/lu";
import { BiVideoRecording } from "react-icons/bi";
import StreamComponent from "../../stream/StreamComponent";
import useUserAgent from "../../../hooks/internal/useUserAgent";
import { GetLivepeerStreamDataQuery } from "../../../generated/graphql";
import { useRouter } from "next/router";
import { TransactionModalTemplate } from "../../transactions/TransactionModalTemplate";
import { PlaybackInfo } from "livepeer/models/components/playbackinfo";
import LivepeerPlayer from "../../stream/LivepeerPlayer";
import { getSrc } from "@livepeer/react/external";
import ChannelDesc from "../ChannelDesc";
import { MigrateToLivePeer } from "./MigrateToLivepeer";
import { SingleTempTokenTimerView } from "../temp/TempTokenTimerView";
import { VersusTempTokenTimerView } from "../versus/VersusTokenTimerView";
import EmbedVideoModal from "../EmbedVideoModal";
import { OwnerPastTokens } from "./OwnerPastTokens";

export const DesktopChannelStreamerPerspectiveSimplified = ({
  ablyChannel,
  livepeerData,
  playbackData,
  mode,
}: {
  ablyChannel: AblyChannelPromise;
  livepeerData?: GetLivepeerStreamDataQuery["getLivepeerStreamData"];
  playbackData:
    | {
        infra: "aws";
      }
    | {
        infra: "livepeer";
        livepeerPlaybackInfo: PlaybackInfo;
      };
  mode: "single-temp-token" | "versus-mode" | "";
}) => {
  const toast = useToast();
  const { isStandalone } = useUserAgent();
  const router = useRouter();

  const { channel } = useChannelContext();
  const { channelQueryData, realTimeChannelDetails, isOwner } = channel;

  const [canLivepeerRecord, setCanLivepeerRecord] = useState(true);

  const [showStreamKey, setShowStreamKey] = useState(false);
  const [showRTMPIngest, setShowRTMPIngest] = useState(false);

  const [streamerMigrateModal, setStreamerMigrateModal] = useState(false);
  const [embedVideoModal, setEmbedVideoModal] = useState(false);

  const { updateLivepeerStreamData, loading: updateLivepeerStreamDataLoading } =
    useUpdateLivepeerStreamData({});

  const { updateChannelAllowNfcs, loading: updateChannelAllowNfcsLoading } =
    useUpdateChannelAllowNfcs({});

  const streamKey = useMemo(() => {
    return channelQueryData?.streamKey;
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
          channelName: realTimeChannelDetails?.channelName,
          channelDescription: realTimeChannelDetails?.channelDescription,
          chatCommands: realTimeChannelDetails?.chatCommands,
          allowNfcs: res?.res?.allowNFCs ?? false,
          isLive: realTimeChannelDetails?.isLive,
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

  useEffect(() => {
    if (router.query[STREAMER_MIGRATION_URL_QUERY_PARAM]) {
      setStreamerMigrateModal(true);
      const newPath = router.pathname;
      const newQuery = { ...router.query };
      delete newQuery[STREAMER_MIGRATION_URL_QUERY_PARAM];

      router.replace(
        {
          pathname: newPath,
          query: newQuery,
        },
        undefined,
        { shallow: true }
      );
    }
  }, [router, isOwner]);

  return (
    <Flex
      width={"100%"}
      direction={"column"}
      gap="10px"
      h={!isStandalone ? `${DESKTOP_VIDEO_VH}%` : `${MOBILE_VIDEO_VH}vh`}
      position={!isStandalone ? "relative" : "fixed"}
    >
      <TransactionModalTemplate
        isOpen={streamerMigrateModal}
        handleClose={() => setStreamerMigrateModal(false)}
        title={"Migration Complete"}
        cannotClose
        confirmButton={"Got it"}
        onSend={() => setStreamerMigrateModal(false)}
        canSend
      >
        <Flex
          direction="column"
          bg="rgba(0, 0, 0, 0.4)"
          p="5px"
          borderRadius="15px"
        >
          <Text
            fontSize={"17px"}
            fontWeight="bold"
            textAlign="center"
            color="red.300"
          >
            IMPORTANT
          </Text>
          <Text textAlign="center">
            if you are using a streaming software like OBS, please update your
            stream credentials now with the new key and server URL from your
            dashboard - otherwise your stream will not work the next time you go
            live!
          </Text>
        </Flex>
      </TransactionModalTemplate>
      <EmbedVideoModal
        title={"Embed Video"}
        isOpen={embedVideoModal}
        handleClose={() => setEmbedVideoModal(false)}
      />
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
          gap="10px"
        >
          {playbackId && streamKey ? (
            <>
              {/* <LivepeerBroadcast streamKey={streamKey} /> */}
              {playbackData.infra === "livepeer" && !isStandalone && (
                <Flex
                  direction="column"
                  // width={"30%"}
                  width="100%"
                  justifyContent={"center"}
                  gap="5px"
                >
                  {mode === "single-temp-token" && (
                    <SingleTempTokenTimerView disableChatbot={false} />
                  )}
                  {mode === "versus-mode" && (
                    <VersusTempTokenTimerView disableChatbot={false} />
                  )}
                  <LivepeerPlayer
                    src={getSrc(playbackData.livepeerPlaybackInfo)}
                  />
                </Flex>
              )}
            </>
          ) : (
            <StreamComponent playbackData={playbackData} isStreamer />
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
          data-tour="s-step-3"
        >
          {playbackId && !streamKey ? (
            <Text fontSize="12px" color="white">
              Your channel is currently missing some data, please wait as we
              update it on our end.
            </Text>
          ) : playbackId && streamKey ? (
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
              </Flex>
              <Popover trigger="hover" placement="bottom" openDelay={300}>
                <PopoverTrigger>
                  <Button
                    bg={"transparent"}
                    onClick={() =>
                      window.open(
                        `https://lvpr.tv/broadcast/${streamKey}`,
                        "_blank"
                      )
                    }
                    _hover={{ bg: "#013eb9" }}
                  >
                    <Flex alignItems={"center"} gap="5px" color="white">
                      <RiLiveFill size={"25px"} />
                      inbrowser stream
                    </Flex>
                  </Button>
                </PopoverTrigger>
                <PopoverContent bg="#343dbb" border="none" width="100%" p="2px">
                  <PopoverArrow bg="#343dbb" />
                  <Text fontSize="12px" textAlign={"center"} width="200px">
                    want to start streaming with zero setup? use our in-browser
                    streaming feature, accept permissions and you're live! try
                    screensharing in the bottom right corner there
                  </Text>
                </PopoverContent>
              </Popover>
              {channelQueryData?.slug && playbackId && (
                <Popover trigger="hover" placement="bottom" openDelay={300}>
                  <PopoverTrigger>
                    <Button
                      bg={"transparent"}
                      onClick={() => setEmbedVideoModal(true)}
                      _hover={{ bg: "#013eb9" }}
                    >
                      <Flex alignItems={"center"} gap="5px" color="white">
                        <FaCode size={"25px"} />
                        embed video
                      </Flex>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    bg="#343dbb"
                    border="none"
                    width="100%"
                    p="2px"
                  >
                    <PopoverArrow bg="#343dbb" />
                    <Text fontSize="12px" textAlign={"center"} width="200px">
                      looking for a way to embed unlonely streams into your own
                      site? click here for html code! reach out to @dnnyfung on
                      telegram if experiencing issues
                    </Text>
                  </PopoverContent>
                </Popover>
              )}
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
                      save streams as recordings
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
                          isChecked={realTimeChannelDetails?.allowNfcs}
                          onChange={() => {
                            callNfcsChange(!realTimeChannelDetails?.allowNfcs);
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
                      allow viewers to clip highlights from stream
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
      <Flex justifyContent={"space-between"}>
        <ChannelDesc />
        <OwnerPastTokens />
      </Flex>
    </Flex>
  );
};
