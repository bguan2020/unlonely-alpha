import { RoomProvider, useMyPresence, useOthers } from "@liveblocks/react";
import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { Text, Flex, Spacer } from "@chakra-ui/react";

import Cursor from "../components/Cursor";
import FlyingReaction from "../components/FlyingReaction";
import ReactionSelector from "../components/ReactionSelector";
import Comment from "../components/Comment";
import Player from "../components/Player";
import { COLORS, fasterComments } from "../components/dummyData";

type Presence = {
  cursor: {
    x: number;
    y: number;
  } | null;
  message: string;
};

export enum CursorMode {
  Hidden,
  Chat,
  ReactionSelector,
  Reaction,
}

type CursorState =
  | {
      mode: CursorMode.Hidden;
    }
  | {
      mode: CursorMode.Chat;
      message: string;
      previousMessage: string | null;
    }
  | {
      mode: CursorMode.ReactionSelector;
    }
  | {
      mode: CursorMode.Reaction;
      reaction: string;
      isPressed: boolean;
    };

type Comment = {
  id: number;
  value: string;
  commentTimestamp: number;
  point: { x: number; y: number };
  color: string;
  username: string;
  likes: string;
};

type Reaction = {
  value: string;
  timestamp: number;
  point: { x: number; y: number };
};

type ReactionEvent = {
  x: number;
  y: number;
  value: string;
};

const color = COLORS[Math.floor(Math.random() * COLORS.length)];
const videoId = "Zl_dTUsrU9s";

function Example() {
  const others = useOthers<Presence>(); // has to do with liveblocks connection
  const [{ cursor }, updateMyPresence] = useMyPresence<Presence>(); // has to do with liveblocks connection
  // const broadcast = useBroadcastEvent();
  const [state, setState] = useState<CursorState>({ mode: CursorMode.Hidden });
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [comments, setComments] = useState<Comment[]>(fasterComments);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);

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
    // useSetComment hook
    setComments((comments) =>
      comments.concat([
        {
          id: 10,
          point: { x: cursor.x, y: cursor.y },
          value: message,
          commentTimestamp: currentTimestamp,
          color: color,
          username: "brian",
          likes: "+1",
        },
      ])
    );
  };

  return (
    <>
      <div
        className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black"
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
          <Player
            videoId={videoId}
            setState={setState}
            updateMyPresence={updateMyPresence}
            setCurrentTimestamp={setCurrentTimestamp}
          />
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
        {comments.map((comment) => {
          return (
            <Comment
              key={comment.id}
              x={comment.point.x}
              y={comment.point.y}
              commentTimestamp={comment.commentTimestamp}
              currentTimestamp={currentTimestamp}
              value={comment.value}
              username={comment.username}
              likes={comment.likes}
              color={comment.color ? comment.color : color}
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
                <Text noOfLines={3} fontSize="sm" color="white">
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
  const roomId = useOverrideRoomId("nextjs-live-cursors-chat");

  return (
    <RoomProvider
      id={roomId}
      initialPresence={() => ({
        cursor: null,
        message: "",
      })}
    >
      <Flex height="50px" width="100%" bg="black"></Flex>
      {/* <Flex height="30px" width="100%" bg="black" paddingLeft="20px" paddingRight="20px">
          <Text color="white" fontWeight="semibold">
            Top Comments
          </Text>
          <Spacer />
          <Text color="white" fontWeight="semibold">
            Recent Comments
          </Text>
        </Flex> */}
      <Flex>
        <div className="fixed inset-0 flex justify-center items-center select-none"></div>
        <Example />
      </Flex>
    </RoomProvider>
  );
}

export async function getStaticProps() {
  const API_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;
  const API_KEY_WARNING = process.env.CODESANDBOX_SSE
    ? `Add your public key from https://liveblocks.io/dashboard/apikeys as the \`NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY\` secret in CodeSandbox.\n` +
      `Learn more: https://github.com/liveblocks/liveblocks/tree/main/examples/nextjs-live-cursors-chat#codesandbox.`
    : `Create an \`.env.local\` file and add your public key from https://liveblocks.io/dashboard/apikeys as the \`NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY\` environment variable.\n` +
      `Learn more: https://github.com/liveblocks/liveblocks/tree/main/examples/nextjs-live-cursors-chat#getting-started.`;

  if (!API_KEY) {
    console.warn(API_KEY_WARNING);
  }

  return { props: {} };
}

/**
 * This function is used when deploying an example on liveblocks.io.
 * You can ignore it completely if you run the example locally.
 */
function useOverrideRoomId(roomId: string) {
  const { query } = useRouter();
  const overrideRoomId = useMemo(() => {
    return query?.roomId ? `${roomId}-${query.roomId}` : roomId;
  }, [query, roomId]);

  return overrideRoomId;
}
