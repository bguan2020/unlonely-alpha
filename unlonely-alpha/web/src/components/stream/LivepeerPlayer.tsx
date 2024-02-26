import { memo } from "react";
import { Flex, Spinner, Text } from "@chakra-ui/react";
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

const LivepeerPlayer = memo(
  ({ src }: { src: Src[] | null }) => {
    if (!src) {
      return (
        <Flex
          width="100%"
          height="100%"
          backgroundColor={"black"}
          position="relative"
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
      <Flex direction="column" width="100%" position="relative">
        <Player.Root aspectRatio={null} src={src} autoPlay>
          <Player.Container
            style={{
              backgroundColor: "black",
              width: "100%",
              height: "100%",
            }}
          >
            <Player.Video
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
              >
                <Flex
                  direction="column"
                  margin="auto"
                  alignItems={"center"}
                  p="5"
                >
                  <Text
                    textAlign="center"
                    fontSize={"3rem"}
                    fontFamily={"LoRes15"}
                  >
                    Stream is offline
                  </Text>
                  <Text textAlign="center">
                    Playback will start automatically once the stream has
                    started
                  </Text>
                </Flex>
              </Flex>
            </Player.ErrorIndicator>

            <Player.Controls
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.6))",
                padding: "0.5rem 1rem",
                display: "flex",
                flexDirection: "column-reverse",
                gap: 5,
              }}
              autoHide={200}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "between",
                  gap: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    alignItems: "center",
                    gap: 10,
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

                  <Player.LiveIndicator
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <div
                      style={{
                        backgroundColor: "#ef4444",
                        height: 8,
                        width: 8,
                        borderRadius: 9999,
                      }}
                    />
                    <span style={{ fontSize: 12, userSelect: "none" }}>
                      LIVE
                    </span>
                  </Player.LiveIndicator>

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
                </div>
              </div>
            </Player.Controls>
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
