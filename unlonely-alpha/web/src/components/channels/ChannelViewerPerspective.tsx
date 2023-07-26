import { Flex, Text, Box, Stack } from "@chakra-ui/react";

import { useChannelContext } from "../../hooks/context/useChannel";
import StreamComponent from "../stream/StreamComponent";

const ChannelViewerPerspective = () => {
  const { recentStreamInteractions } = useChannelContext();

  const { textOverVideo } = recentStreamInteractions;

  return (
    <Stack direction="column" width={"100%"}>
      <Flex width={"100%"} position="relative">
        <Box
          position="absolute"
          zIndex={10}
          maxHeight={{
            base: "100%",
            sm: "700px",
            md: "700px",
            lg: "700px",
          }}
          overflow="hidden"
        >
          {textOverVideo.map((data: string, index: number) => (
            <Flex bg="rgba(0,0,0,0.8)">
              <Text fontSize="24px" key={index}>
                {data}
              </Text>
            </Flex>
          ))}
        </Box>
        <StreamComponent isTheatreMode />
      </Flex>
    </Stack>
  );
};

export default ChannelViewerPerspective;
