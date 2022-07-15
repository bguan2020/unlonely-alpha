import { Text, Grid, GridItem, Flex } from "@chakra-ui/layout";
import { Image, Tooltip, useToast } from "@chakra-ui/react";
import { gql } from "@apollo/client";
import { useState } from "react";
import { useAccount } from "wagmi";

import Card from "../../components/general/Card";
import { VideoCard_VideoFragment } from "../../generated/graphql";
import useLike from "../../hooks/useLike";

import {
  WatchIcon,
  WatchedIcon,
  SkipIcon,
  SkippedIcon,
} from "../icons/LikeIcon";
import NebulousButton from "../general/button/NebulousButton";
import centerEllipses from "../../utils/centerEllipses";
import WinnerWrapper from "./WinnerWrapper";

type Props = {
  video: VideoCard_VideoFragment;
  order: number;
};

const VideoCardInner = ({ video, order }: Props) => {
  const { like, skip } = useLike(video);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [{ data: accountData }] = useAccount();
  const toast = useToast();

  const submitLike = async () => {
    setButtonDisabled(true);
    await like();

    setTimeout(() => {
      setButtonDisabled(false);
    }, 1000);
  };

  const submitSkip = async () => {
    setButtonDisabled(true);
    await skip();

    setTimeout(() => {
      setButtonDisabled(false);
    }, 1000);
  };

  return (
    <>
      <Flex direction="column">
        <Text color="#8E8D94" fontSize="12px">
          {video.owner.username === null
            ? centerEllipses(video.owner.address, 7)
            : video.owner.username}
          's suggestion
        </Text>
        <Card>
          <Grid
            height="100px"
            templateRows="repeat(4, 1fr)"
            templateColumns="repeat(3, 1fr)"
            gap={1}
          >
            <GridItem
              rowSpan={3}
              colSpan={1}
              bg="#F1F4F8"
              mr="10px"
              width="120px"
            >
              <Image src={video.thumbnail} height="90px" width="120px" />
            </GridItem>
            <GridItem colSpan={2} rowSpan={2} maxW="100%">
              <Text
                textColor="#2C3A50"
                fontWeight="bold"
                fontSize="m"
                lineHeight="18px"
                noOfLines={2}
                fontFamily="Roboto, sans-serif"
              >
                {video.title}
              </Text>
            </GridItem>
            <GridItem colSpan={2} rowSpan={2} mt="5px">
              <Text
                noOfLines={4}
                textColor="#2C3A50"
                fontWeight="normal"
                fontSize="14px"
                lineHeight="1"
                fontFamily="Roboto, sans-serif"
              >
                reason: "{video.description}"
              </Text>
            </GridItem>
            <GridItem colSpan={1} rowSpan={1}></GridItem>
            <GridItem colSpan={2} rowSpan={1}></GridItem>
            <GridItem colSpan={1} pl="10px">
              <Tooltip label="skip video">
                {accountData?.address ? (
                  <span>
                    <NebulousButton
                      aria-label="like"
                      color="#547aa8"
                      onClick={submitSkip}
                      disabled={buttonDisabled}
                    >
                      {video.skipped === true ? (
                        <SkippedIcon boxSize={5} />
                      ) : (
                        <SkipIcon boxSize={5} />
                      )}
                    </NebulousButton>
                  </span>
                ) : (
                  <span>
                    <NebulousButton
                      aria-label="like"
                      color="#547aa8"
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
                      {video.skipped === true ? (
                        <SkippedIcon boxSize={5} />
                      ) : (
                        <SkipIcon boxSize={5} />
                      )}
                    </NebulousButton>
                  </span>
                )}
              </Tooltip>
              {video.score}
              <Tooltip label="watch video">
                {accountData?.address ? (
                  <span>
                    <NebulousButton
                      aria-label="like"
                      color="#547aa8"
                      onClick={submitLike}
                      disabled={buttonDisabled}
                    >
                      {video.liked === true ? (
                        <WatchedIcon boxSize={5} />
                      ) : (
                        <WatchIcon boxSize={5} />
                      )}
                    </NebulousButton>
                  </span>
                ) : (
                  <span>
                    <NebulousButton
                      aria-label="like"
                      color="#547aa8"
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
                        <WatchedIcon boxSize={5} />
                      ) : (
                        <WatchIcon boxSize={5} />
                      )}
                    </NebulousButton>
                  </span>
                )}
              </Tooltip>
            </GridItem>
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
      title
      thumbnail
      description
      score
      createdAt
      owner {
        username
        address
      }
      liked
      skipped
      ...useLike_video
    }
    ${useLike.fragments.video}
  `,
};

export default VideoCard;
