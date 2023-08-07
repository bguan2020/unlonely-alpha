import { Box, Flex, Image, Text } from "@chakra-ui/react";

export const PreviewNotification = ({
  selectedType,
  titleLive,
  titleNFCs,
  bodyLive,
  bodyNFCs,
}: {
  selectedType: string;
  titleLive: string;
  titleNFCs: string;
  bodyLive: string;
  bodyNFCs: string;
}) => (
  <Box
    backdropBlur={"6px"}
    backgroundColor="rgba(0,0,0,0.8)"
    padding="16px"
    borderRadius={"26px"}
  >
    <Flex alignItems={"center"}>
      <Image
        src="https://imgur.com/RiQqM30.png"
        w="40px"
        borderRadius={"10px"}
      />
      <Box pl={3} w="100%">
        <Flex justifyContent={"space-between"} w="100%">
          <Text
            fontSize="md"
            color="gray.500"
            fontWeight={"bold"}
            fontFamily="system-ui"
            lineHeight={1.2}
            noOfLines={1}
          >
            {selectedType === "live" ? titleLive : titleNFCs}
          </Text>
          <Text
            fontSize="md"
            color="gray.700"
            fontFamily="system-ui"
            lineHeight={1.2}
            textAlign={"right"}
            pl="30px"
          >
            now
          </Text>
        </Flex>
        <Text
          fontSize="md"
          color="gray.500"
          fontFamily="system-ui"
          lineHeight={1.2}
          noOfLines={4}
          pt={"2px"}
          pr={
            bodyLive.length > 75
              ? "56px"
              : "0px" || bodyNFCs.length > 75
              ? "56px"
              : "0px"
          }
        >
          {selectedType === "live" ? bodyLive : bodyNFCs}
        </Text>
      </Box>
    </Flex>
  </Box>
);
