import {
  Flex,
  Text,
  Progress,
  Alert,
  AlertIcon,
  Textarea,
  FormControl,
  FormErrorMessage,
  Button,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";

import AppLayout from "../components/layout/AppLayout";
import useCreateClip from "../hooks/useCreateClip";
import ClipDetailCard from "../components/NFCs/ClipDetailCard";
import { PostNfcInput } from "../generated/graphql";
import { postNfcSchema } from "../utils/validation/validation";
import usePostNFC from "../hooks/usePostNFC";
import { useUser } from "../hooks/useUser";

const ClipDetail = () => {
  const { user } = useUser();
  const [progressBar, setProgressBar] = useState<number>(8);
  const [clipUrl, setClipUrl] = useState<null | any>(null);
  const toast = useToast();
  const router = useRouter();

  const form = useForm<PostNfcInput>({
    defaultValues: {},
    resolver: yupResolver(postNfcSchema),
  });
  const { register, formState, handleSubmit, watch } = form;
  const [formError, setFormError] = useState<null | string[]>(null);
  const { createClip } = useCreateClip({
    onError: (m) => {
      setFormError(m ? m.map((e) => e.message) : ["An unknown error occurred"]);
    },
  });
  const { postNFC, loading } = usePostNFC({
    onError: (m) => {
      setFormError(m ? m.map((e) => e.message) : ["An unknown error occurred"]);
    },
  });

  // useeffect to call createClip
  useEffect(() => {
    const fetchData = async () => {
      const { res } = await createClip();
      setClipUrl(res);
    };
    fetchData();
  }, []);

  // update progress bar every 5 seconds, adding 8 to progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      if (progressBar > 85) {
        clearInterval(interval);
        return;
      }
      setProgressBar((prev) => prev + 8);
    }, 5000);
  }, []);

  const submitNFC = async () => {
    const { title } = watch();
    const { res } = await postNFC({
      videoLink: clipUrl,
      title,
    });
    router.push(`/nfc/${res?.id}`);
  };

  return (
    <>
      <AppLayout isCustomHeader={false}>
        <Flex justifyContent="center" mt="5rem" direction="column">
          {!clipUrl ? (
            <Flex width="100%" justifyContent="center">
              <Flex direction="column" width="60%">
                <Progress size="md" value={progressBar} hasStripe isAnimated />
                {progressBar <= 20 && (
                  <Text fontSize="16px">generating clip...</Text>
                )}
                {progressBar <= 40 && progressBar > 20 && (
                  <Text fontSize="16px">contacting AWS...</Text>
                )}
                {progressBar <= 60 && progressBar > 40 && (
                  <Text fontSize="16px">praying to Bezos...</Text>
                )}
                {progressBar <= 80 && progressBar > 60 && (
                  <Text fontSize="16px">almost done...</Text>
                )}
                {progressBar <= 100 && progressBar > 80 && (
                  <Text fontSize="16px">finalizing clip...</Text>
                )}
              </Flex>
            </Flex>
          ) : (
            <Flex width="100%" justifyContent="center">
              <ClipDetailCard clipUrl={clipUrl} />
            </Flex>
          )}
          <Flex width="100%" justifyContent="center" mt="2rem">
            <Flex width="100%" justifyContent="center" direction="column">
              {!clipUrl ? (
                <Flex width="100%" justifyContent="center">
                  <Text fontSize="16px">
                    Be patient! Clip is being generated!
                  </Text>
                </Flex>
              ) : (
                <Flex width="100%" justifyContent="center">
                  <Flex
                    direction="column"
                    w={{ base: "100%", md: "60%", lg: "60%", sm: "100%" }}
                  >
                    <Text
                      fontSize="32px"
                      fontWeight="semibold"
                      fontFamily="Inter"
                    >
                      Clip generated! Title and mint your clip to share!
                    </Text>
                    <form onSubmit={handleSubmit(submitNFC)}>
                      {formError &&
                        formError.length > 0 &&
                        formError.map((err, i) => (
                          <Alert status="error" key={i} mb="8px">
                            <AlertIcon />
                            {err}
                          </Alert>
                        ))}
                      <FormControl
                        isInvalid={!!formState.errors.title}
                        marginBottom={["20px", "20px"]}
                      >
                        <Text fontSize="16px" fontFamily="Inter">
                          Title
                        </Text>
                        <Textarea
                          id="title"
                          placeholder="brian gets rick rolled"
                          _placeholder={{ color: "#767676" }}
                          lineHeight="1.5"
                          background="#D9D9D9"
                          borderRadius="10px"
                          boxShadow="black"
                          minHeight="2rem"
                          color="black"
                          fontWeight="medium"
                          fontFamily="Inter"
                          w="100%"
                          padding="auto"
                          {...register("title")}
                        />
                        <FormErrorMessage>
                          {formState.errors.title?.message}
                        </FormErrorMessage>
                      </FormControl>
                      <Flex width="100%" flexDirection="row-reverse">
                        {user ? (
                          <Button
                            bg="#FFCC15"
                            // _hover={ytLoading ? {} : { bg: "black" }}
                            type="submit"
                            isLoading={loading}
                          >
                            Submit
                          </Button>
                        ) : (
                          <Button
                            bg="#FFCC15"
                            // _hover={ytLoading ? {} : { bg: "black" }}
                            // isLoading={ytLoading}
                            onClick={() => {
                              toast({
                                title: "Sign in first.",
                                description:
                                  "Please sign into your wallet first.",
                                status: "warning",
                                duration: 9000,
                                isClosable: true,
                                position: "top",
                              });
                            }}
                          >
                            Submit
                          </Button>
                        )}
                      </Flex>
                    </form>
                  </Flex>
                </Flex>
              )}
            </Flex>
          </Flex>
        </Flex>
      </AppLayout>
    </>
  );
};

export default ClipDetail;
