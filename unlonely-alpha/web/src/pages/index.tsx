import { ApolloError, useLazyQuery } from "@apollo/client";
import {
  Flex,
  Text,
  Image,
  Spinner,
  IconButton,
  Input,
  useBreakpointValue,
  Tooltip,
  Button,
  useToast,
} from "@chakra-ui/react";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { useRouter } from "next/router";
import { BiRefresh } from "react-icons/bi";

import AppLayout from "../components/layout/AppLayout";
// import LiveChannelList from "../components/channels/LiveChannelList";
import { WavyText } from "../components/general/WavyText";
import useUserAgent from "../hooks/internal/useUserAgent";
import { Channel, GetSubscriptionQuery } from "../generated/graphql";
import { SelectableChannel } from "../components/mobile/SelectableChannel";
import { GET_SUBSCRIPTION } from "../constants/queries";
import useAddChannelToSubscription from "../hooks/server/useAddChannelToSubscription";
import useRemoveChannelFromSubscription from "../hooks/server/channel/useRemoveChannelFromSubscription";
import { useUser } from "../hooks/context/useUser";
import { sortChannels } from "../utils/channelSort";
import { useCacheContext } from "../hooks/context/useCache";
// import BooEventWrapper from "../components/layout/BooEventWrapper";
import { safeIncludes } from "../utils/safeFunctions";
import HomepageHeader from "../components/navigation/HomepageHeader";
import { HomepageWelcomeTicker } from "../components/layout/HomepageWelcomeTicker";
import { FIXED_SOLANA_MINT } from "../constants";
import { IntegratedTerminal } from "../components/layout/IntegratedBooJupiterTerminal";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { RiSwapFill } from "react-icons/ri";
import { HomePageGalleryScroller } from "../components/layout/HomePageGalleryScroller";
import { FaRegCopy } from "react-icons/fa";
import copy from "copy-to-clipboard";

export type GalleryData = {
  link: string;
  thumbnailUrl: string;
};

const FUD_GALLERY: GalleryData[] = [
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/53c777b99t6iz1t3/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/53c777b99t6iz1t3/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/9b8etvdrpax7ffat/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/9b8etvdrpax7ffat/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/fb17772bn8fv0czh/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/fb17772bn8fv0czh/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/a73384r7dlw15k0e/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/a73384r7dlw15k0e/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/d84179xshamjhvfj/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/d84179xshamjhvfj/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/fc876hm4fjl6ar2d/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/fc876hm4fjl6ar2d/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/fa37pi29jo6xheve/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/fa37pi29jo6xheve/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/84c7fb50xfko74qw/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/84c7fb50xfko74qw/thumbnails/keyframes_0.png",
  },
];

const LOL_S2_GALLERY: GalleryData[] = [
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/c956z9uignbc90mo/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/c956z9uignbc90mo/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/338fg877s5pcytlr/video/download.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/338fg877s5pcytlr/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/35400m0ahprxnpzc/video/download.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/35400m0ahprxnpzc/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/3fb3sst39yp9e933/video/download.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/3fb3sst39yp9e933/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/814cxfsvmmv0nd6n/video/download.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/814cxfsvmmv0nd6n/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/ab0am2g9rxmzh0z7/video/download.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/ab0am2g9rxmzh0z7/thumbnails/keyframes_0.png",
  },
];

const LOL_S1_GALLERY: GalleryData[] = [
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/a63eolqg2mcu3lsq/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/a63eolqg2mcu3lsq/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/02caqj3ptyeu1w7a/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/02caqj3ptyeu1w7a/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/31dckd3mgzlu58dx/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/31dckd3mgzlu58dx/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/decf26falqhb6lgk/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/decf26falqhb6lgk/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/5e1acmpbpjres546/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/5e1acmpbpjres546/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/2250k25nz3ezrafa/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/2250k25nz3ezrafa/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/082cfh9zyf80pf04/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/082cfh9zyf80pf04/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/565az06iknyl5iiv/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/565az06iknyl5iiv/thumbnails/keyframes_0.png",
  },
];

