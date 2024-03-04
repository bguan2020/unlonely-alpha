import {
  DisableAudioIcon,
  DisableVideoIcon,
  EnableAudioIcon,
  EnableVideoIcon,
  PlayIcon,
  StartScreenshareIcon,
  StopIcon,
  StopScreenshareIcon,
} from "@livepeer/react/assets";
import * as Broadcast from "@livepeer/react/broadcast";
import { getIngest } from "@livepeer/react/external";
import { memo, forwardRef } from "react";
import { Flex, Spinner } from "@chakra-ui/react";
import { CheckIcon, ChevronDownIcon } from "@chakra-ui/icons";
import useUserAgent from "../../hooks/internal/useUserAgent";

const LivepeerBroadcast = memo(
  ({ streamKey }: { streamKey: string }) => {
    const { isStandalone } = useUserAgent();

    return (
      <Flex direction="column" width="100%" position="relative">
        <Broadcast.Root aspectRatio={null} ingestUrl={getIngest(streamKey)}>
          <Broadcast.Container
            style={{
              backgroundColor: "black",
              width: "100%",
              height: "100%",
            }}
          >
            <Broadcast.Video
              style={{
                height: "100%",
                margin: "auto",
                objectFit: "contain",
              }}
            />

            <Broadcast.Controls
              autoHide={0}
              style={{
                padding: "0.5rem 1rem",
                display: "flex",
                flexDirection: "column-reverse",
                gap: 5,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "between",
                  gap: 20,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  padding: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    alignItems: "center",
                    gap: 15,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flex: 1,
                      alignItems: "center",
                      gap: 15,
                    }}
                  >
                    <Broadcast.EnabledTrigger
                      style={{
                        width: 25,
                        height: 25,
                      }}
                    >
                      <Broadcast.EnabledIndicator asChild matcher={false}>
                        <PlayIcon />
                      </Broadcast.EnabledIndicator>
                      <Broadcast.EnabledIndicator
                        asChild
                        style={{
                          color: "#ff6868",
                        }}
                      >
                        <StopIcon />
                      </Broadcast.EnabledIndicator>
                    </Broadcast.EnabledTrigger>

                    <Broadcast.VideoEnabledTrigger
                      style={{
                        width: 25,
                        height: 25,
                      }}
                    >
                      <Broadcast.VideoEnabledIndicator
                        asChild
                        matcher={false}
                        style={{
                          color: "#ff6868",
                        }}
                      >
                        <DisableVideoIcon />
                      </Broadcast.VideoEnabledIndicator>
                      <Broadcast.VideoEnabledIndicator asChild>
                        <EnableVideoIcon />
                      </Broadcast.VideoEnabledIndicator>
                    </Broadcast.VideoEnabledTrigger>

                    <Broadcast.AudioEnabledTrigger
                      style={{
                        width: 25,
                        height: 25,
                      }}
                    >
                      <Broadcast.AudioEnabledIndicator
                        asChild
                        matcher={false}
                        style={{
                          color: "#ff6868",
                        }}
                      >
                        <DisableAudioIcon />
                      </Broadcast.AudioEnabledIndicator>
                      <Broadcast.AudioEnabledIndicator asChild>
                        <EnableAudioIcon />
                      </Broadcast.AudioEnabledIndicator>
                    </Broadcast.AudioEnabledTrigger>

                    <Broadcast.ScreenshareTrigger
                      style={{
                        width: 25,
                        height: 25,
                      }}
                    >
                      <Broadcast.ScreenshareIndicator asChild matcher={false}>
                        <StartScreenshareIcon />
                      </Broadcast.ScreenshareIndicator>
                      <Broadcast.ScreenshareIndicator
                        asChild
                        style={{
                          color: "#68acff",
                        }}
                      >
                        <StopScreenshareIcon />
                      </Broadcast.ScreenshareIndicator>
                    </Broadcast.ScreenshareTrigger>
                  </div>
                  <div
                    style={{
                      left: 20,
                      bottom: 20,
                      display: "flex",
                      gap: 10,
                    }}
                  >
                    <SourceSelectComposed
                      name="cameraSource"
                      type="videoinput"
                    />
                    {!isStandalone && (
                      <SourceSelectComposed
                        name="microphoneSource"
                        type="audioinput"
                      />
                    )}
                  </div>
                </div>
              </div>
            </Broadcast.Controls>

            <Broadcast.LoadingIndicator asChild matcher={false}>
              <Flex p="5px">
                <Broadcast.StatusIndicator
                  matcher="live"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    zIndex: 1,
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#ef4444",
                      height: 10,
                      width: 10,
                      borderRadius: 9999,
                    }}
                  />
                  <span style={{ fontSize: 22, userSelect: "none" }}>LIVE</span>
                </Broadcast.StatusIndicator>

                <Broadcast.StatusIndicator
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    zIndex: 1,
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                  }}
                  matcher="pending"
                >
                  <Spinner />
                </Broadcast.StatusIndicator>

                <Broadcast.StatusIndicator
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    zIndex: 1,
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                  }}
                  matcher="idle"
                >
                  <div
                    style={{
                      backgroundColor: "#aaaaaa",
                      height: 8,
                      width: 8,
                      borderRadius: 9999,
                    }}
                  />
                  <span style={{ fontSize: 22, userSelect: "none" }}>IDLE</span>
                </Broadcast.StatusIndicator>
              </Flex>
            </Broadcast.LoadingIndicator>
          </Broadcast.Container>
        </Broadcast.Root>
      </Flex>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.streamKey === nextProps.streamKey;
  }
);

