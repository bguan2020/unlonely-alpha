import {
  Text,
  Flex,
  Image,
  useToast,
  IconButton,
  Button,
} from "@chakra-ui/react";

import { NfcDetailQuery } from "../../generated/graphql";
import centerEllipses from "../../utils/centerEllipses";
import copy from "copy-to-clipboard";

const NfcDetailCard = ({ nfc }: { nfc?: NfcDetailQuery["getNFC"] }) => {
  const toast = useToast();

  const handleCopy = () => {
    toast({
      title: "copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <>
      <Flex
        direction="column"
        w={{ base: "100%", md: "60%", lg: "60%", sm: "100%" }}
        padding="0.3rem"
        borderRadius="1rem"
        minW={{ base: "16rem", sm: "25rem", md: "25rem", lg: "25rem" }}
        mb="1.5rem"
        mt="8px"
        mr="1rem"
        gap={"10px"}
      >
        {nfc && nfc?.videoLink ? (
          <>
            <video
              src={nfc?.videoLink.concat("#t=0.1")}
              style={{
                height: "500px",
              }}
              controls
            />
            <Flex justifyContent={"space-between"}>
              <Text fontSize="20px" textAlign="left">
                {nfc?.title ?? "title"}
              </Text>
              {nfc?.zoraLink && (
                <Button
                  onClick={() => window.open(String(nfc?.zoraLink), "_blank")}
                  px="10px"
                  gap="5px"
                  _hover={{
                    transform: "scale(1.1)",
                  }}
                >
                  <Image
                    src="/images/zora-logo-100x100.png"
                    width="1.5rem"
                    height="1.5rem"
                  />
                  Mint on Zora
                </Button>
              )}
            </Flex>
            <Flex>
              <Text fontSize="15px" textAlign="center">
                owned by{" "}
                {nfc?.owner?.username ??
                  centerEllipses(nfc?.owner?.address, 13)}
              </Text>
            </Flex>
            {nfc?.videoLink && (
              <Flex direction={"column"} mt="20px">
                <Text>share now:</Text>
                <Flex justifyContent={"flex-start"} gap="5px">
                  <IconButton
                    aria-label="copy-clip-link"
                    color="white"
                    icon={
                      <Image
                        src="/images/copy-350x350.png"
                        height="28px"
                        style={{
                          filter: "grayscale(100%)",
                        }}
                      />
                    }
                    bg="transparent"
                    _focus={{}}
                    _active={{}}
                    _hover={{}}
                    onClick={() => {
                      copy(`${window.origin}/nfc/${nfc?.id}`);
                      handleCopy();
                    }}
                  />
                  <IconButton
                    aria-label="tweet-clip-link"
                    color="white"
                    icon={
                      <Image src="/images/twitter-350x350.png" height="28px" />
                    }
                    bg="transparent"
                    _focus={{}}
                    _active={{}}
                    _hover={{}}
                    onClick={() => {
                      window.open(
                        `https://x.com/intent/tweet?text=${encodeURIComponent(
                          `Check this out: ${window.origin}/nfc/${nfc?.id}`
                        )}`,
                        "_blank"
                      );
                    }}
                  />
                  <IconButton
                    aria-label="warpcast-clip-link"
                    color="white"
                    icon={
                      <Image src="/images/warpcast-350x350.png" height="28px" />
                    }
                    bg="transparent"
                    _focus={{}}
                    _active={{}}
                    _hover={{}}
                    onClick={() => {
                      window.open(
                        `https://warpcast.com/~/compose?text=new%20unlonely%20clip%20just%20dropped!&embeds[]=${window.origin}/nfc/${nfc?.id}`,
                        "_blank"
                      );
                    }}
                  />
                  <IconButton
                    aria-label="hey-clip-link"
                    color="white"
                    icon={
                      <Image src="/images/lens-350x350.png" height="28px" />
                    }
                    bg="transparent"
                    _focus={{}}
                    _active={{}}
                    _hover={{}}
                    onClick={() => {
                      window.open(
                        `https://hey.xyz/?text=new%20unlonely%20clip%20just%20dropped!&url=${window.origin}/nfc/${nfc?.id}`,
                        "_blank"
                      );
                    }}
                  />
                </Flex>
              </Flex>
            )}
          </>
        ) : (
          <Flex justifyContent={"center"}>
            <Text fontSize={32} fontFamily="LoRes15">
              clip data could not be fetched
            </Text>
          </Flex>
        )}
      </Flex>
    </>
  );
};

export default NfcDetailCard;
