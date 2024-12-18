import { ApolloError } from "@apollo/client";
import { Flex, Text, Image, useToast, Button, Stack } from "@chakra-ui/react";
import { useEffect } from "react";
import { ChannelStaticQuery } from "../../../generated/graphql";
import { useChat } from "../../../hooks/chat/useChat";
import { useChannelContext } from "../../../hooks/context/useChannel";
import { WavyText } from "../../general/WavyText";
import AppLayout from "../../layout/AppLayout";
import ChannelNextHead from "../../layout/ChannelNextHead";
import ChannelStreamerPerspective from "./ChannelStreamerPerspective";
import StandaloneChatComponent from "../../mobile/StandAloneChatComponent";
import { ChannelWideModals } from "../ChannelWideModals";
import copy from "copy-to-clipboard";
import trailString from "../../../utils/trailString";
import { useLivepeerStreamData } from "../../../hooks/internal/useLivepeerStreamData";
import { useVipBadgeUi } from "../../../hooks/internal/useVipBadgeUi";
import { formatApolloError } from "../../../utils/errorFormatting";
import StreamComponent from "../../stream/StreamComponent";
import { useTempTokenAblyInterpreter } from "../../../hooks/internal/temp-token/ui/useTempTokenAblyInterpreter";
import { useVersusTempTokenAblyInterpreter } from "../../../hooks/internal/versus-token/ui/useVersusTempTokenAblyInterpreter";

export const MobilePage = ({
  channelSSR,
  channelSSRDataLoading,
  channelSSRDataError,
}: {
  channelSSR: ChannelStaticQuery["getChannelBySlug"];
  channelSSRDataLoading: boolean;
  channelSSRDataError?: ApolloError;
}) => {
  const { channel, chat: c } = useChannelContext();
  const {
    error: channelDataError,
    isOwner,
    handleChannelStaticData,
    channelQueryData,
  } = channel;
  const toast = useToast();
  const { livepeerData, playbackInfo, checkedForLivepeerPlaybackInfo } =
    useLivepeerStreamData({
      livepeerStreamId: channelQueryData?.livepeerStreamId ?? undefined,
      livepeerPlaybackId: channelQueryData?.livepeerPlaybackId ?? undefined,
    });
  const chat = useChat({ chatBot: c.chatBot });
  useVipBadgeUi(chat);
  useTempTokenAblyInterpreter(chat);
  useVersusTempTokenAblyInterpreter(chat);

  useEffect(() => {
    if (channelSSR) handleChannelStaticData(channelSSR);
  }, [channelSSR]);

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
      <AppLayout
        title={channelSSR?.name}
        image={channelSSR?.owner?.FCImageUrl}
        pageUrl={`/channels/${channelSSR?.slug}`}
        description={channelSSR?.description}
        isCustomHeader={true}
      >
        {!channelDataError && !channelSSRDataError && !channelSSRDataLoading ? (
          <>
            {isOwner ? (
              <>
                <ChannelWideModals ablyChannel={chat.channel} />
                {checkedForLivepeerPlaybackInfo && (
                  <ChannelStreamerPerspective
                    livepeerData={livepeerData}
                    ablyChannel={chat.channel}
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
                  />
                )}
              </>
            ) : (
              <Stack direction="column" width={"100%"} position={"fixed"}>
                <Flex width={"100%"} position="relative">
                  {checkedForLivepeerPlaybackInfo && (
                    <StreamComponent
                      playbackData={
                        playbackInfo
                          ? {
                              infra: "livepeer",
                              livepeerPlaybackInfo: playbackInfo,
                            }
                          : { infra: "aws" }
                      }
                    />
                  )}
                </Flex>
              </Stack>
            )}
            <StandaloneChatComponent
              chat={chat}
              channelStaticError={channelSSRDataLoading}
              channelStaticLoading={channelSSRDataError}
            />
          </>
        ) : (
          <Flex
            alignItems={"center"}
            justifyContent={"center"}
            direction="column"
            width="100%"
            height="100vh"
            fontSize="50px"
          >
            {!channelDataError && !channelSSRDataError ? (
              <>
                <Image
                  src="/icons/icon-192x192.png"
                  borderRadius="10px"
                  height="96px"
                />
                <Flex>
                  <WavyText text="..." />
                </Flex>
              </>
            ) : channelSSR === null ? (
              <Text fontFamily="LoRes15">channel does not exist</Text>
            ) : (
              <Flex direction="column" gap="10px" justifyContent="center">
                <Text fontFamily="LoRes15" textAlign={"center"} fontSize="50px">
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
      </AppLayout>
    </>
  );
};
