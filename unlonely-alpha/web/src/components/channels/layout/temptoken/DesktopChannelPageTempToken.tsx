import { ApolloError } from "@apollo/client";
import { ChannelStaticQuery } from "../../../../generated/graphql";
import { useChannelContext } from "../../../../hooks/context/useChannel";
import { useChat } from "../../../../hooks/chat/useChat";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "../../../../hooks/context/useUser";
import ChannelNextHead from "../../../layout/ChannelNextHead";
import { Stack, Flex, Text, Button, useToast } from "@chakra-ui/react";
import { WavyText } from "../../../general/WavyText";
import { ChannelWideModals } from "../../ChannelWideModals";
import { DesktopChannelViewerPerspectiveSimplified } from "./DesktopChannelViewerPerspectiveSimplified";
import ChatComponent from "../../../chat/ChatComponent";
import { DesktopChannelStreamerPerspectiveSimplified } from "./DesktopChannelStreamerPerspectiveSimplified";
import { TempTokenInterface } from "../../temp/TempTokenInterface";
import Header from "../../../navigation/Header";
import trailString from "../../../../utils/trailString";
import copy from "copy-to-clipboard";
import { useTempTokenContext } from "../../../../hooks/context/useTempToken";
import { useVipBadgeUi } from "../../../../hooks/internal/useVipBadgeUi";
import { useLivepeerStreamData } from "../../../../hooks/internal/useLivepeerStreamData";
import { CreateTokenInterface } from "./CreateTempTokenInterface";
import { formatApolloError } from "../../../../utils/errorFormatting";
import { useTempTokenAblyInterpreter } from "../../../../hooks/internal/temp-token/ui/useTempTokenAblyInterpreter";

