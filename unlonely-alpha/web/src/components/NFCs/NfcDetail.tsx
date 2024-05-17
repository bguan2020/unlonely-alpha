import {
  Text,
  Flex,
  Image,
  Spacer,
  Button,
  useToast,
  Alert,
  AlertIcon,
  Box,
  Spinner,
  Tooltip,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { create } from "ipfs-http-client";
import Link from "next/link";

import { LikeObj, NfcDetailQuery } from "../../generated/graphql";
import useLike from "../../hooks/server/useLike";
import { useUser } from "../../hooks/context/useUser";
import { LikeIcon, LikedIcon } from "../icons/LikeIcon";
import { IPFS_PROJECT_ID, IPFS_PROJECT_SECRET } from "../../constants";
import { useWrite } from "../../hooks/contracts/useWrite";
import useUpdateNFC from "../../hooks/server/useUpdateNFC";
import centerEllipses from "../../utils/centerEllipses";
import { getContractFromNetwork } from "../../utils/contract";
import { useNetworkContext } from "../../hooks/context/useNetwork";

const unlonelyAvatar = "/icons/icon-192x192.png";

const auth = `Basic ${Buffer.from(
  `${IPFS_PROJECT_ID}:${IPFS_PROJECT_SECRET}`
).toString("base64")}`;

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  apiPath: "api/v0",
  headers: {
    authorization: auth,
  },
});

