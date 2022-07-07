import { RoomProvider, useMyPresence, useOthers } from "@liveblocks/react";
import { gql, useQuery } from "@apollo/client";
import React, { useState, useCallback } from "react";
import { Text, Flex } from "@chakra-ui/react";

import Cursor from "../components/Cursor";
import FlyingReaction from "../components/FlyingReaction";
import ReactionSelector from "../components/ReactionSelector";
import Comment from "../components/Comment";
import Player from "../components/Player";
import { COLORS } from "../components/dummyData";
import styles from "../components/FlyingReaction.module.css";
import Header from "../components/navigation/Header";
import usePostComment from "../hooks/usePostComment";
import { VideoDetailQuery } from "../generated/graphql";
import { Presence, CursorMode, CursorState, Reaction } from "../types/cursor";

const videoId = 1;

const VIDEO_DETAIL_QUERY = gql`
  query VideoDetail($id: ID!) {
    getVideo(id: $id) {
      id
      youtubeId
      comments {
        id
        ...Comment_comment
      }
    }
  }
  ${Comment.fragments.comment}
`;

function Example() {
  const others = useOthers<Presence>();
  const [{ cursor }, updateMyPresence] = useMyPresence<Presence>();
  const { postComment } = usePostComment({
    videoId: videoId,
  });
  const [state, setState] = useState<CursorState>({ mode: CursorMode.Hidden });
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);

  const { data, loading, error } = useQuery<VideoDetailQuery>(
    VIDEO_DETAIL_QUERY,
    {
      variables: {
        id: videoId,
      },
    }
  );

  const youtubeId = data?.getVideo?.youtubeId;
  const comments = data?.getVideo?.comments;

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

  const comment = (message: any, cursor: any) => {
    const result = postComment({
      text: message,
      videoId,
      videoTimestamp: currentTimestamp,
      location_x: cursor.x,
      location_y: cursor.y,
    });
  };

  return (
    <>
      <div
        className={
          `relative h-screen w-full flex items-center justify-center overflow-hidden ` +
          styles["bgimg"]
        }
        style={{
          cursor:
            state.mode === CursorMode.Chat
              ? "none"
              : "url(cursor.svg) 0 0, auto",
        }}
        onPointerMove={(event) => {
          if (cursor == null || state.mode !== CursorMode.ReactionSelector) {
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
        <Flex flexDirection="column">
          {youtubeId && (
            <Player
              videoId={youtubeId}
              setState={setState}
              updateMyPresence={updateMyPresence}
              setCurrentTimestamp={setCurrentTimestamp}
            />
          )}
        </Flex>
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
        {comments &&
          comments.map((comment: any) => {
            return (
              <Comment
                key={comment.id}
                x={comment.location_x}
                y={comment.location_y}
                commentTimestamp={comment.videoTimestamp}
                currentTimestamp={currentTimestamp}
                text={comment.text}
                username={comment.owner.username}
                score={comment.score}
                color={comment.color}
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
                <Text noOfLines={3} fontSize="sm" color="black">
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
                  {state.previousMessage && <div>{state.previousMessage}</div>}
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        comment(state.message, cursor);
                      }
                    }}
                    placeholder={state.previousMessage ? "" : "Say something…"}
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
      <Header />
      <Flex>
        <div className="fixed inset-0 flex justify-center items-center select-none"></div>
        <Example />
      </Flex>
    </RoomProvider>
  );
}

export async function getStaticProps() {
  const API_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

  return { props: {} };
}
