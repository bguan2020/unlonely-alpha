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
  Progress,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { MdDragIndicator } from "react-icons/md";

import {
  CHAT_MESSAGE_EVENT,
  CLIP_CHANNEL_ID_QUERY_PARAM,
  InteractionType,
  NULL_ADDRESS,
  UNLONELY_LOGO_IPFS_URL,
} from "../constants";
import { useRouter } from "next/router";
import useCreateClip from "../hooks/server/channel/useCreateClip";
import useTrimVideo from "../hooks/server/channel/useTrimVideo";
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
  encodeFunctionData,
  isAddressEqual,
} from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
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
import { FaRegCopy } from "react-icons/fa6";
import copy from "copy-to-clipboard";

const multicall3Address = "0xcA11bde05977b3631167028862bE2a173976CA11";
const PROTOCOL_ADDRESS = "0x53D6D64945A67658C66730Ff4a038eb298eC8902";

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
  "...handling 1155 contract and token...",
];

type Aggregate3ValueFunction = ExtractAbiFunction<
  typeof multicall3Abi,
  "aggregate3Value"
>["inputs"];
type Aggregate3ValueCall =
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
  const { data: walletClient } = useWalletClient({
    onSuccess(data) {
      console.log("Success", data);
    },
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const toast = useToast();

  const [clipRange, setClipRange] = useState<[number, number]>([0, 0]);
  const [title, setTitle] = useState("");
  const [channelId, setChannelId] = useState<string | null>(null);
  const [transactionMessage, setTransactionMessage] = useState<string | null>(
    null
  );
  const [carouselProgressIndex, setCarouselProgressIndex] = useState(0);
  const [pageState, setPageState] = useState<
    "offline" | "clipping" | "selecting" | "trimming" | "sharing" | "error"
  >("clipping");
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [roughClipUrl, setRoughClipUrl] = useState(
    ""
    // "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/a5e1mb4vfge22uvr/1200p0.mp4"
  );
  const [finalClipObject, setFinalClipObject] = useState<
    FinalClipObject | undefined
  >(undefined);
  const [nyanCatFaceForward, setNyanCatFaceForward] = useState(
    new Array(images.length).fill(true)
  );

  useEffect(() => {
    if (pageState === "trimming") {
      const interval = setInterval(() => {
        setProgressPercentage((prevPercentage) => prevPercentage + 2);
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
  }, [pageState]);

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

  const chatChannel = useMemo(
    () =>
      `persistMessages:${getChannelByIdData?.getChannelById?.slug}-chat-channel`,
    [getChannelByIdData]
  );

  const [channel] = useAblyChannel(chatChannel, async (message) => {
    console.log("message", message);
  });

  const [fetchUserChannelContract1155Mapping] =
    useLazyQuery<GetUserChannelContract1155MappingQuery>(
      GET_USER_CHANNEL_CONTRACT_1155_MAPPING_QUERY
    );

  const [fetchLivepeerClipData] = useLazyQuery<GetLivepeerClipDataQuery>(
    GET_LIVEPEER_CLIP_DATA_QUERY
  );

  const { createClip } = useCreateClip({
    onError: (e) => {
      console.log(e);
    },
  });

  const { trimVideo } = useTrimVideo({
    onError: (e) => {
      console.log("trimVideo Error", e);
    },
  });

  const { updateUserChannelContract1155Mapping } =
    useUpdateUserChannelContract1155Mapping({
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
      if (!getChannelByIdData || !user) return;
      if (!getChannelByIdData.getChannelById?.isLive) {
        setPageState("offline");
        return;
      }
      setPageState("clipping");
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
        setPageState("selecting");
      } catch (e) {
        setPageState("error");
      }
    };
    init();
  }, [getChannelByIdData, user]);

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
      !network.chainId ||
      !walletClient?.account.address ||
      !user
    )
      return;
    try {
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
      const trimRes = await trimVideo({
        startTime: clipRange[0],
        endTime: clipRange[1],
        videoLink: roughClipUrl,
        name: title,
      });
      console.log(
        "time took to trim",
        `${(Date.now() - trimFunctionStart) / 1000}s`
      );
      // const concatStart = Date.now();
      // const outputIdentifier = trimRes?.res;
      // await new Promise((resolve) => setTimeout(resolve, 5000));
      // console.log("outputIdentifier", outputIdentifier);
      // const concatRes = await concatenateOutroTrimmedVideo({
      //   trimmedVideoFileName: String(outputIdentifier),
      //   name: title,
      // });
      // console.log(
      //   "time took to concatenate",
      //   `${(Date.now() - concatStart) / 1000}s`
      // );
      const assetId = trimRes?.res;
      console.log("assetId", assetId);
      let videoThumbnail = "";
      let videoLink = "";
      const { data } = await fetchLivepeerClipData({
        variables: { data: { assetId } },
      });
      console.log(
        "waiting for videoThumbnail and videoLink",
        data?.getLivepeerClipData
      );
      if (
        data?.getLivepeerClipData?.videoThumbnail &&
        data?.getLivepeerClipData?.videoLink &&
        !data?.getLivepeerClipData?.error
      ) {
        videoThumbnail = data.getLivepeerClipData.videoThumbnail;
        videoLink = data.getLivepeerClipData.videoLink;
      }
      if (data?.getLivepeerClipData?.error) {
        console.log("Error", data.getLivepeerClipData.error);
        return;
      }
      if (!videoThumbnail || !videoLink) return;

      // CREATE TOKEN METADATA
      const { pinRes: videoFileIpfsUrl } = await createFileBlobAndPinWithPinata(
        String(videoLink),
        "video.mp4",
        "video/mp4"
      );
      console.log("videoFileIpfsUrl", videoFileIpfsUrl);
      if (!videoFileIpfsUrl || !videoLink) return;

      const { file: thumbnailFile, pinRes: thumbnailFileIpfsUrl } =
        await createFileBlobAndPinWithPinata(
          String(videoThumbnail),
          title,
          "image/png"
        );
      if (!thumbnailFileIpfsUrl || !thumbnailFile || !videoThumbnail) return;

      console.log("thumbnailFileIpfsUrl", thumbnailFileIpfsUrl);

      const tokenMetadataJson = await makeMediaTokenMetadata({
        mediaUrl: videoFileIpfsUrl,
        thumbnailUrl: thumbnailFileIpfsUrl,
        name: thumbnailFile.name,
      });
      console.log(
        "makeMediaTokenMetadata tokenMetadataJson",
        tokenMetadataJson
      );

      const jsonMetadataUri = await pinJsonWithPinata(tokenMetadataJson);
      console.log("jsonMetadataUri", jsonMetadataUri);

      // CREATE SPLIT CONFIG

      const { agregate3Calls, predicted, error, splitCallData, splitAddress } =
        await handleSplitConfig();
      if (error) return;

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
        contractObject = {
          name: `${getChannelByIdData?.getChannelById?.slug}-Unlonely-Clips`,
          uri: _contractMetadataJsonUri,
        };
      } else if (existingContract1155Address) {
        contractObject = existingContract1155Address;
      } else {
        console.log("no satisfactory outcome found");
        return;
      }

      console.log("contractObject", contractObject);

      // CREATE 1155 CONTRACT AND TOKEN
      setTransactionMessage("...handling 1155 contract and token...");
      const creatorClient = createCreatorClient({
        chainId: network.chainId,
        publicClient,
      });
      const { parameters } = await creatorClient.create1155({
        contract: contractObject,
        token: {
          tokenMetadataURI: jsonMetadataUri,
          payoutRecipient: predicted.splitAddress,
          mintToCreatorCount: 1,
        },
        account: walletClient?.account.address as Address,
      });

      console.log("parameters from create1155", parameters);

      let freqAddress: `0x${string}` = NULL_ADDRESS;
      let tokenId = -1;
      if (predicted.splitExists) {
        console.log("split exists");
        setTransactionMessage("...minting...");

        const transaction = await handleWriteCreate1155(parameters);
        const logs = transaction?.logs ?? [];
        console.log("transaction logs", logs);
        // freqAddress is the address of the 1155 contract
        const _freqAddress = findMostFrequentString(
          logs.map((log) => log.address)
        );

        freqAddress = _freqAddress as `0x${string}`;
        console.log("freqAddress", freqAddress);

        const topics = returnDecodedTopics(
          logs,
          zoraCreator1155Abi as any[],
          "UpdatedToken",
          false
        );

        console.log("create1155 topics and split exists", topics);
        if (topics) {
          const args: any = topics.args;
          const _tokenId: bigint = args.tokenId;
          console.log("tokenId", _tokenId);
          tokenId = Number(_tokenId);
        }
      } else {
        if (typeof contractObject === "string") {
          console.log("split does not exist and contractObject is string");
          if (splitCallData && splitAddress && walletClient?.account.address) {
            setTransactionMessage("...creating split...");
            const splitCreationHash = await walletClient.sendTransaction({
              to: splitAddress as Address,
              account: walletClient?.account.address as Address,
              data: splitCallData,
            });
            if (!splitCreationHash) return;
            const splitTransaction =
              await publicClient.waitForTransactionReceipt({
                hash: splitCreationHash,
              });
            const splitLogs = splitTransaction?.logs;
            console.log("splitTransaction logs", splitLogs);
            setTransactionMessage("...minting...");

            const transaction = await handleWriteCreate1155(parameters);
            const logs = transaction?.logs ?? [];
            console.log("transaction logs", logs);

            const _freqAddress = findMostFrequentString(
              logs.map((log) => log.address)
            );

            console.log("freqAddress", _freqAddress);
            freqAddress = _freqAddress as `0x${string}`;

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

          console.log("agregate3Calls", agregate3Calls);

          // simulate the transaction multicall 3 transaction
          const { request } = await publicClient.simulateContract({
            abi: multicall3Abi,
            functionName: "aggregate3Value",
            address: multicall3Address,
            args: [agregate3Calls],
            account: walletClient?.account.address as Address,
          });

          console.log("simulated multicall3 request", request);
          setTransactionMessage("...minting...");

          // execute the transaction
          const hash = await walletClient
            ?.writeContract(request)
            .then((response) => {
              console.log("multicall3 response", response);
              return response;
            });

          if (hash) {
            const transaction = await publicClient.waitForTransactionReceipt({
              hash,
            });
            const logs = transaction.logs;
            console.log("multicall tx logs", logs);
            // freqAddress is the address of the 1155 contract
            const _freqAddress = findMostFrequentString(
              logs.map((log) => log.address)
            );

            const topics = returnDecodedTopics(
              logs,
              zoraCreator1155Abi,
              "UpdatedToken",
              false
            );

            console.log("multicall topics", topics);

            console.log("freqAddress", _freqAddress);
            freqAddress = _freqAddress as `0x${string}`;

            if (topics) {
              const args: any = topics.args;
              const _tokenId: bigint = args.tokenId;
              console.log("tokenId", _tokenId);
              tokenId = Number(_tokenId);
            }
          }
        }
      }
      setTransactionMessage("...wrapping up...");
      if (freqAddress && channelId && !existingContract1155Address) {
        await updateUserChannelContract1155Mapping({
          channelId: channelId,
          contract1155Address: freqAddress,
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
        contract1155Address: freqAddress,
        zoraLink: `https://zora.co/collect/base:${freqAddress}/${tokenId}`,
        tokenId,
      };
      console.log("postNfcObject", postNfcObject);
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
      setPageState("sharing");
      setTransactionMessage(null);
    } catch (e) {
      console.log("trimVideo frontend error", e);
      setPageState("error");
    }
  }, [
    roughClipUrl,
    clipRange,
    title,
    channelId,
    getChannelByIdData,
    network.chainId,
    publicClient,
    walletClient,
  ]);

  const handleSplitConfig = async () => {
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
      };
    const splitsClient = new SplitV1Client({
      chainId: network.chainId,
      publicClient: publicClient as PublicClient<HttpTransport, Chain>,
      apiConfig: {
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

    let splitCallData = null;
    let splitAddress = null;
    if (!predicted.splitExists) {
      // if the split has not been created, add a call to create it
      // to the multicall3 aggregate call

      const { data, address } = await splitsClient.callData.createSplit(
        splitsConfig
      );
      splitCallData = data;
      splitAddress = address;
      agregate3Calls.push({
        allowFailure: false,
        callData: data,
        target: address as Address,
        value: BigInt(0),
      });
    }
    return {
      agregate3Calls,
      predicted,
      splitCallData,
      splitAddress,
      error: false,
    };
  };

  const handleWriteCreate1155 = async (parameters: any) => {
    if (!publicClient || !walletClient?.account.address) {
      console.log("publicClient or walletClient is missing");
      return;
    }
    const { request } = await publicClient.simulateContract(parameters);

    // execute the transaction
    const hash = await walletClient.writeContract(request);
    if (!hash) return;
    const transaction = await publicClient.waitForTransactionReceipt({
      hash,
    });
    return transaction;
  };

  const handleCopy = () => {
    toast({
      title: "copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <AppLayout isCustomHeader={false} noHeader>
      <Flex bg="rgba(5, 0, 31, 1)" direction={"column"} h="100vh">
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
                value={progressPercentage}
              />
              <Text mt="30px" textAlign="center">
                {transactionMessage ??
                  carouselProgressStatusMessages[carouselProgressIndex]}
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
                  onClick={() => {
                    if (title) handleTrimVideo();
                  }}
                  isDisabled={
                    !title ||
                    clipRange[1] - clipRange[0] > 30 ||
                    clipRange[1] - clipRange[0] < 2 ||
                    title.length > 100
                  }
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
                    Create
                  </Text>
                </Button>
              </>
            </Flex>
          ) : pageState === "sharing" ? (
            <Flex direction={"column"} justifyContent={"center"}>
              <video
                ref={videoRef}
                src={finalClipObject?.videoLink.concat("#t=0.1")}
                style={{
                  height: "500px",
                }}
                controls
              />
              <Flex>
                <Text fontSize="30px" textAlign="center">
                  {finalClipObject?.title ?? "title"}
                </Text>
              </Flex>
              <Flex>
                <Text fontSize="30px" textAlign="center">
                  owned by{" "}
                  {finalClipObject?.owner?.username ??
                    centerEllipses(finalClipObject?.owner?.address, 13)}
                </Text>
              </Flex>
              {finalClipObject?.videoLink && (
                <Flex justifyContent={"center"} mt="20px">
                  <Button
                    onClick={() => {
                      window.open(
                        `https://x.com/intent/tweet?text=${encodeURIComponent(
                          `Check this out: ${finalClipObject?.videoLink}`
                        )}`,
                        "_blank"
                      );
                    }}
                  >
                    Post on X
                  </Button>
                  <Button
                    onClick={() => {
                      window.open(
                        `https://warpcast.com/~/compose?text=Hello%20world!&embeds[]=${finalClipObject?.videoLink}`,
                        "_blank"
                      );
                    }}
                  >
                    Post on Warpcast
                  </Button>
                  <IconButton
                    aria-label="copy-clip-link"
                    color="white"
                    icon={<FaRegCopy />}
                    bg="transparent"
                    _focus={{}}
                    _active={{}}
                    _hover={{}}
                    onClick={() => {
                      copy(finalClipObject?.videoLink);
                      handleCopy();
                    }}
                  />
                </Flex>
              )}
            </Flex>
          ) : null}
        </Flex>
      </Flex>
    </AppLayout>
  );
};
export default Clip;
