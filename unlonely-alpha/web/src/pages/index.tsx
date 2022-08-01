import {
  Text,
  Flex,
  Box,
  Button,
} from "@chakra-ui/react";
import AppLayout from "../components/layout/AppLayout";

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
            <Box
              w={{ base: "300px", md: "400px", lg: "400px" }}
              bgGradient="linear(to-r, #d16fce, #7655D2, #4173D6, #4ABBDF)"
              borderRadius="20px"
              mb="50px"
            >
              <Text
                fontSize="20px"
                margin="20px"
                lineHeight="25px"
                fontWeight="bold"
                textAlign={"center"}
                color="white"
              >
                Watch with us! Come be unlonely.
              </Text>
              {/* center button that says join community*/}
              <Flex
              w="100%"
              justifyContent="center">
                <Button
                  variantColor="white"
                  variant="outline"
                  size="lg"
                  w="50%"
                  h="50px"
                  borderRadius="20px"
                  mt="20px"
                  mb="40px"
                  color="white"
                  _hover={{ bg: "white", color: "black" }}
                  onClick={() => {  window.location.href = "/channels/1"; }}
                >
                  Join Community!
                </Button>
              </Flex>
            </Box>
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
