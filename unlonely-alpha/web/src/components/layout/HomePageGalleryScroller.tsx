import { Flex, Text } from "@chakra-ui/react";
import { useRef, useEffect } from "react";
import NfcCardSkeleton from "../NFCs/NfcCardSkeleton";
import { GalleryData } from "../../pages";
type Props = {
  galleryDataArray: GalleryData[];
  makeLinksExternal?: boolean;
  loading?: boolean;
};

export const HomePageGalleryScroller: React.FunctionComponent<Props> = ({
  galleryDataArray,
  makeLinksExternal,
  loading,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", handleWheel);

    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <Flex
      ref={ref}
      direction="row"
      overflowX="scroll"
      overflowY="clip"
      width="100%"
      gap={"1rem"}
      py="1rem"
      position={"relative"}
    >
      {galleryDataArray?.map((galleryData: GalleryData) => (
        <Flex
          key={galleryData.link}
          direction="column"
          padding="0.3rem"
          borderRadius="1rem"
          minH="8rem"
          minW={{ base: "16rem", sm: "25rem", md: "25rem", lg: "25rem" }}
          bg={"#131323"}
          p={"10px"}
          cursor="pointer"
          transition="transform 0.2s"
          _hover={{ transform: "scale(1.05)" }}
        >
          {/* <Flex
            _hover={{
              filter: "brightness(80%)",
              position: "relative",
            }}
          >
            <Box position="relative" mb="10px">
              <Image
                src={galleryData.thumbnailUrl}
                width={["236px", "380px"]}
                height={["132px", "213px"]}
                borderRadius={"10px"}
              />
              <Image
                src="/images/playIcon.png"
                opacity={0.5}
                style={
                  {
                    position: "absolute",
                    zIndex: 1,
                    visibility: "visible",
                    margin: "auto",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  } as React.CSSProperties
                }
              />
            </Box>
          </Flex> */}
          <video key={galleryData.link} controls preload="metadata">
            <source
              src={galleryData.link.concat("#t=0.1")}
              type="video/mp4"
            ></source>
          </video>
        </Flex>
      ))}
      {!loading && galleryDataArray?.length === 0 && (
        <Text>no clips for this gallery yet!</Text>
      )}
      {loading && [1, 2, 3, 4, 5].map((i) => <NfcCardSkeleton key={i} />)}
    </Flex>
  );
};
