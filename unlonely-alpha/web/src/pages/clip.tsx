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
import { useContractWrite, useWaitForTransaction } from "wagmi";
import { create } from "ipfs-http-client";

import AppLayout from "../components/layout/AppLayout";
import useCreateClip from "../hooks/useCreateClip";
import ClipDetailCard from "../components/NFCs/ClipDetailCard";
import { PostNfcInput } from "../generated/graphql";
import { postNfcSchema } from "../utils/validation/validation";
import usePostNFC from "../hooks/usePostNFC";
import { useUser } from "../hooks/useUser";
import { UNLONELYNFCV2_ADDRESS } from "../constants";
import UnlonelyNFCsV2 from "../utils/UnlonelyNFCsV2.json";
import NextHead from "../components/layout/NextHead";

const projectId = "2L4KPgsXhXNwOtkELX7xt2Sbrl4";
const projectSecret = "7d400aacc9bc6c0f0d6e59b65a83d764";
const auth = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString(
  "base64"
)}`;

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  apiPath: "api/v0",
  headers: {
    authorization: auth,
  },
});

const ClipDetail = () => {
  const { user } = useUser();
  const [progressBar, setProgressBar] = useState<number>(8);
  const [clipError, setClipError] = useState<null | string[]>(null);
  const [clipUrl, setClipUrl] = useState<null | any>(null);
  const [clipThumbnail, setClipThumbnail] = useState<null | any>(null);
  const toast = useToast();
  const router = useRouter();

  // mint nft hooks
  const { data, write } = useContractWrite({
    address: UNLONELYNFCV2_ADDRESS,
    abi: UnlonelyNFCsV2.abi,
    functionName: "mint",
    mode: "recklesslyUnprepared",
  });

  const {
    data: txnData,
    isLoading,
    isSuccess,
  } = useWaitForTransaction({
    hash: data?.hash,
  });

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
      // if res.errorMessage is not null, then show error message
      if (res.errorMessage) {
        setClipError(res.errorMessage);
        return;
      }
      setClipUrl(res.url);
      setClipThumbnail(res.thumbnail);
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
      setProgressBar((prev) => prev + 6);
    }, 5000);
  }, []);

  useEffect(() => {
    const _postNFC = async () => {
      const { title } = watch();
      toast({
        title: "NFT Minted",
        description: "Your NFT has been minted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      const { res } = await postNFC({
        videoLink: clipUrl,
        videoThumbnail: clipThumbnail,
        title,
        openseaLink: txnData?.logs[0].topics[3]
          ? `https://opensea.io/assets/${UNLONELYNFCV2_ADDRESS}/${parseInt(
              txnData?.logs[0].topics[3],
              16
            )}`
          : null,
      });
      router.push(`/nfc/${res?.id}`);
    };
    if (isSuccess) {
      _postNFC();
    }
  }, [isSuccess, txnData]);

  const submitNFC = async () => {
    const { title } = watch();
    // first upload to ipfs
    // then mint nft
    const uri = await uploadToIPFS(title, clipUrl);
    if (!uri) {
      setFormError(["Error Minting NFT"]);
      return;
    }

    if (!write) {
      setFormError(["Error Minting NFT"]);
      return;
    }

    const tx = await write({
      recklesslySetUnpreparedArgs: [user?.address, uri],
    });
  };

  const uploadToIPFS = async (name: string, clipUrl: string) => {
    // destructing. getting value of name, desc and price from formInput.
    if (!name || !clipUrl) return;
    // if any of the valuable is empty return

    /* first, upload metadata to IPFS */
    const data = JSON.stringify({
      name,
      description:
        "this is an NFC (non-fungible clip) highlight from an unlonely livestream",
      image: clipUrl,
      external_url: "https://www.unlonely.app/",
      image_url: clipThumbnail,
    });
    try {
      const added = await client.add(data);
      const url = `https://cloudflare-ipfs.com/ipfs/${added.path}`;

      /* after metadata is uploaded to IPFS, return the URL to use it in the transaction */
      return url;
    } catch (error) {
      setFormError(["Error uploading file to IPFS"]);
    }
  };

  return (
    <>
      <AppLayout isCustomHeader={false}>
        <NextHead
          title={isSuccess ? "done! mint the nfc now" : "generating clip..."}
          description=""
          image=""
        ></NextHead>
        <Flex justifyContent="center" mt="5rem" direction="column">
          {clipError ? (
            <Flex width="100%" justifyContent="center">
              <Alert status="error" width="60%">
                <AlertIcon />
                {clipError}
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
                <Flex width="100%" justifyContent="center" direction="column">
                  {!clipUrl ? (
                    <Flex width="100%" justifyContent="center">
                      <Text fontSize="16px">
                        Do no refresh or close this page! Clip is being
                        generated!
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
                              <>
                                {isSuccess ? (
                                  <>
                                    <Button bg="#FFCC15" disabled={true}>
                                      Successfully Minted!
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    bg="#FFCC15"
                                    _hover={{ bg: "black" }}
                                    type="submit"
                                    isLoading={isLoading || loading}
                                    loadingText="Minting..."
                                  >
                                    Mint
                                  </Button>
                                )}
                              </>
                            ) : (
                              <Button
                                bg="#FFCC15"
                                _hover={{ bg: "black" }}
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
                                Mint
                              </Button>
                            )}
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
