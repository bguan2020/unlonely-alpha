import { Flex, Text, Image, Box, Alert, AlertIcon, Textarea, FormErrorMessage, FormControl, useToast, Button } from "@chakra-ui/react";
import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import axios from "axios";
import moment from "moment";
import { useAccount } from "wagmi";

import { PostVideoInput } from "../../generated/graphql";
import {
  postYTLinkSchema,
  postVideoSchema,
} from "../../utils/validation/validation";
import { PostYTLinkInput } from "../../types";
import usePostVideoWithRedirect from "../../hooks/usePostVideoWithRedirect";
import { YT_PUBLIC_KEY } from "../../constants";
import NFTModalHeader from "../profile/NFTModal/NFTModalHeader";
import NFTModalRoot from "../profile/NFTModal/NFTModalRoot";
import NFTModalFooter from "../profile/NFTModal/NFTModalFooter";

const AddVideoModal: React.FunctionComponent = () => {
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
    toast({
      title: "Video Suggestion Submitted",
      description:
        "Your video has been added. Refresh the page to see it in the video feed.",
      status: "success",
      duration: 9000,
      isClosable: true,
      position: "top",
    });
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
    <>
      <NFTModalRoot
        TriggerButton={<Button>Add a Video</Button>}
      >
        <NFTModalHeader styles={{ marginTop: "33px" }}>
          {formError && <Text>{formError}</Text>}
        </NFTModalHeader>
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
                Watch with us! Enter a YouTube video you want to share with a
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
                          w={{ base: "250px", md: "350px", lg: "350px" }}
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
                              _hover={loading ? {} : { bg: "black" }}
                              type="submit"
                              isLoading={loading}
                              margin="25px"
                            >
                              Finalize Submit
                            </Button>
                          ) : (
                            <Button
                              bg="#FFCC15"
                              _hover={loading ? {} : { bg: "black" }}
                              isLoading={loading}
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
                        w={{ base: "250px", md: "350px", lg: "350px" }}
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

        <NFTModalFooter />
      </NFTModalRoot>
    </>
  );
};

export default AddVideoModal;