export const DesktopChannelPageTempToken = ({
  channelSSR,
  channelSSRDataLoading,
  channelSSRDataError,
}: {
  channelSSR: ChannelStaticQuery["getChannelBySlug"];
  channelSSRDataLoading: boolean;
  channelSSRDataError?: ApolloError;
}) => {
  const { walletIsConnected } = useUser();
  const { channel } = useChannelContext();
  const { tempToken } = useTempTokenContext();
  const chat = useChat();
  const {
    loading: channelDataLoading,
    error: channelDataError,
    handleChannelStaticData,
    isOwner,
  } = channel;
  const { currentActiveTokenEndTimestamp, canPlayToken } = tempToken;
  const toast = useToast();
  const { livepeerData, playbackInfo } = useLivepeerStreamData();
  useVipBadgeUi(chat);
  useTempTokenAblyInterpreter(chat);
  useEffect(() => {
    if (channelSSR) handleChannelStaticData(channelSSR);
  }, [channelSSR]);

  const [shouldRenderTempTokenInterface, setShouldRenderTempTokenInterface] =
    useState(false);

  /**
   * if there is an existing token, render the temp token interface
   */

  useEffect(() => {
    if (!currentActiveTokenEndTimestamp) {
      setShouldRenderTempTokenInterface(false);
      return;
    }
    const decideRender = () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const shouldRender =
        currentTime <= Number(currentActiveTokenEndTimestamp) &&
        currentActiveTokenEndTimestamp !== BigInt(0);
      setShouldRenderTempTokenInterface(shouldRender);
    };

    // Initial update
    decideRender();

    const interval = setInterval(() => {
      decideRender();
      clearInterval(interval);
    }, 5 * 1000); // Check every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [currentActiveTokenEndTimestamp]);

  const canShowInterface = useMemo(() => {
    return (
      !channelDataLoading &&
      !channelDataError &&
      !channelSSRDataError &&
      !channelSSRDataLoading
    );
  }, [
    channelDataLoading,
    channelDataError,
    channelSSRDataError,
    channelSSRDataLoading,
  ]);

  const handleCopy = () => {
    toast({
      title: "copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <>
      {channelSSR && <ChannelNextHead channel={channelSSR} />}
      <Flex
        h="100vh"
        bg="rgba(5, 0, 31, 1)"
        position={"relative"}
        overflowY={"hidden"}
      >
        {canShowInterface ? (
          <Flex direction="column" width="100%">
            <Header />
            <Stack
              height="100%"
              alignItems={["center", "initial"]}
              direction={["column", "column", "row", "row"]}
              gap="0"
              width="100%"
            >
              <Flex direction="column" width={"100%"} height="100%">
                {isOwner && walletIsConnected ? (
                  <>
                    <ChannelWideModals ablyChannel={chat.channel} />
                    <DesktopChannelStreamerPerspectiveSimplified
                      ablyChannel={chat.channel}
                      livepeerData={livepeerData}
                      playbackData={
                        playbackInfo
                          ? {
                              infra: "livepeer",
                              livepeerPlaybackInfo: playbackInfo,
                            }
                          : {
                              infra: "aws",
                            }
                      }
                      mode={
                        shouldRenderTempTokenInterface
                          ? "single-temp-token"
                          : ""
                      }
                    />
                  </>
                ) : (
                  <DesktopChannelViewerPerspectiveSimplified
                    playbackData={
                      playbackInfo
                        ? {
                            infra: "livepeer",
                            livepeerPlaybackInfo: playbackInfo,
                          }
                        : {
                            infra: "aws",
                          }
                    }
                    chat={chat}
                    mode={canPlayToken ? "single-temp-token" : ""}
                  />
                )}
              </Flex>
              {canPlayToken && (
                <Flex
                  direction="column"
                  minW={["100%", "100%", "500px", "500px"]}
                  maxW={["100%", "100%", "500px", "500px"]}
                  gap="1rem"
                >
                  <TempTokenInterface
                    ablyChannel={chat.channel}
                    customHeight="100%"
                  />
                </Flex>
              )}
              {!canPlayToken && (
                <Flex
                  direction="column"
                  minW={["100%", "100%", "380px", "380px"]}
                  maxW={["100%", "100%", "380px", "380px"]}
                  gap="1rem"
                >
                  {isOwner && walletIsConnected ? (
                    <>
                      {shouldRenderTempTokenInterface ? (
                        <TempTokenInterface
                          ablyChannel={chat.channel}
                          customHeight="30%"
                        />
                      ) : (
                        <Flex
                          gap="5px"
                          justifyContent={"center"}
                          alignItems={"center"}
                          bg="#131323"
                          p="5px"
                          height="20vh"
                        >
                          <CreateTokenInterface />
                        </Flex>
                      )}
                      <ChatComponent
                        chat={chat}
                        customHeight={"100%"}
                        tokenForTransfer="tempToken"
                      />
                    </>
                  ) : (
                    <>
                      {shouldRenderTempTokenInterface && (
                        <TempTokenInterface
                          ablyChannel={chat.channel}
                          customHeight="30%"
                        />
                      )}
                      <ChatComponent
                        chat={chat}
                        customHeight={"100%"}
                        tokenForTransfer="tempToken"
                      />
                    </>
                  )}
                </Flex>
              )}
            </Stack>
          </Flex>
        ) : (
          <Flex
            alignItems={"center"}
            justifyContent={"center"}
            width="100%"
            height="calc(100vh)"
            fontSize="50px"
          >
            {!channelDataError && !channelSSRDataError ? (
              <WavyText text="loading..." />
            ) : channelSSR === null ? (
              <Text fontFamily="LoRes15">channel does not exist</Text>
            ) : (
              <Flex direction="column" gap="10px" justifyContent="center">
                <Text fontFamily="LoRes15" textAlign={"center"}>
                  server error, please try again later
                </Text>
                {channelDataError && (
                  <Flex justifyContent={"center"} direction="column">
                    <Text textAlign={"center"} fontSize="12px">
                      {trailString(formatApolloError(channelDataError), 25)}
                    </Text>
                    <Button
                      _focus={{}}
                      _active={{}}
                      _hover={{
                        transform: "scale(1.1)",
                      }}
                      onClick={() => {
                        copy(formatApolloError(channelDataError));
                        handleCopy();
                      }}
                      color="white"
                      bg="#e2461f"
                      mx="auto"
                    >
                      copy full error
                    </Button>
                  </Flex>
                )}
              </Flex>
            )}
          </Flex>
        )}
      </Flex>
    </>
  );
};
