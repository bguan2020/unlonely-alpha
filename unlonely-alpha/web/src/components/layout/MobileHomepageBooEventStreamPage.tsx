import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/layout";
import { Image } from "@chakra-ui/image";
import LivepeerPlayer from "../stream/LivepeerPlayer";
import { getSrc } from "@livepeer/react/external";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useLivepeerStreamData } from "../../hooks/internal/useLivepeerStreamData";

const buttonOptionNames = ["water", "flashlight", "ghost"];

export const MobileHomePageBooEventStreamPage = () => {
  const { channel } = useChannelContext();
  const { channelQueryData } = channel;

  const { playbackInfo } = useLivepeerStreamData({
    livepeerPlaybackId: channelQueryData?.livepeerPlaybackId ?? undefined,
    livepeerStreamId: channelQueryData?.livepeerStreamId ?? undefined,
  });

  return (
    <Flex direction="column" h="100vh">
      {playbackInfo && (
        <Box width={"100%"} height={"35vh"} transition="all 0.3s">
          <LivepeerPlayer src={getSrc(playbackInfo)} cannotOpenClipDrawer />
        </Box>
      )}
      <Flex flexWrap={"wrap"} justifyContent={"space-evenly"} height={"65vh"}>
        <Flex
          direction="column"
          justifyContent={"center"}
          alignContent={"center"}
          gap="20px"
        >
          <SimpleGrid columns={2} spacing={10} mx="auto">
            {buttonOptionNames.map((name) => (
              <Box
                width="100px"
                height="100px"
                bg="#FF7B00"
                borderRadius="100%"
                key={name}
                onClick={() => {
                  console.log("clicked");
                }}
                _hover={{
                  cursor: "pointer",
                  transform: "scale(1.1)",
                  transition: "transform 0.2s",
                }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="5px 5px 10px green"
              >
                <Image
                  src={`/images/packages/${name}.png`}
                  height="50px"
                  alt={name}
                />
              </Box>
            ))}
          </SimpleGrid>
          <Flex justifyContent={"center"}>
            <Text textAlign="center" width="190px">
              Join on desktop for the full experience
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
