import { useRef } from "react";
import { Text, Flex, Box, Button, Image, SimpleGrid } from "@chakra-ui/react";

import AppLayout from "../components/layout/AppLayout";
import { comments } from "../components/chat/HomePageChat";
import useInterval from "../hooks/useInterval";

export default function Page() {
  const autoScroll = useRef(true);

  useInterval(async () => {
    if (autoScroll.current) {
      const chat = document.getElementById("chat");
      if (chat) {
        chat.scrollTop = chat.scrollHeight;
      }
    }
  }, 1000);

  const messages = comments.map((comment, index) => {
    return (
      <div
        key={index}
        className={`chat__message chat__message_${comment.a ? "B" : "A"}`}
        style={{ animationDelay: `${comment.delay}` }}
      >
        <Flex direction="column">
          <Flex direction="row" ml="10px">
            {comment.isFCUser && (
              <Image
                src="https://searchcaster.xyz/img/logo.png"
                width="20px"
                height="20px"
                mr="5px"
              />
            )}
            <Text>{comment.username}</Text>
          </Flex>
          <div
            className="chat__content"
            style={{ backgroundColor: `${comment.color}` }}
          >
            <Box
              borderRadius="10px"
              bg={comment.color}
              pr="10px"
              pl="10px"
              mb="10px"
            >
              <Text color="white" fontSize={18} wordBreak="break-word">
                {comment.text}
              </Text>
            </Box>
          </div>
        </Flex>
      </div>
    );
  });

  return (
    <AppLayout>
      <Flex justifyContent="center">
        <Flex
          marginTop={{ base: "40px", md: "60px", lg: "100px" }}
          maxW="80%"
          flexDirection="column"
        >
          <Text
            color="black"
            fontSize={{ base: "40px", md: "60px", lg: "80px" }}
            lineHeight={{ base: "40px", md: "60px", lg: "80px" }}
            fontWeight="bold"
            textAlign="center"
          >
            Never watch alone again. Come be{" "}
            <Text as="span" color="white">
              unlonely
            </Text>{" "}
            with us.
          </Text>
          <Flex w="100%" justifyContent="center" mt="40px">
            <SimpleGrid columns={[1]} spacing="40px">
              <Box
                w={{ base: "300px", md: "350px", lg: "400px" }}
                // bgGradient="linear(to-r, #C02300, #964242, #501C1C, black)"
                bgGradient="linear(to-r, #d16fce, #7655D2, #4173D6, #4ABBDF)"
                borderRadius="20px"
                mb="10px"
                m="auto"
              >
                {/* <Flex width="100%" justifyContent="center" mt="20px">
                  <Image src="/images/YT_logo.png" width="175px" />
                </Flex> */}
                {/* <Text
                  fontSize="20px"
                  margin="20px"
                  lineHeight="25px"
                  fontWeight="bold"
                  textAlign={"center"}
                  color="white"
                >
                  Watch YouTube with us!
                </Text> */}
                <Flex w="100%" justifyContent="center">
                  <Button
                    variantColor="white"
                    variant="outline"
                    size="lg"
                    minW="50%"
                    h="50px"
                    borderRadius="20px"
                    mt="40px"
                    mb="40px"
                    pr="10px"
                    pl="10px"
                    color="white"
                    _hover={{ bg: "white", color: "black" }}
                    onClick={() => {
                      window.location.href = "/channels/youtube";
                    }}
                  >
                    Join Our Daily Streams
                  </Button>
                </Flex>
              </Box>
              <Box
                m="auto"
                borderRadius="20px"
                w="75%"
                maxH="300px"
                mb="40px"
                overflow="hidden"
                id="chat"
              >
                {messages}
                {autoScroll.current && <Box />}
              </Box>
            </SimpleGrid>
            {/* <Box
                w={{ base: "300px", md: "350px", lg: "400px" }}
                bgGradient="linear(to-r, #d16fce, #7655D2, #4173D6, #4ABBDF)"
                borderRadius="20px"
                mb="10px"
              >
                <Flex width="100%" justifyContent="center" mt="20px">
                  <Image src="/images/TikTok_logo.png" width="250px" />
                </Flex>
                <Text
                  fontSize="20px"
                  margin="20px"
                  lineHeight="25px"
                  fontWeight="bold"
                  textAlign={"center"}
                  color="white"
                >
                  Watch TikToks with us!
                </Text>
                <Flex w="100%" justifyContent="center">
                  <TikTokModal />
                </Flex>
              </Box>
            </SimpleGrid> */}
          </Flex>
        </Flex>
      </Flex>
    </AppLayout>
  );
}

export async function getStaticProps() {
  const API_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

  return { props: {} };
}
