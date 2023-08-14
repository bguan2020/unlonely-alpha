import { Box, Flex, Spacer, Text, Image } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

import { LikeObj } from "../../generated/graphql";
import { useUser } from "../../hooks/context/useUser";
import useLike from "../../hooks/server/useLike";
import centerEllipses from "../../utils/centerEllipses";
import { LikedIcon, LikeIcon } from "../icons/LikeIcon";

export const NFCComponent = ({ nfc }: { nfc?: any }) => {
  const { user, walletIsConnected } = useUser();

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

  return (
    <Flex
      scrollSnapAlign={"start"}
      position="relative"
      direction="column"
      justifyContent="center"
      height="calc(100vh - 115px)"
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
          fontFamily="Neue Pixel Sans"
          fontSize={30}
          bg="rgba(0, 0, 0, 0.5)"
          p="2"
          borderRadius="md"
        >
          {nfc?.title}
        </Text>
        <Text
          fontSize="18px"
          zIndex="3"
          noOfLines={1}
          fontWeight="light"
          fontFamily="Neue Pixel Sans"
          color="#9d9d9d"
        >
          owner: {nfc?.owner.username ?? centerEllipses(nfc?.owner.address, 13)}
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
      {nfc && nfc?.videoThumbnail && nfc.videoLink ? (
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
            <source src={nfc?.videoLink} type="video/mp4"></source>
          </video>

          <button
            onClick={submitLike}
            disabled={buttonDisabled}
            style={{
              position: "absolute",
              bottom: "-50px",
              right: "10px",
              zIndex: 3,
              background: "none",
              border: "none",
              outline: "none",
              cursor: buttonDisabled ? "not-allowed" : "pointer",
            }}
          >
            <Flex alignItems={"center"} gap="10px">
              {nfc.score >= 1 ? (
                <Text fontFamily={"Neue Pixel Sans"} fontSize={20}>
                  {nfc.score}
                </Text>
              ) : null}
              {nfc?.liked === true ? (
                <LikedIcon boxSize={8} />
              ) : (
                <LikeIcon boxSize={8} />
              )}
              <Spacer />
              {nfc?.openseaLink && (
                <>
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
          </button>
        </Flex>
      ) : (
        <Flex justifyContent={"center"}>
          <Text fontSize={32} fontFamily="Neue Pixel Sans">
            clip data could not be fetched
          </Text>
        </Flex>
      )}
    </Flex>
  );
};
