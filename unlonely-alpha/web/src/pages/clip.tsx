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
import { SplitV1Client, SplitRecipient } from "@0xsplits/splits-sdk";
import { pinFileWithPinata, pinJsonWithPinata } from "../utils/pinata";
import { ContractMetadataJson } from "@zoralabs/protocol-sdk";
import { GET_CHANNEL_BY_ID_QUERY } from "../constants/queries";
import { useLazyQuery } from "@apollo/client";
import { GetChannelByIdQuery } from "../generated/graphql";
import Header from "../components/navigation/Header";
import {
  Address,
  Chain,
  HttpTransport,
  PublicClient,
  encodeFunctionData,
  isAddressEqual,
} from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { ExtractAbiFunction, AbiParametersToPrimitiveTypes } from "abitype";
import {
  createCreatorClient,
  makeMediaTokenMetadata,
} from "@zoralabs/protocol-sdk";
import useUpdateChannelContract1155 from "../hooks/server/channel/useUpdateChannelContract1155";
import { findMostFrequentString } from "../utils/findMostFrequencyString";
import usePostNFC from "../hooks/server/usePostNFC";

const multicall3Address = "0xcA11bde05977b3631167028862bE2a173976CA11";
const PROTOCOL_ADDRESS = "0x53D6D64945A67658C66730Ff4a038eb298eC8902";

