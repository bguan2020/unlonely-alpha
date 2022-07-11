import { gql } from "@apollo/client";
import { Flex, Text, ScaleFade } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

import centerEllipses from "../utils/centerEllipses";

type Props = {
  x: number;
  y: number;
  commentTimestamp: number;
  currentTimestamp: number;
  text: string;
  score: number;
  username: string | null;
  address: string;
  color: string;
};

export default function Comment({
  x,
  y,
  commentTimestamp,
  currentTimestamp,
  text,
  color,
  username,
  address,
  score,
}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const shouldDisplayComment = () => {
    if (currentTimestamp < 0.01) {
      setIsOpen(false);
    } else {
      if (
        currentTimestamp - commentTimestamp < 10 &&
        currentTimestamp - commentTimestamp > 0
      ) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }
  };

  useEffect(() => {
    shouldDisplayComment();
  }, [currentTimestamp]);

  return (
    <div
      className={"absolute select-none pointer-events-none"}
      style={{ left: x, top: y }}
      id="1"
    >
      <ScaleFade initialScale={0.4} in={isOpen}>
        <Text color="#8E8D94" fontSize="12px" paddingLeft="10px">
          {username === null ? centerEllipses(address, 7) : username}
        </Text>
        <Flex
          bg={color}
          borderRadius="20px"
          style={{ left: x, top: y }}
          padding="10px"
          maxW="375px"
        >
          <Flex direction="column">
            <Text color="white">{text}</Text>
            <Flex justifyContent="flex-end">
              <Flex
                borderRadius="20px"
                bg="#303030"
                marginBottom="auto"
                padding="5px"
              >
                <Text color="white" fontSize="12px">
                  ❤️ {score}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </ScaleFade>
    </div>
  );
}

Comment.fragments = {
  comment: gql`
    fragment Comment_comment on Comment {
      owner {
        username
        address
      }
      text
      score
      color
      location_x
      location_y
      videoId
      videoTimestamp
      createdAt
    }
  `,
};
