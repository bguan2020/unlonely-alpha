import { useLazyQuery } from "@apollo/client";
import { GET_STREAM_INTERACTIONS_QUERY } from "../constants/queries";
import { useCallback, useEffect, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { Button, Flex, Text } from "@chakra-ui/react";
import useUpdateStreamInteraction from "../hooks/server/channel/useUpdateStreamInteraction";
import { InteractionType as BackendInteractionType } from "../generated/graphql";
import io from "socket.io-client";

let socket;

const Tts = () => {
  const [audioQueue, setAudioQueue] = useState<string[]>([]);

  const [call] = useLazyQuery(GET_STREAM_INTERACTIONS_QUERY, {
    fetchPolicy: "network-only",
  });

  const { updateStreamInteraction } = useUpdateStreamInteraction({});

  const [receivedInteractions, setReceivedInteractions] = useState<
    { id: string; text?: string }[]
  >([]);

  const getStreamInteractions = useCallback(async () => {
    const { data: ttsInteractions } = await call({
      variables: {
        data: {
          channelId: "3",
          interactionType: BackendInteractionType.TtsInteraction,
          orderBy: "desc",
          softDeleted: false,
        },
      },
    });
    const _receivedInteractions = ttsInteractions?.getStreamInteractions.map(
      (interaction: any) => {
        return {
          id: interaction.id,
          text: interaction.text,
        };
      }
    );
    setReceivedInteractions(_receivedInteractions);
  }, []);

  useEffect(() => {
    getStreamInteractions();
  }, []);

  const playAndRemoveInteraction = async (
    interaction: {
      id: string;
      text?: string;
    },
    doNotPlay: boolean
  ) => {
    await updateStreamInteraction({
      interactionId: interaction.id,
      softDeleted: true,
    });
    setReceivedInteractions((prevInteractions) =>
      prevInteractions.filter(
        (_interaction) => _interaction.id !== interaction.id
      )
    );

    if (!interaction.text || doNotPlay) return;
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        textToSpeak: interaction.text,
      }),
    });

    const data = await response.json();

    if (data.success) {
      const base64Audio = `data:audio/mp3;base64,${data.audio}`;
      setAudioQueue((prevQueue) => [...prevQueue, base64Audio]); // Add to local queue
    }
  };

  return (
    <AppLayout isCustomHeader={true}>
      <AudioPlayer audioUrlQueue={audioQueue} setAudioQueue={setAudioQueue} />
      <Flex direction={"column"} gap="4px" p="20px" flexWrap="wrap">
        {receivedInteractions.map((interaction) => (
          <Flex
            key={interaction.id}
            backgroundColor="#212e6f"
            p="10px"
            borderRadius="15px"
            justifyContent={"space-between"}
          >
            <Text>{interaction.text}</Text>
            <Flex gap="4px">
              <Button
                bg={"blue.500"}
                color="white"
                _hover={{ bg: "blue.600" }}
                onClick={() => playAndRemoveInteraction(interaction, false)}
              >
                Play and remove
              </Button>
              <Button
                bg="red.500"
                color="white"
                _hover={{ bg: "red.600" }}
                onClick={() => playAndRemoveInteraction(interaction, true)}
              >
                Remove
              </Button>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </AppLayout>
  );
};

export default Tts;

const AudioPlayer = ({
  audioUrlQueue,
  setAudioQueue,
}: {
  audioUrlQueue: string[];
  setAudioQueue: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SOCKET_URL) return;
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

    // Listen for play-audio events from the server
    socket.on("play-audio", (data) => {
      const audio: string = data.audio;
      setAudioQueue((prevQueue) => [...prevQueue, audio]); // Add the audio to the queue
    });
  }, [setAudioQueue]);

  useEffect(() => {
    if (!currentAudio && audioUrlQueue.length > 0) {
      const [nextAudio, ...remainingQueue] = audioUrlQueue;
      setCurrentAudio(nextAudio); // Set the next audio
      setAudioQueue(remainingQueue); // Remove the played audio from the queue
    }
  }, [audioUrlQueue, currentAudio, setAudioQueue]);

  const handleAudioEnd = () => {
    setCurrentAudio(null); // Reset the audio after it finishes
  };

  return currentAudio ? (
    <audio autoPlay onEnded={handleAudioEnd} style={{ display: "none" }}>
      <source src={currentAudio} type="audio/mp3" />
    </audio>
  ) : null;
};
