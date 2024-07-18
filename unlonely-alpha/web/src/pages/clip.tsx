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
} from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
// import * as tus from "tus-js-client";
import { MdDragIndicator } from "react-icons/md";

// import { convertToHHMMSS } from "../utils/time";
import useRequestUpload from "../hooks/server/channel/useRequestUpload";
import {
  CLIP_CHANNEL_ID_QUERY_PARAM,
  CLIP_PLAYBACK_ID_QUERY_PARAM,
} from "../constants";
import { useRouter } from "next/router";
import useCreateClip from "../hooks/server/channel/useCreateClip";
import axios from "axios";
import useTrimVideo from "../hooks/server/channel/useTrimVideo";

// let ffmpeg: any; //Store the ffmpeg instance

const Clip = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [clipRange, setClipRange] = useState<[number, number]>([0, 0]);
  const [trimmedVideoURL, setTrimmedVideoURL] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [channelId, setChannelId] = useState<string | null>(null);
  const [clipUrl, setClipUrl] = useState(
    ""
    // "https://openseauserdata.com/files/b29ce5e85b7dc97eeb6a571b48644231.mp4"
  );
  const [publishingPercentage, setPublishingPercentage] = useState<number>(0);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { requestUpload } = useRequestUpload({
    onError: () => {
      console.log("Error");
    },
  });

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

  // const loadScript = (src: any) => {
  //   return new Promise((onFulfilled, _) => {
  //     const script = document.createElement("script") as any;
  //     let loaded: any;
  //     script.async = "async";
  //     script.defer = "defer";
  //     script.setAttribute("src", src);
  //     script.onreadystatechange = script.onload = () => {
  //       if (!loaded) {
  //         onFulfilled(script);
  //       }
  //       loaded = true;
  //     };
  //     script.onerror = function () {
  //       console.log("Script failed to load");
  //     };
  //     document.getElementsByTagName("head")[0].appendChild(script);
  //   });
  // };

  // useEffect(() => {
  //   loadScript(
  //     "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.2/dist/ffmpeg.min.js"
  //   ).then(() => {
  //     if (typeof window !== "undefined") {
  //       ffmpeg = (window as any).FFmpeg.createFFmpeg({ log: true });
  //       ffmpeg.load().then(() => {
  //         setIsScriptLoaded(true);
  //       });
  //     }
  //   });
  // }, []);

  // const handleTrim = async () => {
  //   if (isScriptLoaded && title) {
  //     videoRef.current?.pause();
  //     setIsLoading(true);
  //     setTrimmedVideoURL("");
  //     const videoBlob = await fetch(clipUrl).then((res) => res.blob());
  //     const videoFile = new File([videoBlob], "in.mp4", {
  //       type: "video/mp4",
  //     });

  //     //Write video to memory
  //     ffmpeg.FS(
  //       "writeFile",
  //       "in.mp4",
  //       await (window as any).FFmpeg.fetchFile(videoFile)
  //     );

  //     console.log("wrote in.mp4 to memory");

  //     //Run the ffmpeg command to trim video
  //     await ffmpeg.run(
  //       "-i",
  //       "in.mp4",
  //       "-ss",
  //       `${convertToHHMMSS(clipRange[0].toString())}`,
  //       "-to",
  //       `${convertToHHMMSS(clipRange[1].toString())}`,
  //       "-c:v",
  //       "copy",
  //       "-c:a",
  //       "copy",
  //       "trimmed.mp4"
  //     );

  //     console.log("trimmed video");

  //     await ffmpeg.run(
  //       "-v",
  //       "quiet",
  //       "-print_format",
  //       "json",
  //       "-show_format",
  //       "-show_streams",
  //       "trimmed.mp4"
  //     );

  //     // Create an outro video with the watermark image
  //     const watermarkImage = await fetch("/images/unlonely-watermark.png").then(
  //       (res) => res.arrayBuffer()
  //     );
  //     ffmpeg.FS("writeFile", "watermark.png", new Uint8Array(watermarkImage));

  //     // await ffmpeg.run(
  //     //   "-i",
  //     //   "trimmed.mp4",
  //     //   "-i",
  //     //   "watermark.png",
  //     //   "-filter_complex",
  //     //   "overlay=W-w-10:H-h-10",
  //     //   "-codec:a",
  //     //   "copy",
  //     //   "final.mp4"
  //     // );

  //     // console.log("added watermark");

  //     await ffmpeg.run(
  //       "-loop",
  //       "1",
  //       "-i",
  //       "watermark.png",
  //       "-t",
  //       "3",
  //       "-vf",
  //       "scale=iw*1:ih*1, pad=1280:720:(ow-iw)/2:(oh-ih)/2", // Scale to 40% of original size and center
  //       "-c:v",
  //       "libx264",
  //       "-c:a",
  //       "aac",
  //       "outro.mp4"
  //     );

  //     console.log("created outro.mp4");

  //     // Verify the files exist in the FFmpeg file system
  //     const trimmedFileExists = ffmpeg
  //       .FS("readdir", "/")
  //       .includes("trimmed.mp4");
  //     const outroFileExists = ffmpeg.FS("readdir", "/").includes("outro.mp4");

  //     if (!trimmedFileExists || !outroFileExists) {
  //       throw new Error("Failed to create trimmed or outro video");
  //     }

  //     // Concatenate using filter_complex without worrying about audio
  //     await ffmpeg.run(
  //       "-i",
  //       "trimmed.mp4",
  //       "-i",
  //       "outro.mp4",
  //       "-filter_complex",
  //       "[0:v]fps=30,scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2[v1];[1:v]fps=30,scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2[v2];[v1][v2]concat=n=2:v=1[outv]",
  //       "-map",
  //       "[outv]",
  //       "-map",
  //       "0:a?",
  //       "final.mp4"
  //     );

  //     console.log("concatenated video");

  //     //Convert data to url and store in videoTrimmedUrl state
  //     const data = ffmpeg.FS("readFile", "final.mp4");
  //     const trimmedBlob = new Blob([data.buffer], { type: "video/mp4" });
  //     const trimmedUrl = URL.createObjectURL(trimmedBlob);
  //     const trimmedFile = new File([trimmedBlob], `${title}.mp4`, {
  //       type: "video/mp4",
  //     });

  //     // const { res } = await requestUpload({
  //     //   name: title,
  //     // });

  //     // const tusEndpoint = res?.tusEndpoint;

  //     // const upload = new tus.Upload(trimmedFile, {
  //     //   endpoint: tusEndpoint,
  //     //   retryDelays: [0, 1000, 3000, 5000],
  //     //   metadata: {
  //     //     filename: `${title}.mp4`,
  //     //     filetype: "video/mp4",
  //     //   },
  //     //   onError: function (error: any) {
  //     //     console.log("Failed because: ", error);
  //     //   },
  //     //   onProgress: function (bytesUploaded: number, bytesTotal: number) {
  //     //     const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
  //     //     setPublishingPercentage(parseFloat(percentage));
  //     //   },
  //     //   onSuccess: function () {
  //     //     console.log("Download %s from %s", upload.file, upload.url);
  //     //     setIsPublished(true);
  //     //   },
  //     // });

  //     // upload.findPreviousUploads().then(function (previousUploads) {
  //     //   // Found previous uploads so we select the first one.
  //     //   if (previousUploads.length) {
  //     //     upload.resumeFromPreviousUpload(previousUploads[0]);
  //     //   }

  //     //   // Start the upload
  //     //   upload.start();
  //     // });
  //     // postToTwitter(trimmedFile);
  //     setIsLoading(false);
  //     setTrimmedVideoURL(trimmedUrl);
  //   }
  // };

  const postToTwitter = async (trimmedFile: File) => {
    try {
      const formData = new FormData();
      formData.append("video", trimmedFile);
      formData.append("status", title);

      const uploadResponse = await axios.post(
        "http://localhost:4000/upload-video-to-twitter",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { mediaId } = uploadResponse.data;

      console.log("mediaId", mediaId);

      // await axios.post("http://localhost:4000/tweet", {
      //   status: "Here is a video upload test!",
      //   mediaId,
      // });

      alert("Tweet posted successfully!");
    } catch (error) {
      console.error("Failed to post tweet:", error);
      alert("Failed to post tweet.");
    }
  };

  return (
    <Flex p="20" h="100vh" bg="rgba(5, 0, 31, 1)">
      <Flex flexDirection={"column"} mx="auto" gap="10px">
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
        {clipUrl && (
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
        )}
        <Input
          variant="glow"
          placeholder={"title"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {!isPublished ? (
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
              {isLoading ? <Spinner /> : "Publish"}
            </Text>
          </Button>
        ) : (
          <Text>Published</Text>
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
