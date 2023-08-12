import { Box, Text } from "@chakra-ui/react";

import { Channel } from "../../generated/graphql";

export const SelectableChannel = ({ channel }: { channel: Channel }) => {
  return (
    <Box>
      <Text>{channel.name}</Text>
    </Box>
  );
};
