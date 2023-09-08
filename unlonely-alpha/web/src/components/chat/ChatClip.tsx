import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Text,
  Input,
  Spinner,
  IconButton,
  Image,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import copy from "copy-to-clipboard";

import { PostNfcInput } from "../../generated/graphql";
import { useChannelContext } from "../../hooks/context/useChannel";
import { postNfcSchema } from "../../utils/validation/validation";

export const ChatClip = () => {
  const { chat } = useChannelContext();
  const { clipping } = chat;
  const {
    isClipUiOpen,
    handleIsClipUiOpen,
    submitClip,
    setClipError,
    clipError,
    clipUrl,
    loading,
  } = clipping;

  const form = useForm<PostNfcInput>({
    defaultValues: {},
    resolver: yupResolver(postNfcSchema),
  });
  const { register, formState, handleSubmit, watch } = form;

  const _submitClip = async (data: { title: string }) => {
    const url = await submitClip(data.title);
    if (url) setFinalUrl(url);
  };

  const [title, setTitle] = useState<string>("");
  const [finalUrl, setFinalUrl] = useState<string>("");

  const share = async () => {
    if (navigator.share && finalUrl) {
      navigator
        .share({
          title,
          url: finalUrl,
        })
        .then(() => {
          console.log("Thanks for sharing!");
        })
        .catch(console.error);
    } else {
      // Fallback for browsers that do not support the Web Share API
      console.log("Your browser does not support the Web Share API.");
    }
  };

  return (
    <>
      {isClipUiOpen && (
        <Flex
          position="absolute"
          left="0"
          bottom="15px"
          width={"100%"}
          zIndex={3}
          style={{
            border: "1px solid",
            borderWidth: "1px",
            borderImageSource:
              "repeating-linear-gradient(#E2F979 0%, #B0E5CF 34.37%, #BA98D7 66.67%, #D16FCE 100%)",
            borderImageSlice: 1,
          }}
        >
          <Flex
            direction="column"
            bg={"#272758"}
            width={"100%"}
            position="relative"
            p="15px"
            gap="5px"
          >
            {loading ? (
              <>
                <Text textAlign="center">
                  Clipping, please stay here and wait!
                </Text>
                <Flex justifyContent={"center"}>
                  <Spinner size="lg" />
                </Flex>
              </>
            ) : finalUrl ? (
              <>
                <Text textAlign="center" color="#d0ff00">
                  Clipping finished!
                </Text>
                <Button
                  width="100%"
                  bg="#0ca2b6"
                  onClick={share}
                  _focus={{}}
                  _hover={{ background: "#02c2db" }}
                >
                  share link
                </Button>
                <Button
                  width="100%"
                  bg="#0ca2b6"
                  onClick={() => copy(finalUrl)}
                  _focus={{}}
                  _hover={{ background: "#02db4a" }}
                >
                  copy link
                </Button>
                <Button
                  opacity={"0.5"}
                  border={"1px solid white"}
                  bg={"transparent"}
                  width="100%"
                  onClick={() => {
                    handleIsClipUiOpen(false);
                    setFinalUrl("");
                    setTitle("");
                  }}
                  _focus={{}}
                  _hover={{ opacity: "1" }}
                  _active={{}}
                >
                  close
                </Button>
              </>
            ) : clipUrl ? (
              <>
                <Flex justifyContent={"center"}>
                  <Flex justifyContent={"flex-end"}>
                    <IconButton
                      aria-label="close"
                      _hover={{}}
                      _active={{}}
                      _focus={{}}
                      bg="transparent"
                      icon={
                        <Image alt="close" src="/svg/close.svg" width="15px" />
                      }
                      onClick={() => {
                        handleIsClipUiOpen(false);
                        setFinalUrl("");
                        setTitle("");
                      }}
                      position="absolute"
                      right="-14px"
                      top="-10px"
                    />
                  </Flex>
                  <video controls loop preload="metadata">
                    <source src={clipUrl} type="video/mp4"></source>
                  </video>
                </Flex>
                <form onSubmit={handleSubmit(_submitClip)}>
                  <FormControl
                    isInvalid={!!formState.errors.title}
                    marginBottom={["20px", "20px"]}
                  >
                    <Input
                      id="title"
                      placeholder="title your clip!"
                      lineHeight="1.5"
                      variant="glow"
                      color={"white"}
                      borderRadius="10px"
                      minHeight="2rem"
                      fontWeight="medium"
                      w="100%"
                      padding="auto"
                      {...register("title")}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <FormErrorMessage>
                      {formState.errors.title?.message}
                    </FormErrorMessage>
                  </FormControl>
                  <Flex width="100%" justifyContent={"center"}>
                    <Button
                      bg="#2262d8"
                      py={6}
                      _hover={{ transform: "scale(1.05)" }}
                      _active={{
                        transform: "scale(1)",
                        background: "green",
                      }}
                      borderRadius="10px"
                      _focus={{}}
                      width="100%"
                      type="submit"
                      loadingText="uploading..."
                      disabled={title.length === 0}
                    >
                      <Text fontSize="20px">upload</Text>
                    </Button>
                  </Flex>
                </form>
              </>
            ) : clipError ? (
              <>
                <Text textAlign={"center"} color="#fa8a29">
                  clipping couldn't finish, please try again later
                </Text>
                <Flex gap="10px">
                  <Button
                    width="100%"
                    bg="#b82929"
                    onClick={() => copy(clipError)}
                    _focus={{}}
                    _hover={{ background: "#f25719" }}
                  >
                    copy error
                  </Button>
                  <Button
                    opacity={"0.5"}
                    border={"1px solid white"}
                    bg={"transparent"}
                    width="100%"
                    onClick={() => {
                      setClipError("");
                      handleIsClipUiOpen(false);
                    }}
                    _focus={{}}
                    _hover={{ opacity: "1" }}
                    _active={{}}
                  >
                    close
                  </Button>
                </Flex>
              </>
            ) : (
              <></>
            )}
          </Flex>
        </Flex>
      )}
    </>
  );
};
