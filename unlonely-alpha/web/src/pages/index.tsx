import React, { useState } from "react";
import {
  Text,
  Flex,
  Box,
  Alert,
  AlertIcon,
  Textarea,
  FormErrorMessage,
  Button,
  Image,
  useMediaQuery,
} from "@chakra-ui/react";
import { FormControl, useToast } from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import axios from "axios";
import moment from "moment";
import { useAccount } from "wagmi";

import { PostVideoInput } from "../generated/graphql";
import {
  postYTLinkSchema,
  postVideoSchema,
} from "../utils/validation/validation";
import { PostYTLinkInput } from "../types";
import usePostVideoWithRedirect from "../hooks/usePostVideoWithRedirect";
import AppLayout from "../components/layout/AppLayout";

const YT_PUBLIC_KEY = "AIzaSyAobxgmgOkLIOnwDsKMF_e_4fFSUrcUIxk";

export default function Page() {
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  console.log(isMobile)
  const ytForm = useForm<PostYTLinkInput>({
    defaultValues: {},
    resolver: yupResolver(postYTLinkSchema),
  });
  const form = useForm<PostVideoInput>({
    defaultValues: {},
    resolver: yupResolver(postVideoSchema),
  });
  const {
    register: register1,
    formState: formState1,
    handleSubmit: handleSubmit1,
    watch: watch1,
  } = ytForm;
  const { register, formState, handleSubmit, watch } = form;
  const [formError, setFormError] = useState<null | string[]>(null);
  const [ytLoading, setYtLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<null | string>(null);
  const [thumbnail, setThumbnail] = useState<null | string>(null);
  const [youtubeId, setYoutubeId] = useState<null | string>(null);
  const [isValidVideo, setIsValidVideo] = useState<boolean>(false);
  const [{ data: accountData }] = useAccount();
  const toast = useToast();

  const { postVideo, loading } = usePostVideoWithRedirect({
    onError: (m) => {
      setFormError(m ? m.map((e) => e.message) : ["An unknown error occurred"]);
    },
  });

  const submitVideo = async () => {
    const { description } = watch();
    const data = await postVideo({ youtubeId, title, thumbnail, description });
  };

  const handleChangeVideo = () => {
    setTitle(null);
    setThumbnail(null);
  };

  const submitLink = async () => {
    setYtLoading(true);
    const { videoLink } = watch1();
    const regExp =
      /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoLink.match(regExp);
    if (match && match[2].length === 11) {
      const videoId = match[2];
      const { data } = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&part=snippet&id=${videoId}&key=${YT_PUBLIC_KEY}`
      );
      const title = data.items[0].snippet.title;
      const thumbnailUrl = data.items[0].snippet.thumbnails.default.url;
      const videoLength = moment
        .duration(data.items[0].contentDetails.duration)
        .asSeconds();

      let validVideo: boolean;
      if (videoLength < 120) {
        validVideo = false;
      } else {
        validVideo = true;
      }
      setTitle(title);
      setThumbnail(thumbnailUrl);
      setYoutubeId(videoId);
      setIsValidVideo(validVideo);
      setYtLoading(false);
    } else {
      setFormError(["error with Youtube link."]);
      setYtLoading(false);
    }
  };

  return (
    <AppLayout>
      <Flex justifyContent="center">
        <Flex
          marginTop="100px"
          maxW="80%"
          marginLeft="50px"
          flexDirection="column"
        >
          {isMobile ? (
            <Text
              color="black"
              fontSize={40}
              lineHeight={"40px"}
              fontWeight="bold"
              textAlign="center"
            >
              Never watch alone again. Come be{" "}
              <Text as="span" color="white">
                unlonely
              </Text>{" "}
              with us.
            </Text>
          ) : (
            <Text
              color="black"
              fontSize={80}
              lineHeight={"80px"}
              fontWeight="bold"
              textAlign="center"
            >
              Never watch alone again. Come be{" "}
              <Text as="span" color="white">
                unlonely
              </Text>{" "}
              with us.
            </Text>
          )}
          <Flex w="100%" justifyContent="center" mt="20px">
            <Text color="black" fontSize={26} lineHeight="26px">
              9pm-11pm PST Daily
            </Text>
          </Flex>
          <Flex w="100%" justifyContent="center" mt="100px">
            <Box w={isMobile ? "300px" : "400px"} bg="#FF6D6A" borderRadius="20px">
              <Text
                fontSize="20px"
                margin="20px"
                lineHeight="25px"
                fontWeight="bold"
              >
                Watch with us! Enter a Youtube video you want to share with a
                community.
              </Text>
              {title && thumbnail ? (
                <form onSubmit={handleSubmit(submitVideo)}>
                  {formError &&
                    formError.length > 0 &&
                    formError.map((err, i) => (
                      <Alert status="error" key={i} mb="8px">
                        <AlertIcon />
                        {err}
                      </Alert>
                    ))}
                  <>
                    <Flex flexDirection="column">
                      <Flex margin="25px" width="100%">
                        <Image width="120" height="90" src={thumbnail} />
                        <Text fontWeight="bold" margin="10px">
                          {title}
                        </Text>
                      </Flex>
                      <Flex width="100%" justifyContent="center">
                        {isValidVideo ? (
                          <Text color="#07FF20">Video Approved.</Text>
                        ) : (
                          <Text color="#CC0000">
                            Video needs to be at least 2 minutes long.
                          </Text>
                        )}
                      </Flex>
                    </Flex>
                    {isValidVideo && (
                      <FormControl
                        isInvalid={!!formState.errors.description}
                        marginBottom={["20px", "20px"]}
                        marginLeft="25px"
                      >
                        <Text fontWeight="bold" fontSize="20px" mt="20px">
                          Why this video?
                        </Text>
                        <Textarea
                          id="description"
                          placeholder="reason: b/c who doesn't love a good rick roll"
                          _placeholder={{ color: "#2C3A50" }}
                          lineHeight="1.2"
                          background="#F1F4F8"
                          borderRadius="10px"
                          boxShadow="#F1F4F8"
                          minHeight="60px"
                          color="#2C3A50"
                          fontWeight="medium"
                          width="350px"
                          padding="auto"
                          {...register("description")}
                        />
                        <FormErrorMessage>
                          {formState.errors.description?.message}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                    <Flex width="100%" flexDirection="row-reverse">
                      {isValidVideo && (
                        <>
                          {accountData?.address ? (
                            <Button
                              bg="#FFCC15"
                              _hover={ytLoading ? {} : { bg: "black" }}
                              type="submit"
                              isLoading={ytLoading}
                              margin="25px"
                            >
                              Click again to join!
                            </Button>
                          ) : (
                            <Button
                              bg="#FFCC15"
                              _hover={ytLoading ? {} : { bg: "black" }}
                              isLoading={ytLoading}
                              margin="25px"
                              onClick={() =>
                                toast({
                                  title: "Sign in first.",
                                  description:
                                    "Please sign into your wallet first.",
                                  status: "warning",
                                  duration: 9000,
                                  isClosable: true,
                                  position: "top",
                                })
                              }
                            >
                              Click again to join!
                            </Button>
                          )}
                        </>
                      )}
                      <Button
                        bg="#517EF5"
                        onClick={() => handleChangeVideo()}
                        margin="25px"
                      >
                        Change Video
                      </Button>
                    </Flex>
                  </>
                </form>
              ) : (
                <form onSubmit={handleSubmit1(submitLink)}>
                  {formError &&
                    formError.length > 0 &&
                    formError.map((err, i) => (
                      <Alert status="error" key={i} mb="8px">
                        <AlertIcon />
                        {err}
                      </Alert>
                    ))}
                  <>
                    <FormControl
                      isInvalid={!!formState1.errors.videoLink}
                      marginBottom={["20px", "20px"]}
                      marginLeft="25px"
                    >
                      <Textarea
                        id="videoLink"
                        placeholder="ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley"
                        _placeholder={{ color: "#2C3A50" }}
                        lineHeight="1.2"
                        background="#F1F4F8"
                        borderRadius="10px"
                        boxShadow="#F1F4F8"
                        minHeight="60px"
                        color="#2C3A50"
                        fontWeight="medium"
                        w={isMobile ? "250px" : "350px"}
                        padding="auto"
                        {...register1("videoLink")}
                      />
                      <FormErrorMessage>
                        {formState1.errors.videoLink?.message}
                      </FormErrorMessage>
                    </FormControl>

                    <Flex width="100%" flexDirection="row-reverse">
                      <Button
                        bg="#FFCC15"
                        _hover={ytLoading ? {} : { bg: "black" }}
                        type="submit"
                        isLoading={ytLoading}
                        margin="25px"
                      >
                        Submit
                      </Button>
                    </Flex>
                  </>
                </form>
              )}
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
