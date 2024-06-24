import { useMemo } from "react";
import { useChannelContext } from "../../hooks/context/useChannel";
import { TransactionModalTemplate } from "../transactions/TransactionModalTemplate";
import { Box, Button, Code, Text, useToast } from "@chakra-ui/react";
import copy from "copy-to-clipboard";

export default function EmbedVideoModal({
  title,
  isOpen,
  callback,
  handleClose,
}: {
  title: string;
  isOpen: boolean;
  callback?: any;
  handleClose: () => void;
}) {
  const { channel } = useChannelContext();
  const { channelQueryData } = channel;

  const toast = useToast();
  const handleCopy = () => {
    toast({
      title: "copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const playbackId = useMemo(() => {
    return channelQueryData?.livepeerPlaybackId;
  }, [channelQueryData]);

  return (
    <TransactionModalTemplate
      title={title}
      isOpen={isOpen}
      handleClose={handleClose}
      hideFooter
      size="2xl"
    >
      {playbackId && channelQueryData?.slug && (
        <>
          <Text fontSize="sm" mb={4}>
            Insert this video player iframe onto your website.
          </Text>
          <Box position={"relative"}>
            <Button
              position="absolute"
              right={4}
              top={4}
              onClick={() => {
                copy(createIFrame(playbackId, channelQueryData?.slug));
                handleCopy();
              }}
            >
              copy
            </Button>
            <Code
              overflowY={"scroll"}
              height="400px"
              p={4}
              display="block"
              whiteSpace="pre-wrap"
              background="rgba(5, 0, 31, 1)"
              color="rgb(55, 255, 139)"
            >
              {createIFrame(playbackId, channelQueryData?.slug)}
            </Code>
          </Box>
        </>
      )}
    </TransactionModalTemplate>
  );
}

const createIFrame = (playbackId: string, slug: string) => {
  return `<iframe
    srcdoc='<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Player</title>
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap");
      body, html {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #000;
        color: #fff;
        font-family: "Space Mono", monospace;
      }
      iframe {
        width: 100%;
        height: 100%;
      }
      .button-container {
        position: absolute;
        right: 0;
        top: 0;
      }
      .redirect-button {
        padding: 10px 20px;
        background-color: #37FF8B;
        border: none;
        color: #000;
        cursor: pointer;
        font-size: 16px;
        border-radius: 5px;
        font-family: "Space Mono", monospace;
        display: flex;
        align-items: center;
        font-weight: bold;
      }
      .redirect-button:hover {
        background-color: #26ffa8;
      }
      .redirect-button img {
        margin-right: 10px;
        width: 20px;
        height: 20px;
      }
    </style>
  </head>
  <body>
    <iframe
      src="https://lvpr.tv?v=${playbackId}"
      allowfullscreen
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      frameborder="0"
    ></iframe>
    <div class="button-container">
      <button class="redirect-button" onclick="redirectToApp()">
        <img src="https://www.unlonely.app/icons/icon-192x192.png" alt="Icon">
        Watch on Unlonely
      </button>
    </div>
    <script>
      function redirectToApp() {
        window.top.location.href = "https://unlonely.app/channels/${slug}";
      }
    </script>
  </body>
  </html>'
    allowfullscreen
    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
    frameborder="0"
    width="100%"
    height="100%"
  >
  </iframe>`;
};
