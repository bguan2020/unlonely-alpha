import {
  Flex,
  Text,
  Box,
  Button,
} from "@chakra-ui/react";

import NFTModalRoot from "../profile/NFTModal/NFTModalRoot";
import NFTModalFooter from "../profile/NFTModal/NFTModalFooter";

const TikTokModal: React.FunctionComponent = () => {
  return (
    <>
      <NFTModalRoot TriggerButton={
        <Button
          variantcolor="white"
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
        >
          Join
        </Button>}>
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
            >
              Follow @unlonely.app on TikTok and send tiktoks to that account to watch and rate together on unlonely!
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
                  window.open("https://www.tiktok.com/@unlonely.app?lang=en");
                }}
              >
                Follow on Tik Tok
              </Button>
            </Flex>
          </Box>
        </Flex>
        <NFTModalFooter />
      </NFTModalRoot>
    </>
  );
};

export default TikTokModal;
