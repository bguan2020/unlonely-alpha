import {
  Button,
  Flex,
  Input,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Text,
  Progress,
  Spinner,
} from "@chakra-ui/react";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { MdDragIndicator } from "react-icons/md";
import * as tus from "tus-js-client";
import Link from "next/link";

import {
  CHAT_MESSAGE_EVENT,
  CLIP_CHANNEL_ID_QUERY_PARAM,
  InteractionType,
  NULL_ADDRESS,
  UNLONELY_LOGO_IPFS_URL,
} from "../constants";
import { useRouter } from "next/router";
import useCreateClip from "../hooks/server/channel/useCreateClip";
import { SplitV1Client, SplitRecipient } from "@0xsplits/splits-sdk";
import {
  createFileBlobAndPinWithPinata,
  pinJsonWithPinata,
} from "../utils/pinata";
import {
  GET_CHANNEL_BY_ID_QUERY,
  GET_LIVEPEER_CLIP_DATA_QUERY,
  GET_USER_CHANNEL_CONTRACT_1155_MAPPING_QUERY,
} from "../constants/queries";
import { useLazyQuery } from "@apollo/client";
import {
  GetChannelByIdQuery,
  GetLivepeerClipDataQuery,
  GetUserChannelContract1155MappingQuery,
  PostNfcInput,
} from "../generated/graphql";
import Header from "../components/navigation/Header";
import {
  Address,
  Chain,
  HttpTransport,
  PublicClient,
  TransactionReceipt,
  encodeFunctionData,
} from "viem";
import {
  useConnectorClient,
  usePublicClient,
  useSendTransaction,
  useWriteContract,
} from "wagmi";
import { ExtractAbiFunction, AbiParametersToPrimitiveTypes } from "abitype";
import {
  ContractType,
  createCreatorClient,
  makeMediaTokenMetadata,
} from "@zoralabs/protocol-sdk";
import useUpdateUserChannelContract1155Mapping from "../hooks/server/channel/useUpdateUserChannelContract1155Mapping";
import { findMostFrequentString } from "../utils/findMostFrequencyString";
import usePostNFC from "../hooks/server/usePostNFC";
import { returnDecodedTopics } from "../utils/contract";
import { useUser } from "../hooks/context/useUser";
import { zoraCreator1155Abi } from "../constants/abi/ZoraCreator1155";
import { multicall3Abi } from "../constants/abi/multicall3";
import { useAblyChannel } from "../hooks/chat/useChatChannel";
import { SenderStatus } from "../constants/types/chat";
import centerEllipses from "../utils/centerEllipses";
import { useNetworkContext } from "../hooks/context/useNetwork";
import AppLayout from "../components/layout/AppLayout";
import { convertToHHMMSS } from "../utils/time";
import useRequestUpload from "../hooks/server/channel/useRequestUpload";
import { areAddressesEqual } from "../utils/validation/wallet";
import { safeIncludes } from "../utils/safeFunctions";

let ffmpeg: any; //Store the ffmpeg instance

export const multicall3Address = "0xcA11bde05977b3631167028862bE2a173976CA11";
export const PROTOCOL_ADDRESS = "0x53D6D64945A67658C66730Ff4a038eb298eC8902";

const images = [
  { src: "/images/nyan-cat-every-nyan.gif", top: "10vh", delay: "4s" },
  { src: "/images/nyan-cat-every-nyan.gif", top: "30vh", delay: "2s" },
  { src: "/images/nyan-cat-every-nyan.gif", top: "50vh", delay: "1s" },
  { src: "/images/nyan-cat-every-nyan.gif", top: "70vh", delay: "6s" },
  { src: "/images/nyan-cat-every-nyan.gif", top: "90vh", delay: "9s" },
];

const carouselProgressStatusMessages = [
  "...trimming video...",
  "...uploading video...",
  "...uploading blob to ipfs...",
];

const PLEASE_CONTINUE_TRANSACTION = "Please approve the transaction";

export type Aggregate3ValueFunction = ExtractAbiFunction<
  typeof multicall3Abi,
  "aggregate3Value"
>["inputs"];
export type Aggregate3ValueCall =
  AbiParametersToPrimitiveTypes<Aggregate3ValueFunction>[0][0];

type FinalClipObject = PostNfcInput & {
  id?: string;
  owner?: { username?: string; address: string };
};

