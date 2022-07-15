import { RoomProvider, useMyPresence, useOthers } from "@liveblocks/react";
import { gql, useQuery } from "@apollo/client";
import React, { useState, useCallback } from "react";
import { Text, Flex, Grid, GridItem } from "@chakra-ui/react";

import Cursor from "../components/Cursor";
import FlyingReaction from "../components/FlyingReaction";
import ReactionSelector from "../components/ReactionSelector";
import { COLORS } from "../styles/Colors";
import { Presence, CursorMode, CursorState, Reaction } from "../types/cursor";
import AppLayout from "../components/layout/AppLayout";
import VideoSort, { VideoAttribute } from "../components/video/VideoSort";

const videoId = 1;

const VIDEO_LIST_QUERY = gql`
  query VideoFeed($data: VideoFeedInput!) {
    getVideoFeed(data: $data) {
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
    }
  }
`;

function Example() {
  const others = useOthers<Presence>();
  const [{ cursor }, updateMyPresence] = useMyPresence<Presence>();
  const [state, setState] = useState<CursorState>({ mode: CursorMode.Hidden });
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [sortVideoAs, setSortVideoAs] = useState<VideoAttribute>("score");

  const { data, loading, error } = useQuery(VIDEO_LIST_QUERY, {
    variables: {
      data: {
        searchString: null,
        skip: null,
        limit: null,
        orderBy: null,
      },
    },
    pollInterval: 1000,
  });

  const videos = data?.getVideoFeed;

  const setReaction = useCallback((reaction: string) => {
    setState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  const openComment = () => {
    if (state.mode === CursorMode.Chat) {
      updateMyPresence({ message: "" });
      setState({ mode: CursorMode.Hidden });
    } else {
      setState({ mode: CursorMode.Chat, previousMessage: null, message: "" });
    }
  };

  return (
    <>
      <Grid
        gridTemplateRows={"100px 1fr 1fr"}
        gridTemplateColumns={"10% 60% 20% 10%"}
        minH="calc(100vh - 48px)"
      >
        <GridItem rowSpan={1} colSpan={2}></GridItem>
        <GridItem rowSpan={3} colSpan={1} border="2px">
          The Chat Room! Move your mouse here to chat!
          <div
            style={{
              height: "100%",
              width: "100%",
              cursor:
                state.mode === CursorMode.Chat
                  ? "none"
                  : "url(cursor.svg) 0 0, auto",
            }}
            onPointerMove={(event) => {
              if (
                cursor == null ||
                state.mode !== CursorMode.ReactionSelector
              ) {
                updateMyPresence({
                  cursor: {
                    x: Math.round(event.clientX),
                    y: Math.round(event.clientY),
                  },
                });
              }
            }}
            onPointerLeave={() => {
              setState({
                mode: CursorMode.Hidden,
              });
              updateMyPresence({
                cursor: null,
              });
            }}
            onClick={() => openComment()}
          >
            {reactions.map((reaction) => {
              return (
                <FlyingReaction
                  key={reaction.timestamp.toString()}
                  x={reaction.point.x}
                  y={reaction.point.y}
                  timestamp={reaction.timestamp}
                  value={reaction.value}
                />
              );
            })}
            {cursor && (
              <div
                className="absolute top-0 left-0"
                style={{
                  transform: `translateX(${cursor.x}px) translateY(${cursor.y}px)`,
                }}
              >
                {state.mode === CursorMode.Hidden && (
                  <Flex maxW="120px">
                    <Text noOfLines={4} fontSize="sm" color="black">
                      click anywhere around the video to comment!
                    </Text>
                  </Flex>
                )}
                {state.mode === CursorMode.Chat && (
                  <>
                    <img src="cursor.svg" />
                    <div
                      className="absolute top-5 left-2 px-4 py-2 bg-blue-500 text-white leading-relaxed text-sm"
                      onKeyUp={(e) => e.stopPropagation()}
                      style={{
                        borderRadius: 20,
                      }}
                    >
                      {state.previousMessage && (
                        <div>{state.previousMessage}</div>
                      )}
                      <input
                        className="bg-transparent border-none	outline-none text-white placeholder-blue-300 w-60"
                        autoFocus={true}
                        onChange={(e) => {
                          updateMyPresence({ message: e.target.value });
                          setState({
                            mode: CursorMode.Chat,
                            previousMessage: null,
                            message: e.target.value,
                          });
                        }}
                        placeholder={
                          state.previousMessage ? "" : "Say something…"
                        }
                        value={state.message}
                        maxLength={50}
                      />
                    </div>
                  </>
                )}
                {state.mode === CursorMode.ReactionSelector && (
                  <ReactionSelector
                    setReaction={(reaction) => {
                      setReaction(reaction);
                    }}
                  />
                )}
                {state.mode === CursorMode.Reaction && (
                  <div className="absolute top-3.5 left-1 pointer-events-none select-none">
                    {state.reaction}
                  </div>
                )}
              </div>
            )}
            {others.map(({ connectionId, presence }) => {
              if (presence == null || !presence.cursor) {
                return null;
              }
              return (
                <Cursor
                  key={connectionId}
                  color={COLORS[connectionId % COLORS.length]}
                  x={presence.cursor.x}
                  y={presence.cursor.y}
                  message={presence.message}
                />
              );
            })}
          </div>
        </GridItem>
        <GridItem rowSpan={3} colSpan={1}></GridItem>
        <GridItem rowSpan={2} colSpan={1}></GridItem>
        <GridItem rowSpan={1} colSpan={1} mb="20px">
          <Flex
            flexDirection="row"
            justifyContent="center"
            width="100%"
            height="100%"
          >
            <iframe
              src="https://player.castr.com/live_4a9cb290032511edba7dd7a3002e508b"
              style={{ aspectRatio: "16/9", minHeight: "500px" }}
              frameBorder="0"
              scrolling="no"
              allow="autoplay"
              allowFullScreen
            />
          </Flex>
        </GridItem>
        <GridItem rowSpan={1} colSpan={1}>
          <Flex width="100%" justifyContent="center">
            <VideoSort videos={videos} sort={sortVideoAs} />
          </Flex>
        </GridItem>
      </Grid>
    </>
  );
}

export default function Page() {
  const roomId = "unlonely-demo";

  return (
    <RoomProvider
      id={roomId}
      initialPresence={() => ({
        cursor: null,
        message: "",
      })}
    >
      <AppLayout>
        <Example />
      </AppLayout>
    </RoomProvider>
  );
}

export async function getStaticProps() {
  const API_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

  return { props: {} };
}
