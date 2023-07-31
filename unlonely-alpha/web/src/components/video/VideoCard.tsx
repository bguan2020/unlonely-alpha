import { Text, Grid, GridItem, Flex } from "@chakra-ui/layout";
import { Image, Tooltip, useToast } from "@chakra-ui/react";
import { gql } from "@apollo/client";
import { useState } from "react";
import { useAccount } from "wagmi";

import Card from "../../components/general/Card";
import { VideoCard_VideoFragment } from "../../generated/graphql";

import { UpVoteIcon, UpVoteIconSalmon } from "../icons/UpVoteIcon";
import { DownVoteIcon } from "../icons/DownVoteIcon";
import NebulousButton from "../general/button/NebulousButton";
import centerEllipses from "../../utils/centerEllipses";
import WinnerWrapper from "./WinnerWrapper";

type Props = {
  video: VideoCard_VideoFragment;
  order: number;
};

const VideoCardInner = ({ video, order }: Props) => {
  // const { like, skip } = useLike(video);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const accountData = useAccount();
  const toast = useToast();

  // const submitLike = async () => {
  //   setButtonDisabled(true);
  //   await like();

  //   setTimeout(() => {
  //     setButtonDisabled(false);
  //   }, 1000);
  // };

  // const submitSkip = async () => {
  //   setButtonDisabled(true);
  //   await skip();

  //   setTimeout(() => {
  //     setButtonDisabled(false);
  //   }, 1000);
  // };

  // function to convert number of seconds to hours:minutes:seconds
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor((seconds % 3600) % 60);

    const hDisplay = h > 0 ? `${h}hr` : "";
    const mDisplay = m > 0 ? `${m}m` : "";
    const sDisplay = s > 0 ? `${s}s` : "";
    return `${hDisplay} ${mDisplay} ${sDisplay}`;
  };

  return (
    <>
      <Flex
        direction="column"
        bg="#F1F4F8"
        overflow="hidden"
        padding={{ base: "0", sm: "0.5rem" }}
        borderRadius="0.5rem"
      >
        <Flex
          justifyContent="space-between"
          alignItems="center"
          padding="0.25 0.3125rem"
        >
          <Text color="#787878" fontSize="14px" fontWeight={"bold"} ml="5px">
            {video.owner.username === null
              ? centerEllipses(video.owner.address, 7)
              : video.owner.username}
          </Text>
          <GridItem colSpan={1} pl="10px" fontSize="16px" fontWeight="600">
            <Tooltip label="vote to watch video">
              {accountData?.address ? (
                <span>
                  <NebulousButton
                    opacity={video.liked ? "1" : "0.5"}
                    aria-label="like"
                    // onClick={submitLike}
                    disabled={buttonDisabled}
                  >
                    {video.liked === true ? (
                      <UpVoteIconSalmon boxSize={4} />
                    ) : (
                      <UpVoteIcon boxSize={4} />
                    )}
                  </NebulousButton>
                </span>
              ) : (
                <span>
                  <NebulousButton
                    opacity="0.5"
                    aria-label="like"
                    onClick={() =>
                      toast({
                        title: "Sign in first.",
                        description: "Please sign into your wallet first.",
                        status: "warning",
                        duration: 9000,
                        isClosable: true,
                        position: "top",
                      })
                    }
                    disabled={buttonDisabled}
                  >
                    {video.liked === true ? (
                      <UpVoteIconSalmon boxSize={4} />
                    ) : (
                      <UpVoteIcon boxSize={4} />
                    )}
                  </NebulousButton>
                </span>
              )}
            </Tooltip>
            {video.score}
            <Tooltip label="vote to skip video">
              {accountData?.address ? (
                <span>
                  <NebulousButton
                    // opacity={video.skipped ? "1" : "0.5"}
                    aria-label="like"
                    // onClick={submitSkip}
                    disabled={buttonDisabled}
                  >
                    <DownVoteIcon boxSize={4} />
                    {/* {video.skipped === true ? (
                      <DownVoteIconSalmon boxSize={4} />
                    ) : (
                      <DownVoteIcon boxSize={4} />
                    )} */}
                  </NebulousButton>
                </span>
              ) : (
                <span>
                  <NebulousButton
                    opacity="0.5"
                    aria-label="like"
                    onClick={() =>
                      toast({
                        title: "Sign in first.",
                        description: "Please sign into your wallet first.",
                        status: "warning",
                        duration: 9000,
                        isClosable: true,
                        position: "top",
                      })
                    }
                    disabled={buttonDisabled}
                  >
                    <DownVoteIcon boxSize={4} />
                    {/* {video.skipped === true ? (
                      <DownVoteIconSalmon boxSize={4} />
                    ) : (
                      <DownVoteIcon boxSize={4} />
                    )} */}
                  </NebulousButton>
                </span>
              )}
            </Tooltip>
          </GridItem>
        </Flex>
        <Card>
          <Grid templateColumns="1fr 3fr" gap="0.3125rem">
            <GridItem colSpan={1} mr="10px" width="120px">
              <Image
                src={video.thumbnail}
                height="68px"
                width="120px"
                objectFit="cover"
              />
            </GridItem>
            <Flex maxW="100%" flexDir="column">
              <Tooltip label="copy video link">
                <Text
                  textColor="#2C3A50"
                  fontWeight="bold"
                  fontSize="m"
                  lineHeight="18px"
                  noOfLines={2}
                  fontFamily="Roboto, sans-serif"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://www.youtube.com/watch?v=${video.youtubeId}`
                    );
                    toast({
                      title: "Copied!",
                      description: "Video link copied to clipboard",
                      status: "success",
                      duration: 4000,
                      isClosable: true,
                    });
                  }}
                >
                  {video.title}
                </Text>
              </Tooltip>

              <Text
                mt="5px"
                noOfLines={4}
                textColor="#2C3A50"
                fontWeight="normal"
                fontSize="14px"
                lineHeight="1.2"
                fontFamily="Roboto, sans-serif"
              >
                reason: "{video.description}"
              </Text>

              {video.duration !== 0 && (
                <Flex width="100%" justifyContent="left">
                  <Text
                    fontFamily="Roboto, sans-serif"
                    fontSize="14px"
                    color="grey"
                    mt="5px"
                  >
                    {formatTime(video.duration)}
                  </Text>
                </Flex>
              )}
            </Flex>
          </Grid>
        </Card>
      </Flex>
    </>
  );
};

const VideoCard = ({ video, order }: Props) => {
  return (
    <>
      {order === 1 && (
        <WinnerWrapper order={order}>
          <VideoCardInner video={video} order={order} />
        </WinnerWrapper>
      )}
      {order === 2 && (
        <WinnerWrapper order={order}>
          <VideoCardInner video={video} order={order} />
        </WinnerWrapper>
      )}
      {order > 2 && <VideoCardInner video={video} order={order} />}
    </>
  );
};

VideoCard.fragments = {
  video: gql`
    fragment VideoCard_video on Video {
      id
      youtubeId
      title
      thumbnail
      description
      score
      duration
      createdAt
      owner {
        username
        address
      }
      liked
    }
  `,
};

export default VideoCard;
