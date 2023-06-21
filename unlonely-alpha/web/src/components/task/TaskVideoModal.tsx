import {
  Flex,
  Text,
  Image,
  Box,
  Alert,
  AlertIcon,
  Textarea,
  FormErrorMessage,
  FormControl,
  useToast,
  Button,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  useDisclosure,
} from "@chakra-ui/react";
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
import usePostTask from "../../hooks/usePostTask";
import { YT_PUBLIC_KEY } from "../../constants";
import { useUser } from "../../hooks/useUser";
import { ChatBot } from "../../constants/types";

type Props = {
  setChatBot: (chatBot: ChatBot[]) => void;
  chatBot: ChatBot[];
};

const AddVideoModal: React.FunctionComponent<Props> = ({
  setChatBot,
  chatBot,
}) => {
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
  const [duration, setDuration] = useState<null | number>(null);
  const [isValidVideo, setIsValidVideo] = useState<boolean>(false);
  const accountData = useAccount();
  const { user } = useUser();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { postTask, loading } = usePostTask({
    onError: (m) => {
      setFormError(m ? m.map((e) => e.message) : ["An unknown error occurred"]);
    },
  });

  const submitVideo = async () => {
    if (!user) {
      toast({
        title: "Sign in first.",
        description: "Please sign into your wallet first.",
        status: "warning",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    const { description } = watch();
    const data = await postTask({
      taskType: "video",
      youtubeId,
      title,
      thumbnail,
      description,
    });
    onClose();
    toast({
      title: "Video Submitted",
      description: "Your video has been added.",
      status: "success",
      duration: 9000,
      isClosable: true,
      position: "top",
    });
    setChatBot([
      ...chatBot,
      {
        username: "",
        address: "",
        title: title,
        taskType: "video",
        description: description,
      },
    ]);
    setTitle(null);
    setThumbnail(null);
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
      const validVideo = true;
      setTitle(title);
      setThumbnail(thumbnailUrl);
      setYoutubeId(videoId);
      setIsValidVideo(validVideo);
      setDuration(videoLength);
      setYtLoading(false);
    } else {
      setFormError(["error with Youtube link."]);
      setYtLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={onOpen}
        bgGradient={"linear-gradient(to bottom, #9FA4C4 0%, #B3CDD1 100%);"}
        height={["60px"]}
        style={{
          whiteSpace: "normal",
          wordWrap: "break-word",
        }}
        mb="1rem"
      >
        Watch a Video
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          maxW="500px"
          boxShadow="0px 8px 28px #0a061c40"
          padding="12px"
          borderRadius="10px"
          bgGradient="linear(to-r, #d16fce, #7655D2, #4173D6, #4ABBDF)"
        >
          <ModalHeader>
            <Text fontSize="24px" fontWeight="bold" color="black">
              Watch a Video
            </Text>
            {formError && <Text>{formError}</Text>}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              w={{ base: "300px", md: "400px", lg: "400px" }}
              borderRadius="20px"
            >
              <Text
                fontSize="20px"
                margin="20px"
                lineHeight="25px"
                color="black"
                textAlign={"center"}
              >
                Demand a video to be watched.
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
                        <Image
                          width="120"
                          height="68"
                          src={thumbnail}
                          objectFit="cover"
                        />
                        <Text fontWeight="bold" margin="10px">
                          {title}
                        </Text>
                      </Flex>
                      <Flex width="100%" justifyContent="center">
                        {isValidVideo ? (
                          <Text color="#07FF20">
                            Video Approved. Duration: {duration}s
                          </Text>
                        ) : (
                          <Text color="#CC0000">
                            Video needs to be at least 30 seconds long.
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
                    <Flex
                      width="100%"
                      justifyContent="space-between"
                      direction="row-reverse"
                    >
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
                              Submit
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
                              Submit
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
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddVideoModal;
