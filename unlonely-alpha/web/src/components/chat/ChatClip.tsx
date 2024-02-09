import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Text,
  Input,
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
import { InteractionType } from "../../constants";
import centerEllipses from "../../utils/centerEllipses";
import { useUser } from "../../hooks/context/useUser";
import useUserAgent from "../../hooks/internal/useUserAgent";

export const ChatClip = () => {
  const { user, userAddress } = useUser();
  const { isStandalone } = useUserAgent()
  const { chat } = useChannelContext();
  const { clipping, addToChatbot } = chat;
  const {
    isClipUiOpen,
    handleIsClipUiOpen,
    handleCreateClip,
    setClipError,
    clipError,
    clipUrl,
  } = clipping;

  const form = useForm<PostNfcInput>({
    defaultValues: {},
    resolver: yupResolver(postNfcSchema),
  });
  const { register, formState, handleSubmit } = form;

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

  const _submitClip = async (data: { title: string }) => {
    const url = await handleCreateClip(data.title);
    setTitle("");
    addToChatbot({
      username: user?.username ?? "",
      address: user?.address ?? "",
      taskType: InteractionType.CLIP,
      title: `${
        user?.username ?? centerEllipses(userAddress, 15)
      } has just clipped a highlight from this stream!`,
      description: "",
    });
    if (url) setFinalUrl(url);
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
            {finalUrl ? (
              <>
                <Text textAlign="center" color="#d0ff00">
                  Clipping finished!
                </Text>
                <video controls loop preload="metadata">
                  <source src={clipUrl} type="video/mp4"></source>
                </video>
                <Button
                  color="white"
                  width="100%"
                  bg="#0ca2b6"
                  onClick={share}
                  _focus={{}}
                  _hover={{ background: "#02c2db" }}
                >
                  share link
                </Button>
                <Button
                  color="white"
                  width="100%"
                  bg="#0ab643"
                  onClick={() => copy(finalUrl)}
                  _focus={{}}
                  _hover={{ background: "#08c346" }}
                >
                  copy link
                </Button>
                <Button
                  color="white"
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
            ) : clipError ? (
              <>
                <Text textAlign={"center"} color="#fa8a29">
                  clipping couldn't finish, please try again later
                </Text>
                <Flex gap="10px">
                  <Button
                    color="white"
                    width="100%"
                    bg="#b82929"
                    onClick={() => copy(clipError)}
                    _focus={{}}
                    _hover={{ background: "#f25719" }}
                  >
                    copy error
                  </Button>
                  <Button
                    color="white"
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
                </Flex>
                <form onSubmit={handleSubmit(_submitClip)}>
                  <Text
                    textAlign="center"
                    fontSize="16px"
                    mb="10px"
                    color="#d0ff00"
                  >
                    create a 30-second highlight from this stream!
                  </Text>
                  <FormControl
                    isInvalid={!!formState.errors.title}
                    marginBottom={["20px", "20px"]}
                  >
                    <Input
                      id="title"
                      placeholder="title your clip"
                      lineHeight="1.5"
                      variant="glow"
                      color={"white"}
                      borderRadius="10px"
                      minHeight="2rem"
                      fontWeight="medium"
                      w="100%"
                      padding="auto"
                      fontSize={isStandalone ? "16px" : "unset"}
                      {...register("title")}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <FormErrorMessage>
                      {formState.errors.title?.message}
                    </FormErrorMessage>
                  </FormControl>
                  <Text textAlign="center" fontSize="13px" mb="5px">
                    if you stay and wait, you'll have the option to share the
                    clip link later
                  </Text>
                  <Flex width="100%" justifyContent={"center"}>
                    <Button
                      color="white"
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
                      isDisabled={title.length === 0}
                    >
                      <Text fontSize="20px">clip</Text>
                    </Button>
                  </Flex>
                </form>
              </>
            )}
          </Flex>
        </Flex>
      )}
    </>
  );
};
