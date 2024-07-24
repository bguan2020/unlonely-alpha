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
import { useRef, useState, useEffect, useCallback } from "react";
import { MdDragIndicator } from "react-icons/md";

import { CLIP_CHANNEL_ID_QUERY_PARAM } from "../constants";
import { useRouter } from "next/router";
import useCreateClip from "../hooks/server/channel/useCreateClip";
import useTrimVideo from "../hooks/server/channel/useTrimVideo";
import { WavyText } from "../components/general/WavyText";
import { useZoraCreate1155 } from "../hooks/contracts/useZoraCreate1155";
import { pinFileWithPinata, pinJsonWithPinata } from "../utils/pinata";
import { ContractMetadataJson } from "@zoralabs/protocol-sdk";
import { GET_CHANNEL_BY_ID_QUERY } from "../constants/queries";
import { useLazyQuery } from "@apollo/client";
import { GetChannelByIdQuery } from "../generated/graphql";
import Header from "../components/navigation/Header";

const Clip = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [clipRange, setClipRange] = useState<[number, number]>([0, 0]);
  const [title, setTitle] = useState("");
  const [channelId, setChannelId] = useState<string | null>(null);
  const [roughClipUrl, setRoughClipUrl] = useState(
    // ""
    "https://openseauserdata.com/files/b29ce5e85b7dc97eeb6a571b48644231.mp4"
  );
  const [isCallingCreate1155, setIsCallingCreate1155] =
    useState<boolean>(false);
  const [existingContractAddress, setExistingContractAddress] = useState<
    `0x${string}` | null
  >(null);
  const [contractMetadataJsonUri, setContractMetadataJsonUri] =
    useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [
    getChannelById,
    {
      loading: getChannelByIdLoading,
      data: getChannelByIdData,
      error: getChannelByIdError,
    },
  ] = useLazyQuery<GetChannelByIdQuery>(GET_CHANNEL_BY_ID_QUERY, {
    variables: { id: channelId },
    fetchPolicy: "network-only",
  });

  const { writeAsync: create1155Token } = useZoraCreate1155(
    contractMetadataJsonUri
      ? {
          name: "testContract",
          uri: contractMetadataJsonUri,
        }
      : existingContractAddress ?? undefined,
    {
      onWriteSuccess: (data) => {
        console.log("create1155Token write success", data);
      },
      onWriteError: (error) => {
        console.log("create1155Token write error", error);
      },
      onTxSuccess: (data) => {
        console.log("create1155Token tx success", data);
      },
      onTxError: (error) => {
        console.log("create1155Token tx error", error);
      },
    }
  );

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

  useEffect(() => {
    const init = async () => {
      if (router.query[CLIP_CHANNEL_ID_QUERY_PARAM]) {
        setChannelId(router.query[CLIP_CHANNEL_ID_QUERY_PARAM] as string);
        const newPath = router.pathname;
        const newQuery = { ...router.query };
        delete newQuery[CLIP_CHANNEL_ID_QUERY_PARAM];

        router.replace(
          {
            pathname: newPath,
            query: newQuery,
          },
          undefined,
          { shallow: true }
        );
      }
    };
    init();
  }, [router]);

  useEffect(() => {
    if (channelId) getChannelById();
  }, [channelId]);

  useEffect(() => {
    const init = async () => {
      if (!getChannelByIdData) return;
      setIsLoading(true);
      try {
        const { res } = await createClip({
          title: `rough-clip-${Date.now()}`,
          channelId: getChannelByIdData.getChannelById?.id,
          livepeerPlaybackId:
            getChannelByIdData.getChannelById?.livepeerPlaybackId,
          noDatabasePush: true,
        });
        const url = res?.url;
        if (url) {
          setRoughClipUrl(url);
        } else {
          console.log("Error, url is missing");
        }
      } catch (e) {}
      setIsLoading(false);
    };
    init();
  }, [getChannelByIdData]);

  useEffect(() => {
    if (roughClipUrl && videoRef.current) {
      videoRef.current.load();
      videoRef.current.onloadedmetadata = () => {
        setClipRange([0, videoRef.current?.duration || 0]);
      };
    }
  }, [roughClipUrl]);

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

  const handleTrimVideo = useCallback(async () => {
    // if (
    //   !roughClipUrl ||
    //   !channelId ||
    //   clipRange[0] >= clipRange[1] ||
    //   !getChannelByIdData
    // )
    //   return;
    // const res = await trimVideo({
    //   startTime: clipRange[0],
    //   endTime: clipRange[1],
    //   videoLink: roughClipUrl,
    //   name: title,
    //   channelId: channelId ?? "",
    // });
    // const playbackUrl = res?.res?.videoLink;
    // if (!playbackUrl) {
    //   console.log("playback url not found");
    //   return;
    // }
    if (!existingContractAddress) {
      try {
        // const response = await fetch(playbackUrl);
        console.log("creating file blob");
        const response = await fetch(roughClipUrl);
        const blob = await response.blob();
        const file = new File([blob], "video.mp4", { type: "video/mp4" });
        const fileIpfsUrl = await pinFileWithPinata(file);
        console.log("fileIpfsUrl", fileIpfsUrl);
        const metadataJson: ContractMetadataJson = {
          description:
            getChannelByIdData?.getChannelById?.description ??
            "test description",
          image: fileIpfsUrl,
          name: getChannelByIdData?.getChannelById?.name ?? "test name",
        };
        const contractMetadataJsonUri = await pinJsonWithPinata(metadataJson);
        console.log("contractMetadataJsonUri", contractMetadataJsonUri);
        setContractMetadataJsonUri(contractMetadataJsonUri);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsCallingCreate1155(true);
      } catch (e) {
        console.log("pinning contract metadata to ipfs Error", e);
      }
    } else {
      setIsCallingCreate1155(true);
    }
  }, [
    roughClipUrl,
    clipRange,
    title,
    channelId,
    existingContractAddress,
    getChannelByIdData,
  ]);

  useEffect(() => {
    if (isCallingCreate1155 && create1155Token) create1155Token?.();
  }, [isCallingCreate1155, create1155Token]);

  return (
    <Flex h="100vh" bg="rgba(5, 0, 31, 1)" direction={"column"}>
      <Header />
      <Flex p="20" justifyContent={"center"}>
        <Flex flexDirection={"column"} gap="10px">
          {roughClipUrl ? (
            <video
              ref={videoRef}
              src={roughClipUrl.concat("#t=0.1")}
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
          {roughClipUrl && (
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
                  if (title) handleTrimVideo();
                }}
                isDisabled={!title}
              >
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  height="100%"
                  bg="green.400"
                  zIndex="1"
                />
                <Text position="relative" zIndex="2" width="100%">
                  {isLoading ? <Spinner /> : "Send to publish"}
                </Text>
              </Button>
            </>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
export default Clip;
