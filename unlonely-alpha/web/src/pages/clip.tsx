import {
  Button,
  Flex,
  Input,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  // Text,
} from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import * as tus from "tus-js-client";
import { MdDragIndicator } from "react-icons/md";

import { convertToHHMMSS } from "../utils/time";
import useRequestUpload from "../hooks/server/channel/useRequestUpload";

let ffmpeg: any; //Store the ffmpeg instance

const Clip = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [clipRange, setClipRange] = useState<[number, number]>([0, 0]);
  const [trimmedVideoURL, setTrimmedVideoURL] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [title, setTitle] = useState("");

  const { requestUpload } = useRequestUpload({
    onError: () => {
      console.log("Error");
    },
  });

  const clipUrl =
    "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/0f303hhuyems5o1m/720p0.mp4";

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

  const loadScript = (src: any) => {
    return new Promise((onFulfilled, _) => {
      const script = document.createElement("script") as any;
      let loaded: any;
      script.async = "async";
      script.defer = "defer";
      script.setAttribute("src", src);
      script.onreadystatechange = script.onload = () => {
        if (!loaded) {
          onFulfilled(script);
        }
        loaded = true;
      };
      script.onerror = function () {
        console.log("Script failed to load");
      };
      document.getElementsByTagName("head")[0].appendChild(script);
    });
  };

  useEffect(() => {
    //Load the ffmpeg script
    loadScript(
      "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.2/dist/ffmpeg.min.js"
    ).then(() => {
      if (typeof window !== "undefined") {
        // creates a ffmpeg instance.
        ffmpeg = (window as any).FFmpeg.createFFmpeg({ log: true });
        //Load ffmpeg.wasm-core script
        ffmpeg.load();
        //Set true that the script is loaded
        setIsScriptLoaded(true);
      }
    });
  }, []);

  const handleTrim = async () => {
    if (isScriptLoaded && title) {
      videoRef.current?.pause();
      const videoBlob = await fetch(clipUrl).then((res) => res.blob());
      const videoFile = new File([videoBlob], "in.mp4", {
        type: "video/mp4",
      });

      //Write video to memory
      ffmpeg.FS(
        "writeFile",
        "in.mp4",
        await (window as any).FFmpeg.fetchFile(videoFile)
      );
      //Run the ffmpeg command to trim video
      await ffmpeg.run(
        "-i",
        "in.mp4",
        "-ss",
        `${convertToHHMMSS(clipRange[0].toString())}`,
        "-to",
        `${convertToHHMMSS(clipRange[1].toString())}`,
        "-c:v",
        "copy",
        "-c:a",
        "copy",
        "out.mp4"
      );
      //Convert data to url and store in videoTrimmedUrl state
      const data = ffmpeg.FS("readFile", "out.mp4");
      const url = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );

      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], `${title}.mp4`, { type: "video/mp4" });

      const { res } = await requestUpload({
        name: title,
      });

      const tusEndpoint = res?.tusEndpoint;

      const upload = new tus.Upload(file, {
        endpoint: tusEndpoint,
        retryDelays: [0, 1000, 3000, 5000],
        metadata: {
          filename: `${title}.mp4`,
          filetype: "video/mp4",
        },
        onError: function (error: any) {
          console.log("Failed because: ", error);
        },
        onProgress: function (bytesUploaded: number, bytesTotal: number) {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          console.log(bytesUploaded, bytesTotal, percentage);
        },
        onSuccess: function () {
          console.log("Download %s from %s", upload.file, upload.url);
        },
      });

      upload.findPreviousUploads().then(function (previousUploads) {
        // Found previous uploads so we select the first one.
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }

        // Start the upload
        upload.start();
      });

      setTrimmedVideoURL(url);
    }
  };

  return (
    <Flex h="100vh" p="20" bg="rgba(5, 0, 31, 1)">
      <Flex flexDirection={"column"} mx="auto" gap="10px">
        <video
          ref={videoRef}
          src={clipUrl.concat("#t=0.1")}
          style={{
            height: "60%",
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
            <RangeSliderThumb boxSize={"40px"} borderRadius={0} index={0}>
              <MdDragIndicator color={"#343dbb"} size={"30"} />
            </RangeSliderThumb>
            <RangeSliderThumb boxSize={"40px"} borderRadius={0} index={1}>
              <MdDragIndicator color={"#343dbb"} size={"30"} />
            </RangeSliderThumb>
          </RangeSlider>
        )}
        <Input
          variant="glow"
          placeholder={"title"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button onClick={handleTrim}>Publish</Button>
        {trimmedVideoURL && (
          <video
            controls
            loop
            style={{
              height: "60%",
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
