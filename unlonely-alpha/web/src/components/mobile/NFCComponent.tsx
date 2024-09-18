import { Box, Flex, Spacer, Text, Image, IconButton } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { HiDotsVertical } from "react-icons/hi";

import { LikeObj } from "../../generated/graphql";
import { useUser } from "../../hooks/context/useUser";
import useLike from "../../hooks/server/useLike";
import centerEllipses from "../../utils/centerEllipses";
import { LikedIcon, LikeIcon } from "../icons/LikeIcon";

export const NFCComponent = ({ nfc }: { nfc?: any }) => {
  const { user } = useUser();

  const videoRef = useRef<HTMLVideoElement>(null); // Ref for the video element

  const handleOpenSeaLink = () => {
    window.open(nfc.openseaLink, "_blank");
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          video.play(); // Play the video when in view
        } else {
          video.pause(); // Pause it when out of view
        }
      },
      {
        threshold: 0.75, // Adjust this threshold as needed
      }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  const { like } = useLike({
    likedObj: LikeObj.Nfc,
    likableId: nfc?.id,
    powerLvl: user?.powerUserLvl,
  });

  const submitLike = async () => {
    setButtonDisabled(true);
    await like();

    setTimeout(() => {
      setButtonDisabled(false);
    }, 3000);
  };

  const share = async () => {
    if (navigator.share) {
      navigator
        .share({
          title: nfc?.title,
          url: `${window.location.origin}/nfc/${nfc.id}`,
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
    <Flex
      scrollSnapAlign={"start"}
      position="relative"
      direction="column"
      justifyContent="center"
      height="calc(100vh - 103px)"
    >
      <Flex
        top="2rem"
        left="10px"
        right="10px"
        direction="column"
        position="absolute"
        gap="10px"
      >
        <Text
          color="white"
          zIndex="3"
          fontFamily="LoRes15"
          fontSize={30}
          textShadow="0px 0px 10px rgba(0,0,0,0.75)"
          borderRadius="md"
        >
          {nfc?.title}
        </Text>
        <Text
          fontSize="18px"
          zIndex="3"
          noOfLines={1}
          fontWeight="light"
          fontFamily="LoRes15"
          color="#9d9d9d"
        >
          owner:{" "}
          {nfc?.owner.username ?? centerEllipses(nfc?.owner?.address, 13)}
        </Text>
      </Flex>
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundImage={`url(${nfc?.videoThumbnail})`}
        backgroundSize="cover"
        backgroundPosition="center"
        filter="blur(10px)"
        zIndex={1}
      />
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor="rgba(25,22,47, 0.9)" // This will overlay a semi-transparent black
        zIndex={2}
      />
      {nfc && nfc.videoLink ? (
        <Flex direction={"column"} position="relative">
          <video
            ref={videoRef}
            style={{ zIndex: 2, maxHeight: "500px" }}
            controls
            loop
            playsInline
            preload="metadata"
            poster={nfc?.videoThumbnail}
          >
            <source
              src={nfc?.videoLink.concat("#t=0.1")}
              type="video/mp4"
            ></source>
          </video>
          <Flex
            style={{
              position: "absolute",
              bottom: "-50px",
              left: "10px",
              zIndex: 3,
            }}
            gap="10px"
          >
            <IconButton
              color="white"
              aria-label="share"
              icon={<HiDotsVertical size="20px" />}
              onClick={share}
              bg="transparent"
              _hover={{}}
              _focus={{}}
              _active={{}}
            />
          </Flex>

          <Flex
            style={{
              position: "absolute",
              bottom: "-50px",
              right: "10px",
              zIndex: 3,
            }}
            gap="10px"
          >
            <button
              onClick={submitLike}
              disabled={buttonDisabled}
              style={{
                background: "none",
                border: "none",
                outline: "none",
                cursor: buttonDisabled ? "not-allowed" : "pointer",
              }}
            >
              <Flex alignItems={"center"} gap="2px" px="5px">
                {nfc.score >= 1 ? (
                  <Text fontFamily={"LoRes15"} fontSize={20}>
                    {nfc.score}
                  </Text>
                ) : null}
                {nfc?.liked === true ? (
                  <LikedIcon boxSize={8} />
                ) : (
                  <LikeIcon boxSize={8} />
                )}
              </Flex>
            </button>
            {nfc?.openseaLink && (
              <>
                <Spacer />
                <Image
                  src="/images/opensea-blue_logo.png"
                  width="1.7rem"
                  height="1.7rem"
                  onClick={handleOpenSeaLink}
                  _hover={{ cursor: "pointer" }}
                />
              </>
            )}
          </Flex>
        </Flex>
      ) : (
        <Flex justifyContent={"center"}>
          <Text fontSize={32} fontFamily="LoRes15">
            clip data could not be fetched
          </Text>
        </Flex>
      )}
    </Flex>
  );
};
