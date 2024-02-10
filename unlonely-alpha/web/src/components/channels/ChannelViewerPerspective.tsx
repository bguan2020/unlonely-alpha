import { Flex, Stack } from "@chakra-ui/react";

import StreamComponent from "../stream/StreamComponent";
import { useCacheContext } from "../../hooks/context/useCache";
import { useEffect, useState } from "react";
import { Text } from "@chakra-ui/react";

const ChannelViewerPerspective = ({ mobile }: { mobile?: boolean }) => {
  const { isFocusedOnInput } = useCacheContext();

  const initialViewportHeight = window.innerHeight;
  const [num, setNum] = useState(initialViewportHeight);

  useEffect(() => {
    if (isFocusedOnInput) {
      setNum(initialViewportHeight - window.innerHeight);
    } else {
      setNum(initialViewportHeight);
    }
  }, [isFocusedOnInput]);

  return (
    <Stack
      direction="column"
      width={"100%"}
      position={mobile ? "fixed" : "unset"}
      zIndex={5}
    >
      <Flex width={"100%"} position="relative">
        <StreamComponent />
      </Flex>
      <Text>temp: {num}</Text>
    </Stack>
  );
};

export default ChannelViewerPerspective;
