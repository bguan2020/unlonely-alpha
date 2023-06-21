import {
  Flex,
  Button,
  Text,
  Modal,
  Box,
  Alert,
  AlertIcon,
  Textarea,
  FormErrorMessage,
  FormControl,
  ModalOverlay,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

import { PostTaskInput } from "../../generated/graphql";
import { postSongSchema } from "../../utils/validation/validation";
import usePostTask from "../../hooks/usePostTask";
import { useUser } from "../../hooks/useUser";
import { checkPOAP } from "../../utils/checkPoapCount";
import { ChatBot } from "../../constants/types";

type Props = {
  songIsOpen: boolean;
  songOnClose: () => void;
  setChatBot: (chatBot: ChatBot[]) => void;
  chatBot: ChatBot[];
};

const TaskModals: React.FunctionComponent<Props> = ({
  songIsOpen,
  songOnClose,
  chatBot,
  setChatBot,
}) => {
  const songForm = useForm<PostTaskInput>({
    defaultValues: {},
    resolver: yupResolver(postSongSchema),
  });
  const {
    register,
    formState: formStateSong,
    handleSubmit: handleSubmitSong,
    watch: watchSong,
  } = songForm;
  const [formError, setFormError] = useState<null | string[]>(null);
  const [songLoading, setSongLoading] = useState<boolean>(false);
  const toast = useToast();
  const { user } = useUser();

  const { postTask, loading } = usePostTask({
    onError: (m) => {
      setFormError(m ? m.map((e) => e.message) : ["An unknown error occurred"]);
    },
  });

  const submitSong = async () => {
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
    setSongLoading(true);
    const poapCount = await checkPOAP(user);
    if (poapCount < 1) {
      toast({
        title: "POAP Required",
        description: "You must have at least 1 POAP to post a song.",
        status: "warning",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
      setSongLoading(false);
      return;
    }
    const { title, description } = watchSong();
    await postTask({ title, description, taskType: "song" });
    songOnClose();
    toast({
      title: "Song Submitted",
      description: "Your song has been submitted.",
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
        taskType: "song",
        title: title,
        description: description,
      },
    ]);
    setSongLoading(false);
  };

  return (
    <>
      <Modal isOpen={songIsOpen} onClose={songOnClose}>
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
              Play a Song
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
                Demand a song to be played.
              </Text>
              <form onSubmit={handleSubmitSong(submitSong)}>
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
                    isInvalid={!!formStateSong.errors.title}
                    marginBottom={["20px", "20px"]}
                    marginLeft="25px"
                  >
                    <Textarea
                      id="title"
                      placeholder="ex: Never Gonna Give You Up by Rick Astley"
                      _placeholder={{ color: "#2C3A50" }}
                      lineHeight="1"
                      background="#F1F4F8"
                      borderRadius="10px"
                      boxShadow="#F1F4F8"
                      minHeight="60px"
                      color="#2C3A50"
                      fontWeight="medium"
                      w={{ base: "250px", md: "350px", lg: "350px" }}
                      padding="auto"
                      {...register("title")}
                    />
                    <FormErrorMessage>
                      {formStateSong.errors.title?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl
                    isInvalid={!!formStateSong.errors.description}
                    marginBottom={["20px", "20px"]}
                    marginLeft="25px"
                  >
                    <Textarea
                      id="description"
                      placeholder="ex: b/c its a dope song"
                      _placeholder={{ color: "#2C3A50" }}
                      lineHeight="1"
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
                      {formStateSong.errors.description?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <Flex width="100%" flexDirection="row-reverse">
                    <Button
                      bg="#FFCC15"
                      _hover={songLoading ? {} : { bg: "black" }}
                      type="submit"
                      isLoading={songLoading}
                      margin="25px"
                    >
                      Submit
                    </Button>
                  </Flex>
                </>
              </form>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TaskModals;
