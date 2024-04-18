import React from "react";
import { Button, Link, Text, Flex, Image } from "@chakra-ui/react";

interface Props {
  closePrompt: () => void;
}

export default function AddToOtherBrowser(props: Props) {
  const { closePrompt } = props;
  const searchUrl =
    "https://www.google.com/search?q=add+to+home+screen+for+common-mobile-browsers";

  return (
    <>
      <Flex direction="column" alignItems={"center"} margin="10px">
        <Image src="/icons/icon-192x192.png" h="80px" mb="10px" />
        <Text color="black" fontFamily="LoRes15" fontSize="25px" mb="10px">
          add to home screen
        </Text>
        <Text textAlign={"center"} color="black" fontSize="15px" mb={"10px"}>
          Unfortunately, we were unable to determine which browser you are
          using. Please search for how to install a web app for your browser.
        </Text>
        <Link href={searchUrl} target="_blank">
          <Button
            color="white"
            bg="#05b95f"
            _hover={{}}
            _focus={{}}
            _active={{}}
            width="100%"
            borderRadius="25px"
          >
            Try this link
          </Button>
        </Link>
      </Flex>
      <Button
        color="white"
        bg="#E09025"
        _hover={{}}
        _focus={{}}
        _active={{}}
        onClick={closePrompt}
        width="100%"
      >
        close
      </Button>
    </>
  );
}
