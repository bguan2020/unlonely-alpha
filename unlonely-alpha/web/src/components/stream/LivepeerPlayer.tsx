import { memo, useRef, useState } from "react";
import {
  Button,
  Flex,
  IconButton,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Src } from "@livepeer/react";
import * as Player from "@livepeer/react/player";
import {
  EnterFullscreenIcon,
  ExitFullscreenIcon,
  MuteIcon,
  PauseIcon,
  PictureInPictureIcon,
  PlayIcon,
  UnmuteIcon,
} from "@livepeer/react/assets";
import { SlArrowDown, SlArrowUp } from "react-icons/sl";
import copy from "copy-to-clipboard";
import useUserAgent from "../../hooks/internal/useUserAgent";
import { useChannelContext } from "../../hooks/context/useChannel";
import { safeIncludes } from "../../utils/safeFunctions";

const unacceptedErrors = [
  "Failed to connect to peer.",
  "Timeout reached for canPlay - triggering playback error.",
];

const LivepeerPlayer = memo(
  ({
    src,
    isPreview,
    customSizePercentages,
    borderRadius,
    cannotOpenClipDrawer,
  }: {
    src: Src[] | null;
    isPreview?: boolean;
    customSizePercentages?: { width: `${number}%`; height: `${number}%` };
    borderRadius?: string;
    cannotOpenClipDrawer?: boolean;
  }) => {
    const { ui } = useChannelContext();
    const { showClipDrawer, handleClipDrawer } = ui;
    const { isStandalone, isMobile } = useUserAgent();
    const [opacity, setOpacity] = useState(0);
    const toast = useToast();

    const timeoutRef = useRef<number | NodeJS.Timeout | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleOpacity = () => {
      setOpacity(1); // Set opacity to 1 on touch
      // Clear any existing timeout to prevent it from resetting opacity prematurely
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }

      // Set a new timeout and store its ID in the ref
      timeoutRef.current = setTimeout(() => {
        setOpacity(0); // Change back to 0 after 3 seconds
        timeoutRef.current = null; // Reset the ref after the timeout completes
      }, 2000);
    };

    const handleCopy = () => {
      toast({
        title: "copied to clipboard",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    };

    if (!src) {
      return (
        <Flex
          width="100%"
          height="100%"
          backgroundColor={"black"}
          position="relative"
          borderRadius={borderRadius}
        >
          <Flex
            style={{
              position: "absolute",
              transform: "translate(-50%, -50%)",
              top: "50%",
              left: "50%",
            }}
          >
            <Spinner />
          </Flex>
        </Flex>
      );
    }
    return (
      <Flex
        direction="column"
        width={customSizePercentages?.width ?? "100%"}
        height={customSizePercentages?.height ?? "100%"}
        position="relative"
        onTouchStart={handleOpacity} // Handle touch event
        onMouseMove={handleOpacity} // Set opacity to 1 on mouse enter
        transition="all 0.3s"
      >
        <Player.Root
          aspectRatio={null}
          src={src}
          autoPlay
          onError={(e) => {
            if (
              e?.message &&
              e?.message?.length > 0 &&
              e?.type === "unknown" &&
              !safeIncludes(unacceptedErrors, e?.message)
            ) {
              console.log("Error playing video", JSON.stringify(e));
              setError(JSON.stringify(e));
            }
          }}
        >
          <Player.Container
            style={{
              backgroundColor: "black",
              width: "100%",
              height: "100%",
              borderRadius: borderRadius,
            }}
          >
            <Player.Video
              muted
              style={{
                height: "100%",
                margin: "auto",
                objectFit: "contain",
              }}
            />
            <Player.LoadingIndicator
              asChild
              style={{
                position: "absolute",
                transform: "translate(-50%, -50%)",
                top: "50%",
                left: "50%",
              }}
            >
              <Flex justifyContent={"center"}>
                <Spinner size="lg" />
              </Flex>
            </Player.LoadingIndicator>

            <Flex
              style={{
                position: "absolute",
                transform: "translate(-50%, -50%)",
                top: "50%",
                left: "50%",
              }}
            >
              <Player.PlayingIndicator asChild matcher={false}>
                <PlayIcon
                  style={{
                    width: isPreview ? 25 : 100,
                    height: isPreview ? 25 : 100,
                  }}
                />
              </Player.PlayingIndicator>
              <Player.VolumeIndicator asChild matcher={false}>
                <MuteIcon
                  style={{
                    width: isPreview ? 25 : 100,
                    height: isPreview ? 25 : 100,
                  }}
                />
              </Player.VolumeIndicator>
            </Flex>
            <Player.ErrorIndicator
              matcher="all"
              asChild
              style={{
                position: "absolute",
                transform: "translate(-50%, -50%)",
                top: "50%",
                left: "50%",
              }}
            >
              <Flex
                bg="black"
                style={{
                  width: "100%",
                  height: "100%",
                }}
                borderRadius={borderRadius}
              >
                <Flex
                  direction="column"
                  margin="auto"
                  alignItems={"center"}
                  p="5px"
                  gap="10px"
                >
                  {error ? (
                    <>
                      {isMobile || isStandalone ? (
                        <Flex justifyContent={"center"} direction="column">
                          <Text textAlign="center">
                            {JSON.parse(error).message}
                          </Text>
                        </Flex>
                      ) : (
                        <>
                          <Text
                            textAlign="center"
                            fontSize={
                              isPreview
                                ? ["1rem", "1rem", "2rem", "2rem"]
                                : !isStandalone
                                ? "3rem"
                                : "1rem"
                            }
                            fontFamily={"LoRes15"}
                          >
                            Error detected while playing video
                          </Text>
                          <Text textAlign="center">
                            {JSON.parse(error).message}
                          </Text>
                          <Button
                            color="white"
                            width="100%"
                            bg="#b82929"
                            onClick={() => {
                              copy(error);
                              handleCopy();
                            }}
                            _focus={{}}
                            _hover={{ background: "#f25719" }}
                          >
                            copy error
                          </Button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Text
                        textAlign="center"
                        fontSize={
                          isPreview
                            ? ["1rem", "1rem", "2rem", "2rem"]
                            : !isStandalone
                            ? "3rem"
                            : "1rem"
                        }
                        fontFamily={"LoRes15"}
                      >
                        stream offline
                      </Text>
                      {!isPreview && !cannotOpenClipDrawer && (
                        <>
                          <Text textAlign="center">
                            open here to catch up on clips from recent streams
                          </Text>
                          <IconButton
                            _focus={{}}
                            _active={{}}
                            icon={
                              showClipDrawer ? (
                                <SlArrowUp size="25px" />
                              ) : (
                                <SlArrowDown size="25px" />
                              )
                            }
                            aria-label="open-clip-drawer"
                            borderRadius={"100%"}
                            bg="rgba(63, 59, 253, 1)"
                            color="rgba(55, 255, 139, 1)"
                            onClick={() => handleClipDrawer(true)}
                          />
                        </>
                      )}
                    </>
                  )}
                </Flex>
              </Flex>
            </Player.ErrorIndicator>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                opacity,
                transition: "opacity 0.5s",
                background:
                  "linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.9))",
              }}
            >
              <Player.PlayPauseTrigger
                style={{
                  width: 25,
                  height: 25,
                }}
              >
                <Player.PlayingIndicator asChild matcher={false}>
                  <PlayIcon />
                </Player.PlayingIndicator>
                <Player.PlayingIndicator asChild>
                  <PauseIcon />
                </Player.PlayingIndicator>
              </Player.PlayPauseTrigger>
              <Player.MuteTrigger
                style={{
                  width: 25,
                  height: 25,
                }}
              >
                <Player.VolumeIndicator asChild matcher={false}>
                  <MuteIcon />
                </Player.VolumeIndicator>
                <Player.VolumeIndicator asChild matcher={true}>
                  <UnmuteIcon />
                </Player.VolumeIndicator>
              </Player.MuteTrigger>
              <Player.Volume
                style={{
                  position: "relative",
                  display: "flex",
                  flexGrow: 1,
                  height: 25,
                  alignItems: "center",
                  maxWidth: 120,
                  touchAction: "none",
                  userSelect: "none",
                }}
              >
                <Player.Track
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    position: "relative",
                    flexGrow: 1,
                    borderRadius: 9999,
                    height: "2px",
                  }}
                >
                  <Player.Range
                    style={{
                      position: "absolute",
                      backgroundColor: "white",
                      borderRadius: 9999,
                      height: "100%",
                    }}
                  />
                </Player.Track>
                <Player.Thumb
                  style={{
                    display: "block",
                    width: 12,
                    height: 12,
                    backgroundColor: "white",
                    borderRadius: 9999,
                  }}
                />
              </Player.Volume>
              {!isPreview && (
                <>
                  <Player.PictureInPictureTrigger
                    style={{
                      width: 25,
                      height: 25,
                    }}
                  >
                    <PictureInPictureIcon />
                  </Player.PictureInPictureTrigger>
                  <Player.FullscreenTrigger
                    style={{
                      position: "absolute",
                      right: 20,
                      width: 25,
                      height: 25,
                    }}
                  >
                    <Player.FullscreenIndicator asChild matcher={false}>
                      <EnterFullscreenIcon />
                    </Player.FullscreenIndicator>
                    <Player.FullscreenIndicator asChild>
                      <ExitFullscreenIcon />
                    </Player.FullscreenIndicator>
                  </Player.FullscreenTrigger>
                </>
              )}
            </div>
          </Player.Container>
        </Player.Root>
      </Flex>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.src === nextProps.src;
  }
);

export default LivepeerPlayer;