const multicall3Abi = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "target",
            type: "address",
          },
          {
            internalType: "bool",
            name: "allowFailure",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes",
          },
        ],
        internalType: "struct Multicall3.Call3Value[]",
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "aggregate3Value",
    outputs: [
      {
        components: [
          {
            internalType: "bool",
            name: "success",
            type: "bool",
          },
          {
            internalType: "bytes",
            name: "returnData",
            type: "bytes",
          },
        ],
        internalType: "struct Multicall3.Result[]",
        name: "returnData",
        type: "tuple[]",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
] as const;

type Aggregate3ValueFunction = ExtractAbiFunction<
  typeof multicall3Abi,
  "aggregate3Value"
>["inputs"];
type Aggregate3ValueCall =
  AbiParametersToPrimitiveTypes<Aggregate3ValueFunction>[0][0];

const Clip = () => {
  const router = useRouter();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient({
    onSuccess(data) {
      console.log("Success", data);
    },
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  const [clipRange, setClipRange] = useState<[number, number]>([0, 0]);
  const [title, setTitle] = useState("");
  const [channelId, setChannelId] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number>(8453);
  const [roughClipUrl, setRoughClipUrl] = useState("");
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

  const { updateChannelContract1155 } = useUpdateChannelContract1155({
    onError: () => {
      console.log("Error");
    },
  });

  const { postNFC } = usePostNFC({
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
    if (
      !roughClipUrl ||
      !channelId ||
      clipRange[0] >= clipRange[1] ||
      !getChannelByIdData ||
      !chainId ||
      !walletClient?.account.address ||
      !getChannelByIdData?.getChannelById?.owner?.address
    )
      return;
    const res = await trimVideo({
      startTime: clipRange[0],
      endTime: clipRange[1],
      videoLink: roughClipUrl,
      name: title,
      channelId: channelId ?? "",
    });
    const playbackUrl = res?.res?.videoLink;
    if (!playbackUrl) {
      console.log("playback url not found");
      return;
    }
    let contractMetadataJsonUriLocal = "";
    let _videoFileIpfsUrl = "";
    if (!getChannelByIdData?.getChannelById?.contract1155Address) {
      try {
        const videoResponse = await fetch(playbackUrl);
        console.log("creating file blob");
        const videoBlob = await videoResponse.blob();
        const videoFile = new File([videoBlob], "video.mp4", {
          type: "video/mp4",
        });
        const videoFileIpfsUrl = await pinFileWithPinata(videoFile);
        console.log("videoResponse", videoResponse);
        console.log("videoBlob", videoBlob);
        console.log("videoFile", videoFile);
        console.log("videoFileIpfsUrl", videoFileIpfsUrl);
        _videoFileIpfsUrl = videoFileIpfsUrl;

        const metadataJson: ContractMetadataJson = {
          description: `this was clipped from ${getChannelByIdData?.getChannelById?.slug}'s Unlonely livestream`,
          image: videoFileIpfsUrl,
          name: title,
        };
        const _contractMetadataJsonUri = await pinJsonWithPinata(metadataJson);
        console.log("metadataJson", metadataJson);
        contractMetadataJsonUriLocal = _contractMetadataJsonUri;
        setContractMetadataJsonUri(contractMetadataJsonUri);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.log("pinning contract metadata to ipfs Error", e);
        return;
      }
    }

    const splitsClient = new SplitV1Client({
      chainId,
      publicClient: publicClient as PublicClient<HttpTransport, Chain>,
      apiConfig: {
        // This is a dummy 0xSplits api key, replace with your own
        apiKey: String(process.env.NEXT_PUBLIC_SPLITS_API_KEY),
      },
    });

    const userSplitRecipients = isAddressEqual(
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

    const predicted = await splitsClient.predictImmutableSplitAddress(
      splitsConfig
    );

    console.log("predicted", predicted);

    const agregate3Calls: Aggregate3ValueCall[] = [];

    if (!predicted.splitExists) {
      // if the split has not been created, add a call to create it
      // to the multicall3 aggregate call

      const { data, address } = await splitsClient.callData.createSplit(
        splitsConfig
      );

      agregate3Calls.push({
        allowFailure: false,
        callData: data,
        target: address as Address,
        value: BigInt(0),
      });
    }

    const splitRecipient = predicted.splitAddress;

    /* ==== 2. Create the 1155 with the splits recipient as the payoutRecipient ===== */

    const creatorClient = createCreatorClient({ chainId, publicClient });

    if (!res?.res?.videoThumbnail) {
      console.log("thumbnail url not found");
      return;
    }

    const thumbnailResponse = await fetch(res?.res?.videoThumbnail);
    const thumbnailBlob = await thumbnailResponse.blob();
    const thumbnailFile = new File([thumbnailBlob], title, {
      type: "image/png",
    });
    const thumbnailFileIpfsUrl = await pinFileWithPinata(thumbnailFile);

    const tokenMetadataJson = await makeMediaTokenMetadata({
      mediaUrl: _videoFileIpfsUrl,
      thumbnailUrl: thumbnailFileIpfsUrl,
      name: thumbnailFile.name,
    });
    console.log("makeMediaTokenMetadata tokenMetadataJson", tokenMetadataJson);
    const jsonMetadataUri = await pinJsonWithPinata(tokenMetadataJson);

    console.log("jsonMetadataUri", jsonMetadataUri);

    let _existingContractAddress: `0x${string}` | null = null;
    if (!getChannelByIdData?.getChannelById?.contract1155Address) {
      const newChannelData = await getChannelById();
      const newContractAddress =
        newChannelData?.data?.getChannelById?.contract1155Address;
      _existingContractAddress =
        newContractAddress === undefined
          ? null
          : newContractAddress !== null
          ? (newContractAddress as `0x${string}`)
          : null;
    }

    console.log(
      "contractType",
      getChannelByIdData?.getChannelById?.contract1155Address,
      _existingContractAddress,
      `${getChannelByIdData?.getChannelById?.slug}-Unlonely-Clips`,
      contractMetadataJsonUriLocal,
      (getChannelByIdData?.getChannelById?.contract1155Address as
        | `0x${string}`
        | undefined
        | null) ??
        _existingContractAddress ?? {
          name: `${getChannelByIdData?.getChannelById?.slug}-Unlonely-Clips`,
          uri: contractMetadataJsonUriLocal,
        },
      jsonMetadataUri,
      splitRecipient,
      walletClient?.account.address
    );

    const { parameters } = await creatorClient.create1155({
      contract: (getChannelByIdData?.getChannelById?.contract1155Address as
        | `0x${string}`
        | undefined
        | null) ??
        _existingContractAddress ?? {
          name: `${getChannelByIdData?.getChannelById?.slug}-Unlonely-Clips`,
          uri: contractMetadataJsonUriLocal,
        },
      token: {
        tokenMetadataURI: jsonMetadataUri,
        payoutRecipient: splitRecipient,
        // 1 token will be minted to the creator
        mintToCreatorCount: 1,
      },
      account: walletClient?.account.address as Address,
    });

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

    console.log("simulated multicall3 request", request);

    // execute the transaction
    const hash = await walletClient?.writeContract(request).then((response) => {
      console.log("multicall3 response", response);
      return response;
    });

    if (hash) {
      const transaction = await publicClient.waitForTransactionReceipt({
        hash,
      });
      const logs = transaction.logs;

      // freqAddress is the address of the 1155 contract
      const freqAddress = findMostFrequentString(
        logs.map((log) => log.address)
      );

      if (freqAddress && channelId) {
        await updateChannelContract1155({
          channelId: channelId,
          contract1155Address: freqAddress,
          contract1155ChainId: chainId,
        });
      }

      const postNfcObject = {
        title: title,
        videoLink: res.res.videoLink,
        videoThumbnail: res?.res?.videoThumbnail,
        openseaLink: "",
        channelId: channelId,
      };
      console.log("postNfcObject", postNfcObject);
      await postNFC(postNfcObject);
    }
  }, [
    roughClipUrl,
    clipRange,
    title,
    channelId,
    getChannelByIdData,
    chainId,
    publicClient,
    walletClient,
  ]);

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
