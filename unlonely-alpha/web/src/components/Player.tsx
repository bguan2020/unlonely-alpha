import React, { createRef } from "react";
import { useEffect } from "react";
import YouTube from "react-youtube";
import useInterval from "../hooks/useInterval";
import { CursorMode } from "../pages";

type Props = {
  videoId: string;
  setState: React.Dispatch<React.SetStateAction<any>>;
  updateMyPresence: any;
  setCurrentTimestamp: React.Dispatch<React.SetStateAction<number>>;
};

const Player = ({
  videoId,
  setState,
  updateMyPresence,
  setCurrentTimestamp,
}: Props) => {
  let player = createRef<any>();
  const options = {
    width: "750px",
    height: "475px",
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      showinfo: 0,
      mute: 1,
      loop: 1,
    },
  };

  useInterval(async () => {
    async function getCurrentTime() {
      if (player.current)
        return await player.current.internalPlayer.getCurrentTime();
    }

    setCurrentTimestamp(await getCurrentTime());
  }, 500);

  return (
    <div
      onPointerMove={() => {
        setState({
          mode: CursorMode.Hidden,
        });
        updateMyPresence({
          cursor: null,
        });
      }}
    >
      <YouTube videoId={videoId} opts={options} ref={player} />
    </div>
  );
};

export default Player;