const NfcDetailCard = ({ nfc }: { nfc?: NfcDetailQuery["getNFC"] }) => {
  const { user, walletIsConnected } = useUser();
  const toast = useToast();
  const { network } = useNetworkContext();
  const { localNetwork, explorerUrl } = network;
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const { like } = useLike({
    likedObj: LikeObj.Nfc,
    likableId: nfc?.id,
    powerLvl: user?.powerUserLvl,
  });
  const [uri, setUri] = useState<string | undefined>(undefined);
  const { updateNFC } = useUpdateNFC({});
  const [error, setError] = useState<string | undefined>(undefined);
  const [isUploadingToIPFS, setIsUploadingToIPFS] = useState<boolean>(false);
  const [minted, setMinted] = useState<boolean>(false);

  const callingWrite = useRef(false);

  const submitLike = async () => {
    setButtonDisabled(true);
    await like();

    setTimeout(() => {
      setButtonDisabled(false);
    }, 3000);
  };

  const handleOpenSeaLink = () => {
    if (nfc?.openseaLink) {
      window.open(nfc?.openseaLink, "_blank");
    }
  };

  const contract = getContractFromNetwork("unlonelyNfcV2", localNetwork);

  const { writeAsync, isTxLoading, writeError, txError } = useWrite(
    contract,
    "mint",
    [user?.address, uri],
    {
      onPrepareSuccess: (data) => {
        console.log("nfc mint prepare success", data);
      },
      onPrepareError: (error) => {
        console.log("nfc mint prepare error", error);
      },
      onWriteSuccess: (data) => {
        console.log("nfc mint write success", data);
        setIsUploadingToIPFS(false);
        callingWrite.current = false;
        toast({
          duration: 9000,
          isClosable: true,
          position: "bottom", // chakra ui toast position
          render: () => (
            <Box as="button" borderRadius="md" bg="#287ab0" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.hash}`}
                passHref
              >
                mint pending, click to view
              </Link>
            </Box>
          ),
        });
      },
      onWriteError: (error) => {
        console.log("nfc mint write error", error);
        setIsUploadingToIPFS(false);
        callingWrite.current = false;
        toast({
          duration: 9000,
          isClosable: true,
          position: "bottom", // chakra ui toast position
          render: () => (
            <Box as="button" borderRadius="md" bg="#bd711b" px={4} h={8}>
              mint cancelled
            </Box>
          ),
        });
      },
      onTxSuccess: async (data) => {
        console.log("nfc mint tx success", data);
        setMinted(true);
        await updateNFC({
          id: nfc?.id,
          videoLink: nfc?.videoLink,
          videoThumbnail: nfc?.videoThumbnail,
          title: nfc?.title,
          openseaLink: data.logs[0].topics[3]
            ? `https://opensea.io/assets/ethereum/${
                contract.address
              }/${parseInt(data?.logs[0].topics[3], 16)}`
            : "",
        });
        toast({
          duration: 9000,
          isClosable: true,
          position: "bottom", // chakra ui toast position
          render: () => (
            <Box as="button" borderRadius="md" bg="#50C878" px={4} h={8}>
              <Link
                target="_blank"
                href={`${explorerUrl}/tx/${data.transactionHash}`}
                passHref
              >
                mint success, click to view
              </Link>
            </Box>
          ),
        });
      },
      onTxError: (error) => {
        console.log("nfc mint tx error", error);
        toast({
          duration: 9000,
          isClosable: true,
          position: "bottom", // chakra ui toast position
          render: () => (
            <Box as="button" borderRadius="md" bg="#b82929" px={4} h={8}>
              mint error
            </Box>
          ),
        });
      },
    }
  );

  const uploadToIPFS = useCallback(async () => {
    if (!nfc?.title || !nfc?.videoLink || !nfc?.videoThumbnail) return;
    setIsUploadingToIPFS(true);
    const data = JSON.stringify({
      name: nfc?.title,
      description:
        "this is an NFC (non-fungible clip) highlight from an unlonely livestream",
      image: nfc?.videoLink,
      external_url: "https://www.unlonely.app/",
      image_url: nfc?.videoThumbnail,
    });
    try {
      const added = await client.add(data);
      const url = `https://cloudflare-ipfs.com/ipfs/${added.path}`;
      setUri(url);
    } catch (error) {
      setError("Error uploading to IPFS");
    }
  }, [nfc, user?.address]);

  useEffect(() => {
    console.log(
      "inside useEffect",
      "uri",
      uri,
      "writeAsync",
      writeAsync,
      "user.address",
      user?.address
    );
    if (!writeAsync || !uri || callingWrite.current) return;
    callingWrite.current = true;
    writeAsync();
  }, [writeAsync, uri]);

  useEffect(() => {
    if (writeError || txError) {
      setError("Error minting");
    }
  }, [writeError, txError]);

  console.log(
    "outside useEffect",
    "uri",
    uri,
    "writeAsync",
    writeAsync,
    "user.address",
    user?.address
  );
  return (
    <>
      <Flex
        direction="column"
        w={{ base: "100%", md: "60%", lg: "60%", sm: "100%" }}
        padding="0.3rem"
        borderRadius="1rem"
        minW={{ base: "16rem", sm: "25rem", md: "25rem", lg: "25rem" }}
        mb="1.5rem"
        mt="8px"
        mr="1rem"
        gap={"10px"}
      >
        {nfc && nfc?.videoLink ? (
          <>
            <video
              controls
              loop
              preload="metadata"
              poster={nfc?.videoThumbnail ?? "/svg/defaultThumbnail.svg"}
            >
              <source
                src={nfc?.videoLink.concat("#t=0.1")}
                type="video/mp4"
              ></source>
            </video>
            {error && (
              <Flex width="100%" justifyContent="center">
                <Alert status="error" width="60%">
                  <AlertIcon />
                  <Text color="black">{error}</Text>
                </Alert>
              </Flex>
            )}
            {isUploadingToIPFS && (
              <Flex width="100%" justifyContent="center">
                <Alert status="info" width="60%">
                  <AlertIcon />
                  <Text color="black">
                    Uploading to IPFS, please wait on this page for wallet
                    prompt...
                  </Text>
                </Alert>
              </Flex>
            )}
            {isTxLoading && (
              <Flex width="100%" justifyContent="center">
                <Alert status="info" width="60%">
                  <AlertIcon />
                  <Text color="black">
                    Executing transaction, please wait on this page...
                  </Text>
                </Alert>
              </Flex>
            )}
            <Flex justifyContent="space-between">
              <Text fontSize={32} fontWeight="bold">
                {nfc?.title}
              </Text>
              <Flex alignItems={"center"} gap={2}>
                <button
                  margin-top="0.5rem"
                  onClick={submitLike}
                  disabled={buttonDisabled}
                  style={{
                    background: "none",
                    border: "none",
                    outline: "none",
                    cursor: buttonDisabled ? "not-allowed" : "pointer",
                  }}
                >
                  {nfc.score >= 1 ? (
                    <Text fontSize={12}>{nfc.score}</Text>
                  ) : null}
                  {nfc?.liked === true ? (
                    <LikedIcon boxSize={6} />
                  ) : (
                    <LikeIcon boxSize={6} />
                  )}
                </button>
                {isTxLoading || isUploadingToIPFS ? (
                  <Spinner />
                ) : (
                  <>
                    {!nfc?.openseaLink && !minted && (
                      <Tooltip
                        label="If this is still disabled after logging in, try to refresh"
                        isDisabled={writeAsync ? true : false}
                        shouldWrapChildren
                      >
                        <Button
                          color="white"
                          className="zooming-text"
                          bg="#2977dd"
                          _hover={{}}
                          isDisabled={!writeAsync}
                          onClick={() => {
                            if (walletIsConnected) {
                              if (!uri || uri === "") {
                                uploadToIPFS();
                              } else {
                                writeAsync?.();
                              }
                            } else {
                              toast({
                                title: "Sign in first.",
                                description:
                                  "Please sign into your wallet first.",
                                status: "warning",
                                duration: 9000,
                                isClosable: true,
                                position: "top",
                              });
                            }
                          }}
                        >
                          Mint
                        </Button>
                      </Tooltip>
                    )}
                  </>
                )}
              </Flex>
            </Flex>
            <Flex
              direction="row"
              justifyContent="flex-end"
              alignItems={"center"}
            >
              <Image
                height="36px"
                width="36px"
                objectFit="cover"
                src={
                  nfc?.owner.FCImageUrl ? nfc?.owner.FCImageUrl : unlonelyAvatar
                }
                borderRadius="full"
                mr="0.5rem"
              />
              <Text
                fontSize="18px"
                noOfLines={1}
                fontWeight="light"
                textAlign="center"
              >
                owner:{" "}
                {nfc?.owner.username ?? centerEllipses(nfc?.owner.address, 13)}
              </Text>
              <Spacer />
              {nfc?.openseaLink && (
                <>
                  <Image
                    src="/images/opensea-blue_logo.png"
                    width="1.5rem"
                    height="1.5rem"
                    opacity={"0.4"}
                    onClick={handleOpenSeaLink}
                    _hover={{ cursor: "pointer" }}
                  />
                </>
              )}
            </Flex>
          </>
        ) : (
          <Flex justifyContent={"center"}>
            <Text fontSize={32} fontFamily="LoRes15">
              clip data could not be fetched
            </Text>
          </Flex>
        )}
      </Flex>
    </>
  );
};

export default NfcDetailCard;
