import {
  DisableAudioIcon,
  DisableVideoIcon,
  EnableAudioIcon,
  EnableVideoIcon,
  StartScreenshareIcon,
  StopIcon,
  StopScreenshareIcon,
} from "@livepeer/react/assets";
import * as Broadcast from "@livepeer/react/broadcast";
import { getIngest } from "@livepeer/react/external";
import { memo, forwardRef } from "react";
import { Flex, Spinner } from "@chakra-ui/react";
import { CheckIcon, ChevronDownIcon } from "@chakra-ui/icons";

const LivepeerBroadcast = memo(
  ({ streamKey }: { streamKey: string }) => {
    return (
      <Flex direction="column" width="100%" position="relative">
        <Broadcast.Root
          audio={false}
          video={false}
          aspectRatio={null}
          ingestUrl={getIngest(streamKey)}
        >
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
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.6))",
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
                      <EnableVideoIcon />
                    </Broadcast.EnabledIndicator>
                    <Broadcast.EnabledIndicator asChild>
                      <StopIcon />
                    </Broadcast.EnabledIndicator>
                  </Broadcast.EnabledTrigger>

                  <Broadcast.VideoEnabledTrigger
                    style={{
                      width: 25,
                      height: 25,
                    }}
                  >
                    <Broadcast.VideoEnabledIndicator asChild matcher={false}>
                      <EnableVideoIcon />
                    </Broadcast.VideoEnabledIndicator>
                    <Broadcast.VideoEnabledIndicator asChild>
                      <DisableVideoIcon />
                    </Broadcast.VideoEnabledIndicator>
                  </Broadcast.VideoEnabledTrigger>

                  <Broadcast.AudioEnabledTrigger
                    style={{
                      width: 25,
                      height: 25,
                    }}
                  >
                    <Broadcast.AudioEnabledIndicator asChild matcher={false}>
                      <EnableAudioIcon />
                    </Broadcast.AudioEnabledIndicator>
                    <Broadcast.AudioEnabledIndicator asChild>
                      <DisableAudioIcon />
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
                    <Broadcast.ScreenshareIndicator asChild>
                      <StopScreenshareIcon />
                    </Broadcast.ScreenshareIndicator>
                  </Broadcast.ScreenshareTrigger>
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
                    <SourceSelectComposed
                      name="microphoneSource"
                      type="audioinput"
                    />
                  </div>
                </div>
              </div>
            </Broadcast.Controls>

            <Broadcast.LoadingIndicator asChild matcher={false}>
              <Flex p="5px">
                <Broadcast.StatusIndicator
                  matcher="live"
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
                  <span style={{ fontSize: 12, userSelect: "none" }}>LIVE</span>
                </Broadcast.StatusIndicator>

                <Broadcast.StatusIndicator
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                  matcher="pending"
                >
                  <Spinner />
                </Broadcast.StatusIndicator>

                <Broadcast.StatusIndicator
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
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
                  <span style={{ fontSize: 12, userSelect: "none" }}>IDLE</span>
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
                backgroundColor: "rgba(0, 0, 0, 0.7)",
              }}
              aria-label={type === "audioinput" ? "Audio input" : "Video input"}
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