const SourceSelectComposed = forwardRef(
  (
    { name, type }: { name: string; type: "audioinput" | "videoinput" },
    ref: React.Ref<HTMLButtonElement> | undefined
  ) => (
    <Broadcast.SourceSelect name={name} type={type}>
      {(devices) =>
        devices ? (
          <>
            {devices.length > 0 ? (
              <>
                <Broadcast.SelectTrigger
                  ref={ref}
                  style={{
                    minWidth: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: 30,
                    fontSize: 12,
                    gap: 5,
                    padding: 10,
                    borderRadius: 5,
                    outline: "white solid 1px",
                  }}
                  aria-label={
                    type === "audioinput" ? "Audio input" : "Video input"
                  }
                >
                  <Broadcast.SelectValue
                    placeholder={
                      type === "audioinput"
                        ? "Select audio input"
                        : "Select video input"
                    }
                  />
                  <Broadcast.SelectIcon>
                    <ChevronDownIcon style={{ width: 14, height: 14 }} />
                  </Broadcast.SelectIcon>
                </Broadcast.SelectTrigger>
                <Broadcast.SelectPortal>
                  <Broadcast.SelectContent
                    style={{
                      borderRadius: 5,
                      zIndex: 5,
                      backgroundColor: "black",
                    }}
                  >
                    <Broadcast.SelectViewport style={{ padding: 5 }}>
                      <Broadcast.SelectGroup>
                        {devices?.map((device) => (
                          <SourceSelectItem
                            key={device.deviceId}
                            value={device.deviceId}
                          >
                            {device.friendlyName}
                          </SourceSelectItem>
                        ))}
                      </Broadcast.SelectGroup>
                    </Broadcast.SelectViewport>
                  </Broadcast.SelectContent>
                </Broadcast.SelectPortal>
              </>
            ) : null}
          </>
        ) : (
          <span>There was an error fetching the available devices.</span>
        )
      }
    </Broadcast.SourceSelect>
  )
);

const SourceSelectItem = forwardRef<HTMLDivElement, Broadcast.SelectItemProps>(
  ({ children, ...props }, forwardedRef) => {
    return (
      <Broadcast.SelectItem
        style={{
          fontSize: 12,
          borderRadius: 5,
          display: "flex",
          alignItems: "center",
          paddingRight: 35,
          paddingLeft: 25,
          position: "relative",
          userSelect: "none",
          height: 30,
        }}
        {...props}
        ref={forwardedRef}
      >
        <Broadcast.SelectItemText>{children}</Broadcast.SelectItemText>
        <Broadcast.SelectItemIndicator
          style={{
            position: "absolute",
            left: 0,
            width: 25,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckIcon style={{ width: 14, height: 14 }} />
        </Broadcast.SelectItemIndicator>
      </Broadcast.SelectItem>
    );
  }
);

export default LivepeerBroadcast;
