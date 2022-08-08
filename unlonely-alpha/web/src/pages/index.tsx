import { Text, Flex, Box, Button, SimpleGrid, Image } from "@chakra-ui/react";
import AppLayout from "../components/layout/AppLayout";
import TikTokModal from "../components/video/TikTokModal";

export default function Page() {
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
          <Flex w="100%" justifyContent="center" mt="20px">
            <Text color="black" fontSize={26} lineHeight="26px">
              7-8pm PST / 10-11pm EST Daily
            </Text>
          </Flex>
          <Flex w="100%" justifyContent="center" mt="40px">
            <SimpleGrid columns={[1, null, 2]} spacing="40px">
              <Box
                w={{ base: "300px", md: "350px", lg: "400px" }}
                bgGradient="linear(to-r, #C02300, #964242, #501C1C, black)"
                borderRadius="20px"
                mb="10px"
              >
                <Flex width="100%" justifyContent="center" mt="20px">
                  <Image src="/images/YT_logo.png" width="175px" />
                </Flex>
                <Text
                  fontSize="20px"
                  margin="20px"
                  lineHeight="25px"
                  fontWeight="bold"
                  textAlign={"center"}
                  color="white"
                >
                  Watch YouTube with us!
                </Text>
                <Flex w="100%" justifyContent="center">
                  <Button
                    variantColor="white"
                    variant="outline"
                    size="lg"
                    w="50%"
                    h="50px"
                    borderRadius="20px"
                    mt="20px"
                    mb="40px"
                    pr="10px"
                    pl="10px"
                    color="white"
                    _hover={{ bg: "white", color: "black" }}
                    onClick={() => {
                      window.location.href = "/channels/youtube";
                    }}
                  >
                    Join
                  </Button>
                </Flex>
              </Box>
              <Box
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
            </SimpleGrid>
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
