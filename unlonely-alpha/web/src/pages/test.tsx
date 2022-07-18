import { RoomProvider, useMyPresence, useOthers } from "@liveblocks/react";
import { gql, useQuery } from "@apollo/client";
import React, { useState, useCallback, useEffect } from "react";
import {
  Text,
  Flex,
  Grid,
  GridItem,
  Switch,
  Box,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useAccount } from "wagmi";

import Cursor from "../components/chat/Cursor";
import FlyingReaction from "../components/chat/FlyingReaction";
import ReactionSelector from "../components/chat/ReactionSelector";
import { COLORS } from "../styles/Colors";
import { Presence, CursorMode, CursorState, Reaction } from "../types/cursor";
import AppLayout from "../components/layout/AppLayout";
import VideoSort, { VideoAttribute } from "../components/video/VideoSort";
import { getEnsName } from "../utils/ens";
import centerEllipses from "../utils/centerEllipses";
import { VideoCard_VideoFragment } from "../generated/graphql";

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

type Props = {
  videos: VideoCard_VideoFragment[];
  loading: boolean;
};

const Example: React.FunctionComponent<Props> = ({ videos, loading }) => {
  const others = useOthers<Presence>();
  const [{ cursor, message }, updateMyPresence] = useMyPresence<Presence>();
  const [state, setState] = useState<CursorState>({ mode: CursorMode.Hidden });
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [sortVideoAs, setSortVideoAs] = useState<VideoAttribute>("score");
  const [showCursor, setShowCursor] = useState<boolean>(true);
  const [username, setUsername] = useState<string | null>();
  const [{ data: accountData }] = useAccount();
  const toast = useToast();

  const setReaction = useCallback((reaction: string) => {
    setState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  const openComment = () => {
    if (state.mode === CursorMode.Chat) {
      updateMyPresence({ message: "" });
      setState({ mode: CursorMode.Hidden });
    } else {
      if (!accountData?.address) {
        toast({
          title: "Sign in first.",
          description: "Please sign into your wallet first.",
          status: "warning",
          duration: 9000,
          isClosable: true,
          position: "top",
        });
      } else {
        setState({ mode: CursorMode.Chat, previousMessage: null, message: "" });
      }
    }
  };

  const toggleHideCursor = () => {
    if (showCursor) setShowCursor(false);
    else setShowCursor(true);
  };

  useEffect(() => {
    const fetchEns = async () => {
      if (accountData?.address) {
        const ens = await getEnsName(accountData.address);
        const username = ens ? ens : centerEllipses(accountData.address, 7);
        setUsername(username);
        updateMyPresence({ username: username });
      }
    };

    fetchEns();
  }, [accountData?.address]);

  return (
    <>
      <Grid gridTemplateColumns={"10% 60% 20% 10%"} minH="calc(100vh - 48px)">
        <GridItem rowSpan={1} colSpan={2}></GridItem>
        <GridItem rowSpan={3} colSpan={1} border="2px" mt="10px">
          <Flex
            justifyContent="center"
            direction="column"
            bg="black"
            pb="10px"
            pt="10px"
          >
            <Box bg="black" margin="auto">
              <Text fontWeight={"bold"} fontSize="20px" color="white">
                The Chat Room!
              </Text>
            </Box>
          </Flex>
          <Switch
            colorScheme="purple"
            onChange={() => toggleHideCursor()}
            mt="10px"
            ml="10px"
          >
            Hide Chat Cursor
          </Switch>
          {showCursor ? (
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
                      <Flex direction="row">
                        <img src="cursor.svg" />
                        <Text>{username}</Text>
                      </Flex>
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
                        <textarea
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
                    username={presence.username}
                    address={accountData?.address}
                  />
                );
              })}
            </div>
          ) : (
            <div
              style={{
                height: "100%",
                width: "100%",
                cursor:
                  state.mode === CursorMode.Chat
                    ? "none"
                    : "url(cursor.svg) 0 0, auto",
              }}
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
                      <Flex direction="row">
                        <img src="cursor.svg" />
                        <Text>{username}</Text>
                      </Flex>
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
                        <textarea
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
                    username={presence.username}
                    address={accountData?.address}
                  />
                );
              })}
            </div>
          )}
        </GridItem>
        <GridItem rowSpan={3} colSpan={1}></GridItem>
        <GridItem rowSpan={2} colSpan={1}></GridItem>
        <GridItem rowSpan={1} colSpan={1} mb="20px" mr="20px">
          <Flex
            flexDirection="row"
            justifyContent="center"
            width="100%"
            height={{ base: "80%", sm: "300px", md: "400px", lg: "500px" }}
            mt="10px"
          >
            <iframe
              src="https://player.castr.com/live_4a9cb290032511edba7dd7a3002e508b"
              style={{ aspectRatio: "16/9" }}
              frameBorder="0"
              scrolling="no"
              allow="autoplay"
              allowFullScreen
            />
          </Flex>
        </GridItem>
        <GridItem rowSpan={1} colSpan={1} mr="20px">
          {loading ? (
            <Spinner />
          ) : (
            <Flex
              margin="auto"
              maxW={{ base: "100%", sm: "533px", md: "711px", lg: "889px" }}
              justifyContent="center"
              backgroundColor="rgba(0,0,0,0.2)"
            >
              <VideoSort videos={videos} sort={sortVideoAs} />
            </Flex>
          )}
        </GridItem>
      </Grid>
    </>
  );
};

export default function Page() {
  const roomId = "unlonely-demo";
  const { data, loading, error } = useQuery(VIDEO_LIST_QUERY, {
    variables: {
      data: {
        searchString: null,
        skip: null,
        limit: null,
        orderBy: null,
      },
    },
    pollInterval: 60000,
  });

  const videos = data?.getVideoFeed;

  return (
    <RoomProvider
      id={roomId}
      initialPresence={() => ({
        cursor: null,
        message: "",
      })}
    >
      <AppLayout error={error}>
        <Example videos={videos} loading={loading} />
      </AppLayout>
    </RoomProvider>
  );
}

export async function getStaticProps() {
  const API_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

  return { props: {} };
}
