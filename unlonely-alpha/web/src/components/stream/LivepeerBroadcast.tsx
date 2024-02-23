import { Broadcast } from "@livepeer/react";
import { memo } from "react";
import { Flex } from "@chakra-ui/react";

const LivepeerBroadcast = memo(({ streamKey }: { streamKey: string }) => {
  return (
    <Flex direction="column" width="100%" position="relative">
      <Broadcast
        streamKey={streamKey}
        controls={{
          autohide: 3000,
        }}
        theme={{
          radii: { containerBorderRadius: "10px" },
        }}
      />
    </Flex>
  );
});

export default LivepeerBroadcast;
