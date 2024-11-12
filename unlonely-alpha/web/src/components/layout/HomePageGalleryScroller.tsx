import { Flex, Text, Box, Image } from "@chakra-ui/react";
import { useRef, useEffect } from "react";
import NfcCardSkeleton from "../NFCs/NfcCardSkeleton";

type Props = {
  clips: any[];
  makeLinksExternal?: boolean;
  loading?: boolean;
};

export const HomePageGalleryScroller: React.FunctionComponent<Props> = ({
  clips,
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
      height={{
        base: "15rem",
        sm: "20rem",
        md: "20rem",
        lg: "20rem",
      }}
      gap={"1rem"}
      py="1rem"
      position={"relative"}
    >
      {clips?.map(
        (clip: any) =>
          !!clip && (
            <Box position="relative" mb="10px">
              <Image
                src={clip.videoThumbnail ?? "/svg/defaultThumbnail.svg"}
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
          )
      )}
      {!loading && clips?.length === 0 && (
        <Text>no clips for this gallery yet!</Text>
      )}
      {loading && [1, 2, 3, 4, 5].map((i) => <NfcCardSkeleton key={i} />)}
    </Flex>
  );
};
