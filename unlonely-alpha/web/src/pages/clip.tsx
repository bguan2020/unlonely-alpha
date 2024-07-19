import {
  Button,
  Flex,
  Input,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Text,
  Box,
  Spinner,
  Skeleton,
} from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import { MdDragIndicator } from "react-icons/md";

import {
  CLIP_CHANNEL_ID_QUERY_PARAM,
  CLIP_PLAYBACK_ID_QUERY_PARAM,
} from "../constants";
import { useRouter } from "next/router";
import useCreateClip from "../hooks/server/channel/useCreateClip";
import useTrimVideo from "../hooks/server/channel/useTrimVideo";
import { WavyText } from "../components/general/WavyText";

const Clip = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [clipRange, setClipRange] = useState<[number, number]>([0, 0]);
  const [trimmedVideoURL, setTrimmedVideoURL] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [channelId, setChannelId] = useState<string | null>(null);
  const [clipUrl, setClipUrl] = useState(
    ""
    // "https://openseauserdata.com/files/b29ce5e85b7dc97eeb6a571b48644231.mp4"
  );
  const [publishingPercentage, setPublishingPercentage] = useState<number>(0);
  const [isPublishSent, setIsPublishSent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { createClip } = useCreateClip({
    onError: (e) => {
      console.log(e);
    },
  });

  const { trimVideo } = useTrimVideo({
    onError: () => {
      console.log("Error");
    },
  });

  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      if (
        router.query[CLIP_PLAYBACK_ID_QUERY_PARAM] &&
        router.query[CLIP_CHANNEL_ID_QUERY_PARAM]
      ) {
        const newPath = router.pathname;
        const newQuery = { ...router.query };
        delete newQuery[CLIP_PLAYBACK_ID_QUERY_PARAM];
        delete newQuery[CLIP_CHANNEL_ID_QUERY_PARAM];

        router.replace(
          {
            pathname: newPath,
            query: newQuery,
          },
          undefined,
          { shallow: true }
        );

        setChannelId(router.query[CLIP_CHANNEL_ID_QUERY_PARAM] as string);
        const { res } = await createClip({
          title: `rough-clip-${Date.now()}`,
          channelId: router.query[CLIP_CHANNEL_ID_QUERY_PARAM],
          livepeerPlaybackId: router.query[CLIP_PLAYBACK_ID_QUERY_PARAM],
          noDatabasePush: true,
        });
        const url = res?.url;
        if (url) {
          setClipUrl(url);
        } else {
          console.log("Error, url is missing");
        }
      }
    };
    init();
  }, [router]);

  useEffect(() => {
    if (clipUrl && videoRef.current) {
      videoRef.current.load();
      videoRef.current.onloadedmetadata = () => {
        setClipRange([0, videoRef.current?.duration || 0]);
      };
    }
  }, [clipUrl]);

  const handleRangeChange = (range: [number, number]) => {
    setClipRange(range);
    if (videoRef.current) {
      videoRef.current.currentTime = range[0];
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      if (currentTime >= clipRange[1]) {
        videoRef.current.currentTime = clipRange[0];
      }
    }
  };

  const handleSeeking = () => {
    if (videoRef.current) {
      if (videoRef.current.currentTime < clipRange[0]) {
        videoRef.current.currentTime = clipRange[0];
      }
    }
  };

  return (
    <Flex p="20" h="100vh" bg="rgba(5, 0, 31, 1)" justifyContent={"center"}>
      <Flex flexDirection={"column"} gap="10px">
        {clipUrl ? (
          <video
            ref={videoRef}
            src={clipUrl.concat("#t=0.1")}
            style={{
              height: "500px",
            }}
            onTimeUpdate={handleTimeUpdate}
            onSeeking={handleSeeking}
            controls
            onEnded={() => {
              videoRef.current!.currentTime = clipRange[0];
              videoRef.current!.play();
            }}
          />
        ) : (
          <>
            <Flex fontSize="20px" justifyContent={"center"}>
              <WavyText
                text="creating rough clip, please wait..."
                modifier={0.008}
              />
            </Flex>
            <Skeleton
              startColor="#575757"
              endColor="#b2b2b2ff"
              height={"500px"}
              width={"80vh"}
            ></Skeleton>
            <Skeleton
              startColor="#575757"
              endColor="#b2b2b2ff"
              height={"100px"}
              width={"80vh"}
            ></Skeleton>
            <Skeleton
              startColor="#575757"
              endColor="#b2b2b2ff"
              height={"50px"}
              width={"80vh"}
            ></Skeleton>
            <Skeleton
              startColor="#575757"
              endColor="#b2b2b2ff"
              height={"50px"}
              width={"80vh"}
            ></Skeleton>
          </>
        )}
        {clipUrl && !isPublishSent && (
          <>
            <RangeSlider
              aria-label={["min", "max"]}
              defaultValue={[0, 100]}
              min={0}
              max={videoRef.current?.duration || 100}
              value={clipRange}
              onChange={handleRangeChange}
            >
              <RangeSliderTrack height="40px" backgroundColor="#414141">
                <RangeSliderFilledTrack color={"#343dbb"} />
              </RangeSliderTrack>
              <RangeSliderThumb height={"40px"} borderRadius={0} index={0}>
                <MdDragIndicator color={"#343dbb"} size={"40"} />
              </RangeSliderThumb>
              <RangeSliderThumb height={"40px"} borderRadius={0} index={1}>
                <MdDragIndicator color={"#343dbb"} size={"40"} />
              </RangeSliderThumb>
            </RangeSlider>
            <Input
              variant="glow"
              placeholder={"title"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Button
              position="relative"
              onClick={() => {
                if (title) {
                  trimVideo({
                    startTime: clipRange[0],
                    endTime: clipRange[1],
                    videoLink: clipUrl,
                    name: title,
                    channelId: channelId ?? "",
                  });
                  console.log("request sent");
                  setIsPublishSent(true);
                }
              }}
              isDisabled={!title}
            >
              <Box
                position="absolute"
                top="0"
                left="0"
                height="100%"
                width={`${publishingPercentage}%`}
                bg="green.400"
                zIndex="1"
              />
              <Text position="relative" zIndex="2" width="100%">
                {isLoading ? <Spinner /> : "Send to publish"}
              </Text>
            </Button>
          </>
        )}
        {isPublishSent && (
          <>
            <Text>Publish request sent</Text>
            <Text>Great! We'll take care of everything from here for you.</Text>
            <Text>
              Once the clip is ready, it will be available on the homepage.
            </Text>
            <Text>You may now close this window and return to the stream.</Text>
          </>
        )}
        {trimmedVideoURL && (
          <video
            controls
            loop
            style={{
              height: "500px",
            }}
          >
            <source src={trimmedVideoURL} type={"video/mp4"} />
          </video>
        )}
      </Flex>
    </Flex>
  );
};
export default Clip;
