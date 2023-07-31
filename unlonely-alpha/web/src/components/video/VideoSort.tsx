import { SimpleGrid, Flex } from "@chakra-ui/react";
import React from "react";

import { VideoCard_VideoFragment } from "../../generated/graphql";
import VideoCard from "./VideoCard";

export type VideoAttribute = "score" | "createdAt";

type Props = {
  videos: VideoCard_VideoFragment[];
  sort: VideoAttribute;
};

const PostSort: React.FunctionComponent<Props> = ({ videos, sort }) => {
  return <>{renderPostList(sortVideoByAttribute(videos, "score"))}</>;
};

const renderPostList = (data: VideoCard_VideoFragment[]): JSX.Element => {
  let cardId = 0;
  return (
    <>
      <Flex direction="column" width="100%">
        <SimpleGrid
          columns={2}
          minChildWidth={{ base: "100%", md: "40%" }}
          gap="1rem"
        >
          {data?.map((a) => {
            cardId++;
            return !!a && <VideoCard key={a.id} video={a} order={cardId} />;
          })}
        </SimpleGrid>
      </Flex>
    </>
  );
};

const sortVideoByAttribute = (
  dataArray: VideoCard_VideoFragment[] | undefined,
  attribute: VideoAttribute
): VideoCard_VideoFragment[] => {
  if (!dataArray) return [];
  const temp = [...dataArray];
  temp.sort(
    (a: VideoCard_VideoFragment, b: VideoCard_VideoFragment) =>
      (b[attribute] as any) - (a[attribute] as any)
  );
  if (attribute === "createdAt") {
    const temp2 = temp.sort(function (a, b) {
      const c = new Date(a.createdAt);
      const d = new Date(b.createdAt);
      return c.getTime() - d.getTime();
    });
    return temp2.reverse();
  }

  return temp;
};

export default PostSort;