const SELECT_NFCS: GalleryData[] = [
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/51f2l6xnxdu2otj9/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/51f2l6xnxdu2otj9/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/b8cady7pl6ndtzfw/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/b8cady7pl6ndtzfw/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/36efm3k9mv4e3htl/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/36efm3k9mv4e3htl/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/b16333wky0wpgr8d/720p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/b16333wky0wpgr8d/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/5e06p8lvjs5drlz7/1080p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/5e06p8lvjs5drlz7/thumbnails/keyframes_0.png",
  },
  {
    link: "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/0b33rd95h30ir6ne/1080p0.mp4",
    thumbnailUrl:
      "https://vod-cdn.lp-playback.studio/raw/jxf4iblf6wlsyor6526t4tcmtmqa/catalyst-vod-com/hls/0b33rd95h30ir6ne/thumbnails/keyframes_0.png",
  },
  {
    link: "https://unlonely-clips.s3.us-west-2.amazonaws.com/brian-clips/20240416151906/clip.mp4",
    thumbnailUrl:
      "https://unlonely-clips.s3.us-west-2.amazonaws.com/brian-clips/20240416151906/thumbnail.jpg",
  },
];

function DesktopHomePage({
  dataChannels,
  loading,
  error,
}: {
  dataChannels: any;
  loading: boolean;
  error?: ApolloError;
}) {
  const { isMobile } = useUserAgent();
  // const { isOpen, onOpen, onClose } = useDisclosure();
  // const btnRef = useRef<HTMLButtonElement>(null);

  // const [directingToChannel, setDirectingToChannel] = useState<boolean>(false);

  // const channels = dataChannels;
  const toast = useToast();

  const isMobileView = useBreakpointValue({
    base: true,
    sm: true,
    md: false,
    xl: false,
  });

  const [isSell, setIsSell] = useState<boolean>(false);

  const handleCopyContractAddress = () => {
    copy(FIXED_SOLANA_MINT.mintAddress);
    toast({
      title: "copied contract address",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <AppLayout isCustomHeader={false} noHeader>
      <Flex bg="rgba(5, 0, 31, 1)" position={"relative"} direction="column">
        {/* {!isMobile && <Header />} */}
        <HomepageHeader />
        <HomepageWelcomeTicker />
        <Flex direction={isMobileView ? "column-reverse" : "row"} mt="20px">
          <Flex
            width={isMobileView ? "100%" : "50%"}
            direction="column"
            gap="15px"
            p="10px"
          >
            <Text textAlign={"center"} fontSize="30px" fontWeight="bold">
              gallery
            </Text>
            <Flex
              bg="rgba(55, 255, 139, 1)"
              direction={"column"}
              gap="10px"
              p="10px"
            >
              <Flex color="black" direction={isMobileView ? "column" : "row"}>
                <Flex
                  width={isMobileView ? "100%" : "30%"}
                  direction="column"
                  p="10px"
                >
                  <Text
                    fontSize="25px"
                    fontWeight="bold"
                    textDecoration={"underline"}
                  >
                    the FUD
                  </Text>
                  <Text fontSize="15px">
                    a 24 hr horror show feat. rasmr, linda & sarah locked in a
                    bushwick church basement
                  </Text>
                </Flex>
                <Flex width={isMobileView ? "100%" : "70%"}>
                  <Flex
                    bg="rgba(0, 0, 0, 0.3)"
                    direction="row"
                    overflowY="hidden"
                    justifyContent="left"
                    p="10px"
                    width="100%"
                    height={{
                      base: "14rem",
                      sm: "18rem",
                      md: "18rem",
                      lg: "18rem",
                    }}
                  >
                    <HomePageGalleryScroller galleryDataArray={FUD_GALLERY} />
                  </Flex>
                </Flex>
              </Flex>
              <Flex color="black" direction={isMobileView ? "column" : "row"}>
                <Flex
                  width={isMobileView ? "100%" : "30%"}
                  direction="column"
                  p="10px"
                >
                  <Text
                    fontSize="25px"
                    fontWeight="bold"
                    textDecoration={"underline"}
                  >
                    love on leverage (s2)
                  </Text>
                  <Text fontSize="15px">
                    cooper, li jin, david phelps & more go on live blind dates
                    that viewers can bet on
                  </Text>
                </Flex>
                <Flex width={isMobileView ? "100%" : "70%"}>
                  <Flex
                    bg="rgba(0, 0, 0, 0.3)"
                    direction="row"
                    overflowY="hidden"
                    justifyContent="left"
                    p="10px"
                    width="100%"
                    height={{
                      base: "14rem",
                      sm: "18rem",
                      md: "18rem",
                      lg: "18rem",
                    }}
                  >
                    <HomePageGalleryScroller
                      galleryDataArray={LOL_S2_GALLERY}
                    />
                  </Flex>
                </Flex>
              </Flex>
              <Flex color="black" direction={isMobileView ? "column" : "row"}>
                <Flex
                  width={isMobileView ? "100%" : "30%"}
                  direction="column"
                  p="10px"
                >
                  <Text
                    fontSize="25px"
                    fontWeight="bold"
                    textDecoration={"underline"}
                  >
                    love on leverage (s1)
                  </Text>
                  <Text fontSize="15px">
                    seraphim, winny.eth, reka, dancingeddie & more go on live
                    blind dates that viewers can bet on.
                  </Text>
                </Flex>
                <Flex width={isMobileView ? "100%" : "70%"}>
                  <Flex
                    bg="rgba(0, 0, 0, 0.3)"
                    direction="row"
                    overflowY="hidden"
                    justifyContent="left"
                    p="10px"
                    width="100%"
                    height={{
                      base: "14rem",
                      sm: "18rem",
                      md: "18rem",
                      lg: "18rem",
                    }}
                  >
                    <HomePageGalleryScroller
                      galleryDataArray={LOL_S1_GALLERY}
                    />
                  </Flex>
                </Flex>
              </Flex>
              <Flex color="black" direction={isMobileView ? "column" : "row"}>
                <Flex
                  width={isMobileView ? "100%" : "30%"}
                  direction="column"
                  p="10px"
                >
                  <Text
                    fontSize="25px"
                    fontWeight="bold"
                    textDecoration={"underline"}
                  >
                    unlonely NFCs
                  </Text>
                  <Text fontSize="15px">
                    clips from the various streams on unlonely from doormat,
                    rehash, gmfarcaster, ted & many more
                  </Text>
                  <Flex justifyContent={"flex-end"}>
                    <Button
                      bg="#262664"
                      color="rgba(55, 255, 139, 1)"
                      height="25px"
                      width="100px"
                      _hover={{ color: "#262664", bg: "#ffffff" }}
                      onClick={() => {
                        window.open(
                          `${window.origin}/nfcs?sort=createdAt`,
                          "_blank"
                        );
                      }}
                    >
                      see all
                    </Button>
                  </Flex>
                </Flex>
                <Flex width={isMobileView ? "100%" : "70%"}>
                  <Flex
                    bg="rgba(0, 0, 0, 0.3)"
                    direction="row"
                    overflowY="hidden"
                    justifyContent="left"
                    p="10px"
                    width="100%"
                    height={{
                      base: "14rem",
                      sm: "18rem",
                      md: "18rem",
                      lg: "18rem",
                    }}
                  >
                    <HomePageGalleryScroller galleryDataArray={SELECT_NFCS} />
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
          <Flex
            direction="column"
            width={isMobileView ? "100%" : "50%"}
            gap="50px"
            p="10px"
          >
            <Flex direction="column" gap="15px">
              <Text textAlign={"center"} fontSize="30px" fontWeight="bold">
                what is $boo?
              </Text>
              <Flex direction="column" gap="10px">
                <Flex height="50vh">
                  <iframe
                    width="100%"
                    height="100%"
                    id="geckoterminal-embed"
                    title="GeckoTerminal Embed"
                    src={`https://www.geckoterminal.com/solana/pools/${FIXED_SOLANA_MINT.poolAddress}?embed=1&info=0&swaps=0`}
                    allow="clipboard-write"
                    hidden={isMobileView}
                  ></iframe>
                </Flex>
                <Flex width="100%" justifyContent={"center"}>
                  <Flex>
                    <Flex position={"absolute"} zIndex={51} bg="#1F2935">
                      <Tooltip
                        label={`switch to ${isSell ? "buy" : "sell"}`}
                        shouldWrapChildren
                      >
                        <IconButton
                          bg="#1F2935"
                          color="#21ec54"
                          _hover={{
                            bg: "#354559",
                          }}
                          aria-label="swap token input"
                          icon={<RiSwapFill size={20} />}
                          zIndex={51}
                          onClick={() => {
                            setIsSell((prev) => !prev);
                          }}
                        />
                      </Tooltip>
                      <Tooltip label="dexscreener" shouldWrapChildren>
                        <IconButton
                          bg="#1F2935"
                          color="#21ec54"
                          _hover={{
                            bg: "#354559",
                          }}
                          aria-label="go to dexscreener"
                          icon={<ExternalLinkIcon />}
                          zIndex={51}
                          onClick={() => {
                            window.open(
                              `https://dexscreener.com/solana/${FIXED_SOLANA_MINT.poolAddress}`,
                              "_blank"
                            );
                          }}
                        />
                      </Tooltip>
                    </Flex>
                    <IntegratedTerminal
                      isBuy={!isSell}
                      height="400px"
                      width={isMobileView ? "100%" : "unset"}
                    />
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
            <Flex direction="column" gap="15px">
              <Text textAlign={"center"} fontSize="30px" fontWeight="bold">
                what's next?
              </Text>
              <Text textAlign={"center"}>
                $boo is unlonely’s official content token, currently tradable on
                solana.
              </Text>
              <Flex justifyContent={"center"}>
                <Button
                  onClick={handleCopyContractAddress}
                  borderRadius="35px"
                  width="150px"
                  color="white"
                  background="#564F9A"
                  _active={{}}
                  _focus={{}}
                  _hover={{
                    transform: "scale(1.05)",
                  }}
                >
                  <Flex alignItems={"center"} gap="5px">
                    <FaRegCopy size="20px" />
                    <Text fontSize="30px" fontFamily="LoRes15">
                      $BOO CA
                    </Text>
                  </Flex>
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      {/* {!directingToChannel ? (
        <Flex
          direction="column"
          justifyContent="center"
          width="100vw"
          gap={"10px"}
          pb="10px"
        >
          <Drawer
            size={"full"}
            isOpen={isOpen}
            placement="right"
            onClose={onClose}
            finalFocusRef={btnRef}
          >
            <DrawerOverlay />
            <DrawerContent bg="#19162F">
              <DrawerCloseButton />
              <DrawerHeader bg="#19162F">schedule</DrawerHeader>
              <FixedComponent />
            </DrawerContent>
          </Drawer>
          <Flex direction="column" gap={5}>
            {!sideBarBreakpoints && !loading && (
              <Flex justifyContent={"center"}>
                <Button
                  color="white"
                  ref={btnRef}
                  onClick={onOpen}
                  bg="#CB520E"
                  _hover={{}}
                  _focus={{}}
                  _active={{}}
                  borderRadius="25px"
                >
                  see schedule
                </Button>
              </Flex>
            )}
            {error ? (
              <Flex
                alignItems={"center"}
                justifyContent={"center"}
                width="100%"
                fontSize={"30px"}
                gap="15px"
                my="2rem"
              >
                <Text fontFamily={"LoRes15"}>
                  an error has occurred when fetching channels
                </Text>
              </Flex>
            ) : !channels || loading ? (
              <Flex
                alignItems={"center"}
                justifyContent={"center"}
                width="100%"
                fontSize={"30px"}
                gap="15px"
                my="3rem"
              >
                <WavyText text="loading streams..." />
              </Flex>
            ) : (
              <LiveChannelList
                channels={channels}
                callback={() => setDirectingToChannel(true)}
              />
            )}
          </Flex>
          <Flex p="16px">
            <Box
              width={{
                base: "100%",
                md: "70%",
                xl: "70%",
              }}
            >
              <Container
                overflowY="auto"
                centerContent
                maxWidth={"100%"}
                gap="1rem"
              >
                <ScrollableComponent />
              </Container>
            </Box>
            {sideBarBreakpoints && (
              <Box
                width={{
                  base: "0%",
                  md: "30%",
                  xl: "30%",
                }}
              >
                <Container height="100%">
                  <FixedComponent />
                </Container>
              </Box>
            )}
          </Flex>
        </Flex>
      ) : (
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          width="100%"
          height="calc(100vh - 64px)"
          fontSize="50px"
        >
          <WavyText text="loading..." />
        </Flex>
      )} */}
    </AppLayout>
  );
}

function MobileHomePage({
  dataChannels,
  loading,
  error,
}: {
  dataChannels: any;
  loading: boolean;
  error?: ApolloError;
}) {
  const { isStandalone } = useUserAgent();
  const { initialNotificationsGranted } = useUser();
  const router = useRouter();
  const scrollRef = useRef<VirtuosoHandle>(null);

  const [loadingPage, setLoadingPage] = useState<boolean>(false);
  const [endpoint, setEndpoint] = useState<string>("");
  const [sortedChannels, setSortedChannels] = useState<Channel[]>([]);

  const [getSubscription, { data: subscriptionData }] =
    useLazyQuery<GetSubscriptionQuery>(GET_SUBSCRIPTION, {
      fetchPolicy: "network-only",
    });

  const channels: Channel[] = dataChannels;

  const suggestedChannels = useMemo(
    () => subscriptionData?.getSubscriptionByEndpoint?.allowedChannels,
    [subscriptionData]
  );

  const handleSelectChannel = useCallback((slug: string) => {
    setLoadingPage(true);
    router.push(`/channels/${slug}`);
  }, []);

  const { addChannelToSubscription } = useAddChannelToSubscription({
    onError: () => {
      console.error("Failed to add channel to subscription.");
    },
  });

  const { removeChannelFromSubscription } = useRemoveChannelFromSubscription({
    onError: () => {
      console.error("Failed to remove channel from subscription.");
    },
  });

  const handleGetSubscription = useCallback(async () => {
    await getSubscription({
      variables: { data: { endpoint } },
    });
  }, [endpoint]);

  useEffect(() => {
    if (endpoint) {
      handleGetSubscription();
    }
  }, [endpoint]);

  useEffect(() => {
    const init = async () => {
      if ("serviceWorker" in navigator) {
        const registrationExists =
          await navigator.serviceWorker.getRegistration("/");
        if (registrationExists) {
          const subscription =
            await registrationExists.pushManager.getSubscription();
          if (subscription) {
            const endpoint = subscription.endpoint;
            setEndpoint(endpoint);
          }
        }
      }
    };
    init();
  }, [initialNotificationsGranted]);

  useEffect(() => {
    const liveChannels = channels?.filter((channel) => channel.isLive);
    const _suggestedNonLiveChannels = suggestedChannels
      ? channels?.filter(
          (channel) =>
            safeIncludes(suggestedChannels, String(channel.id)) &&
            !channel.isLive
        )
      : [];
    const otherChannels = suggestedChannels
      ? channels?.filter(
          (channel) =>
            !safeIncludes(suggestedChannels, String(channel.id)) &&
            !channel.isLive
        )
      : channels?.filter((channel) => !channel.isLive);
    const sortedLiveChannels = sortChannels(liveChannels);
    const sortedSuggestedNonLiveChannels = sortChannels(
      _suggestedNonLiveChannels
    );
    const sortedOtherChannels = sortChannels(otherChannels);
    setSortedChannels([
      ...sortedLiveChannels,
      ...sortedSuggestedNonLiveChannels,
      ...sortedOtherChannels,
    ]);
  }, [channels, suggestedChannels]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const debounceDelay = 200; // milliseconds

  const filteredChannels = useMemo(() => {
    return sortedChannels?.filter((c) =>
      debouncedSearch.length > 0
        ? safeIncludes(
            c.owner.username?.toLowerCase(),
            debouncedSearch?.toLowerCase()
          ) ||
          safeIncludes(
            c.owner.address?.toLowerCase(),
            debouncedSearch?.toLowerCase()
          ) ||
          safeIncludes(c.slug?.toLowerCase(), debouncedSearch?.toLowerCase())
        : c
    );
  }, [sortedChannels, debouncedSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounceDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [search, debounceDelay]);

  return (
    <AppLayout isCustomHeader={false}>
      {!loadingPage && !loading ? (
        <>
          <Flex
            direction="column"
            justifyContent="center"
            width="100vw"
            position="relative"
            height="100%"
          >
            <IconButton
              color="white"
              position="absolute"
              aria-label="refresh"
              icon={<BiRefresh size="20px" />}
              bg="rgb(0, 0, 0, 0.5)"
              onClick={() => window?.location?.reload()}
              _hover={{}}
              _focus={{}}
              _active={{}}
              borderWidth="1px"
              zIndex="1"
              borderRadius={"50%"}
              right="1rem"
              bottom="1rem"
            />
            <Input
              fontSize={isStandalone ? "16px" : "unset"}
              variant="glow"
              placeholder="search for a streamer"
              width={"100%"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              position={filteredChannels.length === 0 ? "absolute" : undefined}
              top={filteredChannels.length === 0 ? "0" : undefined}
            />
            {error ? (
              <Text
                textAlign={"center"}
                fontFamily={"LoRes15"}
                fontSize={"25px"}
              >
                an error has occurred when fetching channels
              </Text>
            ) : filteredChannels && filteredChannels.length > 0 ? (
              <Virtuoso
                ref={scrollRef}
                data={filteredChannels}
                totalCount={filteredChannels.length}
                initialTopMostItemIndex={0}
                itemContent={(index, data) => (
                  <SelectableChannel
                    key={data.id || index}
                    subscribed={safeIncludes(
                      suggestedChannels,
                      String(data.id)
                    )}
                    channel={data}
                    addChannelToSubscription={addChannelToSubscription}
                    removeChannelFromSubscription={
                      removeChannelFromSubscription
                    }
                    handleGetSubscription={handleGetSubscription}
                    endpoint={endpoint}
                    callback={handleSelectChannel}
                  />
                )}
              />
            ) : (
              <Text
                textAlign={"center"}
                fontFamily={"LoRes15"}
                fontSize={"25px"}
              >
                Could not fetch channels, please try again later
              </Text>
            )}
          </Flex>
        </>
      ) : (
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          direction="column"
          width="100%"
          height="calc(100vh - 103px)"
          fontSize="50px"
        >
          <Image
            src="/icons/icon-192x192.png"
            borderRadius="10px"
            height="96px"
          />
          <Flex>
            <WavyText text="..." />
          </Flex>
        </Flex>
      )}
    </AppLayout>
  );
}

export default function Page() {
  const { channelFeed, feedLoading, feedError } = useCacheContext();

  const { isStandalone, ready } = useUserAgent();

  if (feedError) console.error("channel feed query error:", feedError);

  return (
    <>
      {ready ? (
        <>
          {!isStandalone ? (
            <DesktopHomePage
              dataChannels={channelFeed}
              loading={feedLoading}
              error={feedError}
            />
          ) : (
            <MobileHomePage
              dataChannels={channelFeed}
              loading={feedLoading}
              error={feedError}
            />
          )}
        </>
      ) : (
        <AppLayout isCustomHeader={false}>
          <Spinner />
        </AppLayout>
      )}
    </>
  );
}