const Clip = () => {
  const router = useRouter();
  const { user } = useUser();
  const { network } = useNetworkContext();
  const publicClient = usePublicClient();
  const { data: walletClient } = useConnectorClient();

  const videoRef = useRef<HTMLVideoElement>(null);

  const [clipRange, setClipRange] = useState<[number, number]>([0, 0]);
  const [title, setTitle] = useState("");
  const [channelId, setChannelId] = useState<string | null>(null);
  const [transactionProgressMessage, setTransactionProgressMessage] = useState<
    string | null
  >(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const [carouselProgressIndex, setCarouselProgressIndex] = useState(0);
  const [pageState, setPageState] = useState<
    | "lacking"
    | "offline"
    | "clipping"
    | "selecting"
    | "trimming"
    | "transaction"
    | "redirecting"
    | "error"
  >("lacking");
  const [trimProgressPercentage, setTrimProgressPercentage] = useState(0);
  const [roughClipUrl, setRoughClipUrl] = useState(
    ""
    // "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/85f88w1q70abhfau/720p0.mp4"
  );
  const [finalClipObject, setFinalClipObject] = useState<
    FinalClipObject | undefined
  >(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nyanCatFaceForward, setNyanCatFaceForward] = useState(
    new Array(images.length).fill(true)
  );
  const [contractObject, setContractObject] = useState<ContractType>({
    name: "",
    uri: "",
  });
  const [videoThumbnail, setVideoThumbnail] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [tokenJsonMetaDataUri, setTokenJsonMetaDataUri] = useState("");
  const [existingContract1155Address, setExistingContract1155Address] =
    useState<`0x${string}` | null>(null);

  const { sendTransaction } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();

  const handleClickNyanCat = (index: number) => {
    setNyanCatFaceForward((prev) => {
      const newNyanCatFaceForward = [...prev];
      newNyanCatFaceForward[index] = !prev[index];

      const imageElement = document.getElementById(`scrolling-image-${index}`);
      if (imageElement) {
        imageElement.style.animation = "none";
        imageElement.style.animation = `${
          newNyanCatFaceForward[index]
            ? "scrollImageForward"
            : "scrollImageBackward"
        } 20s linear infinite`;
      }

      return newNyanCatFaceForward;
    });
  };

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

  const canTrim = useMemo(() => {
    return (
      roughClipUrl &&
      channelId &&
      clipRange[0] < clipRange[1] &&
      getChannelByIdData?.getChannelById &&
      walletClient?.account.address &&
      user &&
      title &&
      clipRange[1] - clipRange[0] <= 30 &&
      clipRange[1] - clipRange[0] >= 2 &&
      title.length <= 100
    );
  }, [roughClipUrl, clipRange, title, channelId, getChannelByIdData, user]);

  useEffect(() => {
    if (pageState === "trimming") {
      const interval = setInterval(() => {
        setTrimProgressPercentage((prevPercentage) => prevPercentage + 2);
        setCarouselProgressIndex((prevIndex) => {
          if (prevIndex === carouselProgressStatusMessages.length - 1) {
            return 0;
          }
          return prevIndex + 1;
        });
      }, 3000);

      // Cleanup interval on component unmount or when trimming changes
      return () => clearInterval(interval);
    }
    if (pageState === "transaction") handleTransaction();
  }, [pageState]);

  const chatChannel = useMemo(
    () =>
      `persistMessages:${getChannelByIdData?.getChannelById?.slug}-chat-channel`,
    [getChannelByIdData]
  );

  const [channel] = useAblyChannel(chatChannel, async (message) => {
    return message;
  });

  const [fetchUserChannelContract1155Mapping] =
    useLazyQuery<GetUserChannelContract1155MappingQuery>(
      GET_USER_CHANNEL_CONTRACT_1155_MAPPING_QUERY
    );

  const [fetchLivepeerClipData] = useLazyQuery<GetLivepeerClipDataQuery>(
    GET_LIVEPEER_CLIP_DATA_QUERY
  );

  const { requestUpload } = useRequestUpload({
    onError: () => {
      console.log("Error");
    },
  });

  const { createClip } = useCreateClip({
    onError: (e) => {
      console.log("createClip Error", e);
    },
  });

  // const { trimVideo } = useTrimVideo({
  //   onError: (e) => {
  //     console.log("trimVideo Error", e);
  //   },
  // });

  const { updateUserChannelContract1155Mapping } =
    useUpdateUserChannelContract1155Mapping({
      onError: (e) => {
        console.log("updateUserChannelContract1155Mapping Error", e);
      },
    });

  const { postNFC } = usePostNFC({
    onError: (e) => {
      console.log("postNFC Error", e);
    },
  });

  useEffect(() => {
    const init = async () => {
      if (router.query[CLIP_CHANNEL_ID_QUERY_PARAM])
        setChannelId(router.query[CLIP_CHANNEL_ID_QUERY_PARAM] as string);
    };
    init();
  }, [router]);

  useEffect(() => {
    if (channelId) getChannelById();
  }, [channelId]);

  useEffect(() => {
    const init = async () => {
      if (!getChannelByIdData || !user) {
        setPageState("lacking");
        return;
      }
      if (!getChannelByIdData.getChannelById?.isLive) {
        setPageState("offline");
        return;
      }
      setPageState("clipping");
      let res: any;
      const start = Date.now();
      try {
        const { res: data } = await createClip({
          title: `rough-clip-${start}`,
          channelId: getChannelByIdData.getChannelById?.id,
          livepeerPlaybackId:
            getChannelByIdData.getChannelById?.livepeerPlaybackId,
          noDatabasePush: true,
        });
        res = data;
      } catch (e) {
        console.log("createClip error", e);
        setPageState("error");
        setErrorMessage(
          `Error creating rough clip, unable to run function correctly, took ${
            (Date.now() - start) / 1000
          }s`
        );
        return;
      }
      const roughUrl = res?.url;
      if (res?.errorMessage) {
        console.log(
          `Error creating rough clip, function ran ok, but spat out error, ${
            res.errorMessage
          }, took ${(Date.now() - start) / 1000}s`
        );
        setPageState("error");
        setErrorMessage(
          `Error creating rough clip, function ran ok, but spat out error, ${
            res.errorMessage
          }, took ${(Date.now() - start) / 1000}s`
        );
        return;
      }
      if (roughUrl) {
        const videoBlob = await fetch(roughUrl).then((res) => res.blob());
        const videoFile = new File([videoBlob], "rough.mp4", {
          type: "video/mp4",
        });
        ffmpeg.FS(
          "writeFile",
          "rough.mp4",
          await (window as any).FFmpeg.fetchFile(videoFile)
        );

        let durationString = "";

        ffmpeg.setLogger(({ type, message }: { type: any; message: any }) => {
          if (type === "fferr" && safeIncludes(message, "Duration")) {
            const match = message.match(/Duration: (\d+:\d+:\d+\.\d+)/);
            if (match) {
              durationString = match[1];
            }
          }
        });

        await ffmpeg.run("-i", "rough.mp4");

        if (!durationString) {
          throw new Error("Unable to retrieve video duration.");
        }

        setRoughClipUrl(roughUrl);
      } else {
        console.log("Error creating rough clip, no error but url is missing");
        setPageState("error");
        setErrorMessage(
          "Error creating rough clip, no error but url is missing"
        );
        return;
      }
      setPageState("selecting");
    };
    init();
  }, [getChannelByIdData, user]);

  useEffect(() => {
    if (roughClipUrl && videoRef.current) {
      videoRef.current.load();
      videoRef.current.onloadedmetadata = () => {
        console.log("loaded metadata");
        // const width = videoRef.current?.videoWidth;
        // const height = videoRef.current?.videoHeight;
        // const duration = videoRef.current?.duration;
        // console.log(`Resolution: ${width}x${height}, Duration: ${duration}s`);
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
    loadScript(
      "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.2/dist/ffmpeg.min.js"
    ).then(() => {
      if (typeof window !== "undefined") {
        ffmpeg = (window as any).FFmpeg.createFFmpeg({ log: true });
        ffmpeg.load().then(() => {
          setIsScriptLoaded(true);
        });
      }
    });
  }, []);

  const handleTrim = async (info: {
    startTime: number;
    endTime: number;
    videoLink: string;
    name: string;
  }) => {
    if (isScriptLoaded && title) {
      try {
        const trimFunctionStart = Date.now();

        videoRef.current?.pause();

        console.log(
          `${convertToHHMMSS(info.startTime.toString(), true)}`,
          info.endTime - info.startTime
        );

        await ffmpeg.run(
          "-ss",
          `${convertToHHMMSS(info.startTime.toString(), true)}`,
          "-i",
          "rough.mp4",
          "-t",
          `${info.endTime - info.startTime}`,
          "-c",
          "copy",
          "trimmed.mp4"
        );
        // Convert data to url and store in videoTrimmedUrl state
        const data = ffmpeg.FS("readFile", "trimmed.mp4");

        const url = URL.createObjectURL(
          new Blob([data.buffer], { type: "video/mp4" })
        );

        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], "trimmed_video.mp4", {
          type: "video/mp4",
        });

        console.log("requesting upload");
        const { res } = await requestUpload({
          name: info.name,
        });

        const tusEndpoint = res?.tusEndpoint;

        const upload = new tus.Upload(file, {
          endpoint: tusEndpoint,
          retryDelays: [0, 1000, 3000, 5000],
          metadata: {
            filename: `${info.name}.mp4`,
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
            // setIsPublished(true);
          },
        });

        upload.findPreviousUploads().then(function (previousUploads: any) {
          // Found previous uploads so we select the first one.
          if (previousUploads.length) {
            upload.resumeFromPreviousUpload(previousUploads[0]);
          }

          // Start the upload
          upload.start();
        });

        console.log(
          "total time took",
          `${(Date.now() - trimFunctionStart) / 1000}s`
        );
        return { res: res?.asset.id };
      } catch (e) {
        console.log("trimVideo error", e);
        return null;
      }
    } else {
      console.log("ffmpeg not loaded");
    }
  };

  const handleTrimVideo = useCallback(async () => {
    if (!canTrim || !channelId) return;
    setPageState("trimming");
    const { data: mapping } = await fetchUserChannelContract1155Mapping({
      variables: { data: { address: user?.address as string } },
    });
    const existingContract1155Address =
      mapping?.getUserChannelContract1155Mapping?.[channelId]
        ?.contract1155Address;
    console.log("existingContract1155Address", existingContract1155Address);
    const trimFunctionStart = Date.now();
    console.log("trimVideo function start", trimFunctionStart);
    let trimRes = null;
    try {
      // can be either handleTrim or trimVideo, one is for local trimming and the other is for server side trimming
      trimRes = await handleTrim({
        startTime: clipRange[0],
        endTime: clipRange[1],
        videoLink: roughClipUrl,
        name: title,
      });
    } catch (e) {
      setPageState("error");
      setErrorMessage(
        `Error trimming video, unable to run function correctly, catch block caught ${e}`
      );
      return;
    }
    if (!trimRes) {
      setPageState("error");
      setErrorMessage(
        "Error trimming video, function ran ok, no error message but response is missing"
      );
      return;
    }
    console.log(
      "time took to trim",
      `${(Date.now() - trimFunctionStart) / 1000}s`
    );
    const assetId = trimRes?.res;
    if (!!assetId && safeIncludes(assetId, "error:")) {
      setPageState("error");
      setErrorMessage(assetId);
      return;
    }
    console.log("assetId", assetId);
    let videoThumbnail = "";
    let videoLink = "";
    let clipData = null;
    try {
      const { data } = await fetchLivepeerClipData({
        variables: { data: { assetId } },
      });
      clipData = data;
    } catch (e) {
      setPageState("error");
      setErrorMessage(
        `Error fetching livepeer clip data after trimming, catch block caught ${e}`
      );
      return;
    }
    if (!clipData) {
      setPageState("error");
      setErrorMessage(
        "Error fetching livepeer clip data after trimming, response is missing"
      );
      return;
    }
    console.log(
      "waiting for videoThumbnail and videoLink",
      clipData?.getLivepeerClipData
    );
    if (
      clipData?.getLivepeerClipData?.videoThumbnail &&
      clipData?.getLivepeerClipData?.videoLink &&
      !clipData?.getLivepeerClipData?.error
    ) {
      videoThumbnail = clipData.getLivepeerClipData.videoThumbnail;
      videoLink = clipData.getLivepeerClipData.videoLink;
    }
    if (clipData?.getLivepeerClipData?.error) {
      console.log("Error", clipData.getLivepeerClipData.error);
      setPageState("error");
      setErrorMessage(clipData.getLivepeerClipData.errorMessage);
      return;
    }
    if (!videoThumbnail && !videoLink) {
      setPageState("error");
      setErrorMessage(
        `Livepeer api did not return video thumbnail or video link, please refer to assetID:${assetId}`
      );
      return;
    }
    if (!videoThumbnail) {
      setPageState("error");
      setErrorMessage(
        `Livepeer api did not return video thumbnail, please refer to assetID:${assetId}`
      );
      return;
    }
    if (!videoLink) {
      setPageState("error");
      setErrorMessage(
        `Livepeer api did not return video link, please refer to assetID:${assetId}`
      );
      return;
    }

    // CREATE TOKEN METADATA
    const { pinRes: videoFileIpfsUrl, error } =
      await createFileBlobAndPinWithPinata(
        String(videoLink),
        "video.mp4",
        "video/mp4"
      );
    if (!videoFileIpfsUrl) {
      setPageState("error");
      setErrorMessage(
        `Pinata could not pin video file onto ipfs, double check video link: (${videoLink}) & see error msg: ${error}`
      );
      return;
    }

    console.log("videoFileIpfsUrl", videoFileIpfsUrl);

    const {
      file: thumbnailFile,
      pinRes: thumbnailFileIpfsUrl,
      error: thumbnailError,
    } = await createFileBlobAndPinWithPinata(
      String(videoThumbnail),
      title,
      "image/png"
    );
    if (thumbnailError) {
      setPageState("error");
      setErrorMessage(thumbnailError);
      return;
    }
    if (!thumbnailFileIpfsUrl) {
      setPageState("error");
      setErrorMessage(
        `Pinata could not pin thumbnail file onto ipfs, please see thumbnail link: ${videoThumbnail}`
      );
      return;
    }

    console.log("thumbnailFileIpfsUrl", thumbnailFileIpfsUrl);
    console.log("thumbnailFile", thumbnailFile);

    let tokenMetadataJson: any;
    try {
      tokenMetadataJson = await makeMediaTokenMetadata({
        mediaUrl: videoFileIpfsUrl,
        thumbnailUrl: thumbnailFileIpfsUrl,
        name: thumbnailFile.name,
      });
    } catch (e) {
      console.log("makeMediaTokenMetadata error", e);
      setPageState("error");
      setErrorMessage(
        `Could not format token metadata json properly, please see ${JSON.stringify(
          {
            mediaUrl: videoFileIpfsUrl,
            thumbnailUrl: thumbnailFileIpfsUrl,
            name: thumbnailFile.name,
          }
        )}`
      );
      return;
    }

    console.log("tokenMetadataJson", tokenMetadataJson);

    const jsonMetadataUri = await pinJsonWithPinata(tokenMetadataJson);
    if (!jsonMetadataUri) {
      setPageState("error");
      setErrorMessage(
        `Pinata could not pin token metadata json onto ipfs, please see ${JSON.stringify(
          tokenMetadataJson
        )}`
      );
      return;
    }

    console.log("jsonMetadataUri", jsonMetadataUri);

    let contractObject: ContractType = {
      name: "",
      uri: "",
    };

    if (!existingContract1155Address) {
      const _contractMetadataJsonUri = await pinJsonWithPinata({
        description: `this was clipped from ${getChannelByIdData?.getChannelById?.slug}'s Unlonely livestream`,
        image: UNLONELY_LOGO_IPFS_URL,
        name: `${getChannelByIdData?.getChannelById?.slug}'s Unlonely Clips`,
      });
      if (!_contractMetadataJsonUri) {
        setPageState("error");
        setErrorMessage(
          `Pinata could not pin contract metadata json onto ipfs, please see ${JSON.stringify(
            {
              description: `this was clipped from ${getChannelByIdData?.getChannelById?.slug}'s Unlonely livestream`,
              image: UNLONELY_LOGO_IPFS_URL,
              name: `${getChannelByIdData?.getChannelById?.slug}'s Unlonely Clips`,
            }
          )}`
        );
        return;
      }
      contractObject = {
        name: `${getChannelByIdData?.getChannelById?.slug}-Unlonely-Clips`,
        uri: `ipfs://${_contractMetadataJsonUri}`,
      };
    } else {
      contractObject = existingContract1155Address;
    }

    setContractObject(contractObject);
    setTokenJsonMetaDataUri(jsonMetadataUri);
    setExistingContract1155Address(existingContract1155Address);
    setVideoThumbnail(videoThumbnail);
    setVideoLink(videoLink);
    setPageState("transaction");
  }, [
    roughClipUrl,
    clipRange,
    title,
    channelId,
    getChannelByIdData,
    publicClient,
    walletClient,
    canTrim,
  ]);

  const handleTransaction = useCallback(async () => {
    if (
      !user ||
      !channelId ||
      !videoLink ||
      !videoThumbnail ||
      !tokenJsonMetaDataUri ||
      !publicClient ||
      !walletClient
    )
      return;
    try {
      // CREATE SPLIT CONFIG
      const {
        agregate3Calls,
        predicted,
        error,
        splitCallData,
        splitAddress,
        errorMessage,
      } = await handleSplitConfig();
      if (error && errorMessage) {
        setPageState("error");
        setErrorMessage(`Error handling split config: ${errorMessage}`);
        return;
      }

      // CREATE 1155 CONTRACT AND TOKEN
      setTransactionProgressMessage("handling 1155 contract and token...");
      const creatorClient = createCreatorClient({
        chainId: network.chainId,
        publicClient,
      });
      console.log("contractObject", contractObject);
      const { parameters } = await creatorClient.create1155({
        contract: contractObject,
        token: {
          tokenMetadataURI: `ipfs://${tokenJsonMetaDataUri}`,
          payoutRecipient: predicted.splitAddress,
          mintToCreatorCount: 1,
        },
        account: walletClient?.account.address as Address,
      });
      console.log("parameters", parameters);
      let contract1155Address: `0x${string}` = NULL_ADDRESS;
      let tokenId = -1;
      if (predicted.splitExists) {
        console.log("split exists");
        setTransactionProgressMessage("awaiting approval to mint...");

        const { txnReceipt, error, errorMessage } = await handleWriteCreate1155(
          parameters
        );
        if (error && errorMessage) {
          console.log(
            "split exists, handleWriteCreate1155 error",
            errorMessage
          );
          throw new Error(errorMessage);
        }
        const logs = txnReceipt?.logs ?? [];
        contract1155Address = findMostFrequentString(
          logs.map((log) => log.address)
        ) as `0x${string}`;
        console.log("create1155 logs", logs, contract1155Address);

        const topics = returnDecodedTopics(
          logs,
          zoraCreator1155Abi as any[],
          "UpdatedToken",
          false
        );

        if (topics) {
          const args: any = topics.args;
          const _tokenId: bigint = args.tokenId;
          console.log("tokenId", _tokenId);
          tokenId = Number(_tokenId);
        }

        console.log("create1155 topics", topics);
      } else {
        if (typeof contractObject === "string") {
          console.log("split does not exist and contractObject is string");
          if (splitCallData && splitAddress && walletClient?.account.address) {
            setTransactionProgressMessage("awaiting approval to mint...");
            let splitCreationHash: `0x${string}` | null = null;
            try {
              await sendTransaction(
                {
                  to: splitAddress as Address,
                  account: walletClient?.account.address as Address,
                  data: splitCallData,
                },
                {
                  onSuccess: (data) => {
                    console.log("splitCreationHash", data);
                    splitCreationHash = data;
                  },
                }
              );
            } catch (e) {
              console.log("walletClient.sendTransaction caught error", e);
              if (safeIncludes(String(e as any), "User rejected the request"))
                throw new Error((e as any).message);
            }
            setTransactionProgressMessage("creating split contract...");
            if (!splitCreationHash) {
              setPageState("error");
              setErrorMessage("Error creating split contract");
              return;
            }
            const splitTransaction =
              await publicClient.waitForTransactionReceipt({
                hash: splitCreationHash,
              });
            const splitLogs = splitTransaction?.logs;

            const { txnReceipt, error, errorMessage } =
              await handleWriteCreate1155(parameters);
            if (error && errorMessage) {
              console.log(
                "split does not exist, handleWriteCreate1155 error",
                errorMessage
              );
              throw new Error(errorMessage);
            }
            const logs = txnReceipt?.logs ?? [];
            setTransactionProgressMessage("minting...");

            contract1155Address = findMostFrequentString(
              logs.map((log) => log.address)
            ) as `0x${string}`;

            console.log(
              "splitTransaction logs",
              splitLogs,
              contract1155Address
            );

            const topics = returnDecodedTopics(
              logs,
              zoraCreator1155Abi,
              "UpdatedToken",
              false
            );

            if (topics) {
              const args: any = topics.args;
              const _tokenId: bigint = args.tokenId;
              console.log("tokenId", _tokenId);
              tokenId = Number(_tokenId);
            }

            console.log("create1155 topics", topics);
          }
        } else {
          console.log("split does not exist and contractObject is not string");
          // push 1155 contract and token creation calls to the multicall3 aggregate call
          agregate3Calls.push({
            allowFailure: false,
            value: parameters.value || BigInt(0),
            target: parameters.address,
            callData: encodeFunctionData({
              abi: parameters.abi,
              functionName: parameters.functionName,
              args: parameters.args,
            }),
          });

          // simulate the transaction multicall 3 transaction
          const { request } = await publicClient.simulateContract({
            abi: multicall3Abi,
            functionName: "aggregate3Value",
            address: multicall3Address,
            args: [agregate3Calls],
            account: walletClient?.account.address as Address,
          });

          console.log("simulated request", request);

          setTransactionProgressMessage("awaiting approval to mint...");

          let hash: `0x${string}` | null | undefined = null;
          try {
            // execute the transaction
            hash = await writeContractAsync(request);
            console.log("multicall3 response", hash);
          } catch (e) {
            console.log("walletClient.writeContract caught error", e);
            if (safeIncludes(String(e as any), "User rejected the request"))
              throw new Error((e as any).message);
          }

          setTransactionProgressMessage("minting...");

          console.log("hash", hash);
          if (hash) {
            const transaction = await publicClient.waitForTransactionReceipt({
              hash,
            });
            const logs = transaction.logs;
            console.log("multicall tx logs", logs);

            const topics = returnDecodedTopics(
              logs,
              zoraCreator1155Abi,
              "UpdatedToken",
              false
            );
            contract1155Address = findMostFrequentString(
              logs.map((log) => log.address)
            ) as `0x${string}`;

            if (topics) {
              const args: any = topics.args;
              const _tokenId: bigint = args.tokenId;
              console.log("tokenId", _tokenId);
              tokenId = Number(_tokenId);
            }
          }
        }
      }
      setTransactionProgressMessage("...wrapping up...");
      if (contract1155Address && channelId && !existingContract1155Address) {
        await updateUserChannelContract1155Mapping({
          channelId: channelId,
          contract1155Address: contract1155Address,
          contract1155ChainId: network.chainId,
          userAddress: user?.address as Address,
        });
      }

      const postNfcObject: PostNfcInput = {
        title: title,
        videoLink,
        videoThumbnail,
        openseaLink: "",
        channelId,
        contract1155Address: contract1155Address,
        zoraLink: `https://zora.co/collect/base:${contract1155Address}/${tokenId}`,
        tokenId,
      };
      const postNFCRes = await postNFC(postNfcObject);
      const _finalClipObject = {
        ...postNfcObject,
        id: postNFCRes?.res?.id,
        owner: postNFCRes?.res?.owner
          ? {
              username: postNFCRes.res.owner.username ?? undefined, // Convert null to undefined
              address: postNFCRes.res.owner.address,
            }
          : undefined,
      };
      console.log("_finalClipObject", _finalClipObject);
      await channel.publish({
        name: CHAT_MESSAGE_EVENT,
        data: {
          messageText: `${
            user?.username ?? centerEllipses(user.address, 13)
          } clipped a highlight: "${title}"`,
          username: "🤖",
          address: NULL_ADDRESS,
          isFC: false,
          isLens: false,
          isGif: false,
          senderStatus: SenderStatus.CHATBOT,
          body: JSON.stringify({
            interactionType: InteractionType.PUBLISH_NFC,
            ..._finalClipObject,
          }),
        },
      });
      setFinalClipObject(_finalClipObject);
      setPageState("redirecting");
      setTransactionProgressMessage(null);
      window.open(`${window.origin}/nfc/${_finalClipObject.id}`, "_self");
    } catch (e) {
      console.log("handleTransaction caught error", e, (e as any).message);
      if (safeIncludes(String(e as any), "User rejected the request"))
        setTransactionProgressMessage(PLEASE_CONTINUE_TRANSACTION);
    }
  }, [
    user,
    channelId,
    videoLink,
    videoThumbnail,
    tokenJsonMetaDataUri,
    contractObject,
    existingContract1155Address,
  ]);

  const handleSplitConfig = async (): Promise<{
    agregate3Calls: Aggregate3ValueCall[];
    predicted: { splitAddress: Address; splitExists: boolean };
    splitCallData: Address | null;
    splitAddress: Address | null;
    error: boolean;
    errorMessage: string;
  }> => {
    const agregate3Calls: Aggregate3ValueCall[] = [];
    if (!publicClient || !walletClient?.account.address)
      return {
        agregate3Calls,
        predicted: {
          splitAddress: NULL_ADDRESS as Address,
          splitExists: false,
        },
        splitCallData: null,
        splitAddress: null,
        error: true,
        errorMessage: "publicClient or walletClient is missing",
      };
    const splitsClient = new SplitV1Client({
      chainId: network.chainId,
      publicClient: publicClient as PublicClient<HttpTransport, Chain>,
      apiConfig: {
        apiKey: String(process.env.NEXT_PUBLIC_SPLITS_API_KEY),
      },
    });

    const userSplitRecipients = areAddressesEqual(
      walletClient?.account.address,
      getChannelByIdData?.getChannelById?.owner?.address as `0x${string}`
    )
      ? [
          {
            address: walletClient?.account.address as Address,
            percentAllocation: 90,
          },
        ]
      : [
          {
            address: walletClient?.account.address as Address,
            percentAllocation: 45,
          },
          {
            address: getChannelByIdData?.getChannelById?.owner
              ?.address as Address,
            percentAllocation: 45,
          },
        ];

    // configure the split
    const splitsConfig: {
      recipients: SplitRecipient[];
      distributorFeePercent: number;
    } = {
      recipients: [
        ...userSplitRecipients,
        {
          address: PROTOCOL_ADDRESS,
          percentAllocation: 10,
        },
      ],
      distributorFeePercent: 0,
    };

    let splitCallData = null;
    let splitAddress = null;
    let predicted = {} as any;
    try {
      predicted = await splitsClient.predictImmutableSplitAddress(splitsConfig);
      if (!predicted.splitExists) {
        // if the split has not been created, add a call to create it
        // to the multicall3 aggregate call

        const { data, address } = await splitsClient.callData.createSplit(
          splitsConfig
        );
        splitCallData = data;
        splitAddress = address as Address;
        agregate3Calls.push({
          allowFailure: false,
          callData: data,
          target: address as Address,
          value: BigInt(0),
        });
      }
    } catch (e) {
      return {
        agregate3Calls,
        predicted: {
          splitAddress: NULL_ADDRESS as Address,
          splitExists: false,
        },
        splitCallData: null,
        splitAddress: null,
        error: true,
        errorMessage: `Error creating split, SPLIT CONFIG: ${JSON.stringify(
          splitsConfig
        )}, AGREGATE3CALLS, ${JSON.stringify(
          agregate3Calls
        )}}, predicted, ${JSON.stringify(predicted)}`,
      };
    }
    return {
      agregate3Calls,
      predicted,
      splitCallData,
      splitAddress,
      error: false,
      errorMessage: "",
    };
  };

  const handleWriteCreate1155 = async (
    parameters: any
  ): Promise<{
    txnReceipt: TransactionReceipt | undefined;
    error: boolean;
    errorMessage: string;
  }> => {
    if (!publicClient || !walletClient?.account.address) {
      return {
        txnReceipt: undefined,
        error: true,
        errorMessage: "publicClient or walletClient is missing",
      };
    }
    try {
      const { request } = await publicClient.simulateContract(parameters);

      console.log("handleWriteCreate1155 simulated request", request);

      // execute the transaction
      const hash = await writeContractAsync(request);
      if (!hash)
        return {
          txnReceipt: undefined,
          error: true,
          errorMessage: "hash is missing",
        };
      const transaction = await publicClient.waitForTransactionReceipt({
        hash,
      });
      return {
        txnReceipt: transaction,
        error: false,
        errorMessage: "",
      };
    } catch (e) {
      console.log("handleWriteCreate1155 caught error", e);
      return {
        txnReceipt: undefined,
        error: true,
        errorMessage: `handleWriteCreate1155 caught error: ${e}`,
      };
    }
  };

  return (
    <AppLayout
      isCustomHeader={false}
      noHeader
      customBgColor="rgba(5, 0, 31, 1)"
    >
      <Flex direction={"column"} h="100vh">
        <Header />
        {(pageState === "clipping" || pageState === "trimming") && (
          <div
            className="image-container"
            style={{
              position: "fixed",
            }}
          >
            {images.map((image, index) => (
              <img
                key={index}
                id={`scrolling-image-${index}`}
                src={image.src}
                className={
                  nyanCatFaceForward[index]
                    ? "scroll-image-forward"
                    : "scroll-image-backward"
                }
                onClick={() => handleClickNyanCat(index)}
                style={{
                  top: image.top,
                  animationDelay: image.delay,
                  cursor: "pointer",
                }}
                alt={`scrolling-image-${index}`}
              />
            ))}
          </div>
        )}
        <Flex p="20" justifyContent={"center"} h="100%">
          {pageState === "offline" ? (
            <Flex direction={"column"} justifyContent={"center"}>
              <Text
                fontSize="30px"
                mb="30px"
                textAlign="center"
                fontWeight={"bold"}
              >
                Cannot clip, livestream is offline
              </Text>
            </Flex>
          ) : pageState === "trimming" ? (
            <Flex direction={"column"} justifyContent={"center"}>
              <Text
                fontSize="30px"
                mb="30px"
                textAlign="center"
                fontWeight={"bold"}
              >
                DO NOT CLOSE TAB, you'll get a wallet txn prompt in 1-2 mins
              </Text>
              <Progress
                colorScheme="green"
                height="32px"
                value={trimProgressPercentage}
              />
              <Text mt="30px" textAlign="center">
                {carouselProgressStatusMessages[carouselProgressIndex]}
              </Text>
            </Flex>
          ) : pageState === "clipping" ? (
            <Flex direction={"column"}>
              <Text fontSize="30px" mb="10px" textAlign="center">
                CLIP IS LOADING
              </Text>
              <Text
                fontSize="30px"
                mb="30px"
                textAlign="center"
                fontWeight={"bold"}
              >
                DO NOT CLOSE TAB
              </Text>

              <Text fontSize="30px" textAlign="center" mb="100px">
                (OR NYAN CAT WILL COME FOR YOU)
              </Text>
              <Text fontSize="20px" textAlign="center">
                this may take up to 30s depending on your connection
              </Text>
            </Flex>
          ) : pageState === "selecting" ? (
            <Flex direction="column" gap="10px">
              <video
                ref={videoRef}
                src={roughClipUrl.concat("#t=0.1")}
                style={{
                  height: "400px",
                }}
                onTimeUpdate={handleTimeUpdate}
                onSeeking={handleSeeking}
                controls
                onEnded={() => {
                  videoRef.current!.currentTime = clipRange[0];
                  videoRef.current!.play();
                }}
              />
              <Text
                h="20px"
                color={
                  clipRange[1] - clipRange[0] > 30 ||
                  clipRange[1] - clipRange[0] < 2
                    ? "red"
                    : "white"
                }
              >
                {clipRange[1] - clipRange[0] > 30
                  ? "clip must be 30s long or shorter"
                  : clipRange[1] - clipRange[0] < 2
                  ? "clip must be at least 2s long"
                  : !title
                  ? "Enter a title for this clip"
                  : title.length > 100
                  ? "title must be 100 characters or under"
                  : ""}
              </Text>
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
                    <RangeSliderFilledTrack
                      bg={
                        clipRange[1] - clipRange[0] > 30 ? "#ba0000" : "#343dbb"
                      }
                    />
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
                  onClick={handleTrimVideo}
                  isDisabled={!canTrim}
                  py="20px"
                  mb="20px"
                  mx="auto"
                >
                  <Text position="relative" zIndex="2">
                    Create NFC
                  </Text>
                </Button>
              </>
            </Flex>
          ) : pageState === "redirecting" ? (
            <Flex direction={"column"} justifyContent={"center"}>
              <Text textAlign="center" marginBottom="20px">
                Redirecting you to the clip
              </Text>
              <Flex justifyContent={"center"}>
                <Spinner />
              </Flex>
              <Link
                href={`/nfc/${finalClipObject?.id}`}
                passHref
                style={{
                  textDecoration: "underline",
                  marginTop: "40px",
                }}
              >
                If you're not redirected immediately, click here
              </Link>
            </Flex>
          ) : pageState === "transaction" ? (
            <Flex direction={"column"} justifyContent={"center"}>
              <Text
                fontSize="30px"
                mb="30px"
                textAlign="center"
                fontWeight={"bold"}
              >
                {transactionProgressMessage}
              </Text>
              {transactionProgressMessage === PLEASE_CONTINUE_TRANSACTION && (
                <Button
                  onClick={handleTransaction}
                  py="20px"
                  mb="20px"
                  mx="auto"
                >
                  <Text>Continue Transaction</Text>
                </Button>
              )}
            </Flex>
          ) : pageState === "error" ? (
            <Flex direction={"column"} justifyContent={"center"}>
              <Text
                fontSize="30px"
                mb="30px"
                textAlign="center"
                fontWeight={"bold"}
              >
                Something went wrong: {errorMessage}
              </Text>
            </Flex>
          ) : (
            <Flex direction={"column"} justifyContent={"center"}>
              <Text>Make sure you're logged in</Text>
              <Flex justifyContent={"center"}>
                <Spinner />
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
    </AppLayout>
  );
};
export default Clip;
