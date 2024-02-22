import { Broadcast } from "@livepeer/react";
import { memo } from "react";

const LivepeerBroadcast = memo(({ streamKey }: { streamKey: string }) => {
  return (
    <Broadcast
      streamKey={streamKey}
      controls={{
        autohide: 3000,
      }}
      theme={{
        radii: { containerBorderRadius: "10px" },
      }}
    />
  );
});

export default LivepeerBroadcast;
