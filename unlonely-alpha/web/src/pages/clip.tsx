import {
  Flex,
  Text,
  Progress,
  Alert,
  AlertIcon,
  Textarea,
  FormControl,
  FormErrorMessage,
  Spinner,
  Button,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";

import AppLayout from "../components/layout/AppLayout";
import useCreateClip from "../hooks/server/useCreateClip";
import ClipDetailCard from "../components/NFCs/ClipDetailCard";
import { PostNfcInput } from "../generated/graphql";
import { postNfcSchema } from "../utils/validation/validation";
import usePostNFC from "../hooks/server/usePostNFC";
import { useUser } from "../hooks/context/useUser";

const ClipDetail = () => {
  const { user } = useUser();
  const [progressBar, setProgressBar] = useState<number>(8);
  const [clipError, setClipError] = useState<null | string[]>(null);
  const [clipUrl, setClipUrl] = useState<null | any>(null);
  const [clipThumbnail, setClipThumbnail] = useState<null | any>(null);
  // const [clipThumbnail, setClipThumbnail] = useState<null | any>(
  //   "https://unlonely-clips.s3.us-west-2.amazonaws.com/brian-clips/20230727180940/thumbnail.jpg"
  // );
  // const [clipUrl, setClipUrl] = useState<null | any>(
  //   "https://unlonely-clips.s3.us-west-2.amazonaws.com/brian-clips/20230727180940/clip.mp4"
  // );
  const router = useRouter();
  const { query } = router;

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
  const { postNFC, loading: postingClip } = usePostNFC({
    onError: (m) => {
      setFormError(m ? m.map((e) => e.message) : ["An unknown error occurred"]);
    },
  });

  // useeffect to call createClip
  useEffect(() => {
    const fetchData = async () => {
      if (clipUrl || clipThumbnail) return;
      const { res } = await createClip({ channelArn: query.arn });
      // if res.errorMessage is not null, then show error message
      if (res.errorMessage) {
        setClipError(res.errorMessage);
        return;
      }
      setClipUrl(res.url);
      setClipThumbnail(res.thumbnail);
    };
    if (user) {
      fetchData();
    }
  }, [user?.address]);

  // update progress bar every 5 seconds, adding 8 to progress bar
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        if (progressBar > 85) {
          clearInterval(interval);
          return;
        }
        setProgressBar((prev) => prev + 6);
      }, 10000);
    }
  }, [user?.address]);

  const submitClip = useCallback(async () => {
    const { title } = watch();
    const { res } = await postNFC({
      videoLink: clipUrl,
      videoThumbnail: clipThumbnail,
      title,
      openseaLink: null,
    });
    router.push(`/nfc/${res?.id}`);
  }, [clipUrl, clipThumbnail]);

  return (
    <>
      <AppLayout isCustomHeader={false}>
        <Flex justifyContent="center" mt="5rem" direction="column">
          {clipError ? (
            <Flex width="100%" justifyContent="center">
              <Alert status="error" width="60%">
                <AlertIcon />
                {clipError && <Text color="black">{clipError}</Text>}
              </Alert>
            </Flex>
          ) : (
            <>
              {!clipUrl ? (
                <Flex width="100%" justifyContent="center">
                  <Flex direction="column" width="60%">
                    <Progress
                      size="md"
                      value={progressBar}
                      hasStripe
                      isAnimated
                    />
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
                <Flex width="80%" justifyContent="center" direction="column">
                  {!clipUrl ? (
                    <Flex width="100%" justifyContent="center">
                      <Text fontSize="16px">
                        Do no refresh or close this page! Clip is being
                        generated! This will take a few minutes, so go back to
                        the livestream if you want!
                      </Text>
                    </Flex>
                  ) : postingClip ? (
                    <Flex width="100%" justifyContent="center">
                      <Spinner />
                      <Text></Text>
                    </Flex>
                  ) : (
                    <Flex width="100%" justifyContent="center">
                      <Flex
                        direction="column"
                        w={{ base: "100%", md: "60%", lg: "60%", sm: "100%" }}
                        gap="10px"
                      >
                        <Text
                          fontSize="32px"
                          fontWeight="semibold"
                          textAlign={"center"}
                        >
                          Clip generated!
                        </Text>
                        <Text fontSize="16px" textAlign={"center"}>
                          Give it a title before uploading it!
                        </Text>
                        <form onSubmit={handleSubmit(submitClip)}>
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
                            <Textarea
                              id="title"
                              placeholder="brian gets rick rolled"
                              _placeholder={{ color: "#767676" }}
                              lineHeight="1.5"
                              background="#D9D9D9"
                              borderRadius="10px"
                              boxShadow="black"
                              minHeight="2rem"
                              fontWeight="medium"
                              w="100%"
                              padding="auto"
                              color="black"
                              {...register("title")}
                            />
                            <FormErrorMessage>
                              {formState.errors.title?.message}
                            </FormErrorMessage>
                          </FormControl>
                          <Flex width="100%" justifyContent={"center"}>
                            <Button
                              colorScheme={"blue"}
                              py={10}
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
                            >
                              <Text fontSize="30px">upload</Text>
                            </Button>
                          </Flex>
                        </form>
                      </Flex>
                    </Flex>
                  )}
                </Flex>
              </Flex>
            </>
          )}
        </Flex>
      </AppLayout>
    </>
  );
};

export default ClipDetail;
