import { useLazyQuery } from "@apollo/client";
import {
  GET_PACKAGES_QUERY,
  GET_STREAM_INTERACTIONS_QUERY,
} from "../constants/queries";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Flex,
  Input,
  SimpleGrid,
  Spinner,
  Text,
} from "@chakra-ui/react";
import useUpdateStreamInteraction from "../hooks/server/channel/useUpdateStreamInteraction";
import { StreamInteractionType } from "../generated/graphql";
import { useUser } from "../hooks/context/useUser";
import Header from "../components/navigation/Header";
import { areAddressesEqual } from "../utils/validation/wallet";
import { useAblyChannel } from "../hooks/chat/useChatChannel";
import { useUpdatePackage } from "../hooks/server/useUpdatePackage";
import {
  PACKAGE_PRICE_CHANGE_EVENT,
  PACKAGE_PURCHASE_EVENT,
  SEND_TTS_EVENT,
} from "../constants";
import { io, Socket } from "socket.io-client";
import { WS_URL } from "../components/layout/BooEventTtsComponent";

export const INTERACTIONS_CHANNEL = "persistMessages:interactions";

const mods = process.env.NEXT_PUBLIC_MODS?.split(",");

let socket: Socket | null;

export default function ModCenterPage() {
  const { user } = useUser();

  const isMod = useMemo(() => {
    if (mods !== undefined && user?.address) {
      const userAddress = user.address;
      return mods.some((mod) => areAddressesEqual(userAddress, mod));
    }
    return false;
  }, [user, mods]);

  useEffect(() => {
    socket = io(WS_URL);

    // Listen for play-audio events from the server
    socket.on("interaction", (data) => {
      console.log("interaction", data);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <Flex h="100vh" bg="rgba(5, 0, 31, 1)" position={"relative"}>
      <Flex direction="column">
        <Header />
        {/* {isMod && <ModCenter />} */}
        {/* {!isMod && <Text>You're not supposed to be here.</Text>} */}
        <ModCenter />
      </Flex>
    </Flex>
  );
}

interface PackageInfo {
  id: string;
  priceMultiplier: string;
  cooldownInSeconds: string;
}

type StagingPackages = {
  [key: string]: PackageInfo;
};

type AudioData = {
  interactionId: string;
  text?: string;
  audio: string;
};

const ModCenter = () => {
  const [paused, setPaused] = useState(false);

  const [stagingPackages, setStagingPackages] = useState<StagingPackages>({});
  const audioQueueRef = useRef<AudioData[]>([]);

  const [audioQueue, setAudioQueue] = useState<AudioData[]>([]); // State to display the queue
  const [currentAudio, setCurrentAudio] = useState<AudioData | null>(null); // State to display the current playing audio

  const processQueue = async () => {
    if (audioQueueRef.current.length === 0) return; // Exit if the queue is empty

    const audioObj = audioQueueRef.current[0];
    setCurrentAudio(audioObj); // Set the current audio being played for display
    const audio = new Audio(audioObj.audio);

    // Set up the event listener to handle when the audio finishes
    audio.onended = async () => {
      audioQueueRef.current.shift(); // Remove the finished audio from the queue
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setAudioQueue([...audioQueueRef.current]); // Update the displayed queue
      setCurrentAudio(null); // Clear current audio when it ends
      processQueue(); // Process the next audio in the queue
    };

    audio.play(); // Play the current audio
  };

  const pushAudio = (
    audio: string,
    interaction: {
      id: string;
      text?: string;
    }
  ) => {
    audioQueueRef.current.push({
      audio,
      interactionId: interaction.id,
      text: interaction.text,
    }); // Add the audio to the queue
    setAudioQueue([...audioQueueRef.current]); // Update the displayed queue

    // If the queue length is 1, start processing (this ensures it only processes when there's audio in the queue)
    if (audioQueueRef.current.length === 1) {
      processQueue();
    }
  };
  const [interactionsChannel] = useAblyChannel(
    INTERACTIONS_CHANNEL,
    async (message) => {
      if (message.name === PACKAGE_PURCHASE_EVENT) {
        const packageInfoBody: {
          id: string;
          user: string;
          name: string;
          isCarePackage: boolean;
        } = JSON.parse(message.data.body);
        setReceivedPackageInteractions((prevInteractions) => {
          // Filter out any interactions with the same ID
          const filteredInteractions = prevInteractions.filter(
            (interaction) => interaction.id !== packageInfoBody.id
          );

          // Add the new interaction
          return [
            {
              id: packageInfoBody.id,
              user: packageInfoBody.user,
              packageName: packageInfoBody.name,
              isCarePackage: packageInfoBody.isCarePackage,
            },
            ...filteredInteractions,
          ];
        });
      }
      if (message.name === SEND_TTS_EVENT) {
        const ttsBody: {
          id: string;
          text: string;
        } = JSON.parse(message.data.body);

        setReceivedTtsInteractions((prevInteractions) => {
          // Filter out any interactions with the same ID
          const filteredInteractions = prevInteractions.filter(
            (interaction) => interaction.id !== ttsBody.id
          );

          // Add the new interaction
          return [ttsBody, ...filteredInteractions];
        });
      }
    }
  );

  const [call] = useLazyQuery(GET_STREAM_INTERACTIONS_QUERY, {
    fetchPolicy: "network-only",
  });

  const { updateStreamInteraction } = useUpdateStreamInteraction({});

  const [receivedTtsInteractions, setReceivedTtsInteractions] = useState<
    { id: string; text?: string }[]
  >([]);
  const [receivedPackageInteractions, setReceivedPackageInteractions] =
    useState<
      {
        id: string;
        user: string;
        packageName: string;
        isCarePackage: boolean;
      }[]
    >([]);

  const [booPackageMap, setBooPackageMap] = useState<any>(undefined);

  const [_fetchBooPackages] = useLazyQuery(GET_PACKAGES_QUERY, {
    fetchPolicy: "network-only",
  });

  const fetchBooPackages = useCallback(async () => {
    const { data } = await _fetchBooPackages();
    const packages = data?.getPackages;
    if (packages) {
      const packageMap = packages.reduce((map: any, item: any) => {
        map[item.packageName] = {
          priceMultiplier: item.priceMultiplier,
          cooldownInSeconds: item.cooldownInSeconds,
          id: item.id,
        };
        return map;
      }, {} as Record<string, PackageInfo>);
      setBooPackageMap(packageMap);
      setStagingPackages(packageMap);
    }
  }, []);

  const getStreamInteractions = useCallback(async () => {
    setPaused(true);
    const { data: interactions } = await call({
      variables: {
        data: {
          channelId: "3",
          streamInteractionTypes: [
            StreamInteractionType.TtsInteraction,
            StreamInteractionType.PackageInteraction,
          ],
          orderBy: "desc",
          softDeleted: false,
        },
      },
    });
    const ttsInteractions = interactions?.getStreamInteractions
      .filter(
        (i: any) => i.interactionType === StreamInteractionType.TtsInteraction
      )
      .map((interaction: any) => {
        return {
          id: interaction.id,
          text: interaction.text,
        };
      });
    const packageInteractions = interactions?.getStreamInteractions
      .filter(
        (i: any) =>
          i.interactionType === StreamInteractionType.PackageInteraction
      )
      .map((interaction: any) => {
        return { id: interaction.id, ...JSON.parse(interaction.text) };
      });
    setReceivedPackageInteractions(packageInteractions);
    setReceivedTtsInteractions(ttsInteractions);
    setPaused(false);
  }, []);

  const fetchAll = useCallback(async () => {
    setPaused(true);
    await fetchBooPackages();
    await getStreamInteractions();
    setPaused(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, []);

  const { updatePackage } = useUpdatePackage({});

  const playAndRemoveTtsInteraction = async (
    interaction: {
      id: string;
      text?: string;
    },
    doNotPlay: boolean
  ) => {
    setPaused(true);
    try {
      if (interaction.text && !doNotPlay) {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId: "test123",
            userId: "userTest",
            textToSpeak: interaction.text,
          }),
        });

        const data = await response.json();

        if (data.success) {
          const base64Audio = `data:audio/mp3;base64,${data.audio}`;
          pushAudio(base64Audio, interaction); // Play audio
        }
      }

      await updateStreamInteraction({
        interactionId: interaction.id,
        softDeleted: true,
      });
      setReceivedTtsInteractions((prevInteractions) =>
        prevInteractions.filter(
          (_interaction) => _interaction.id !== interaction.id
        )
      );
    } catch (error) {
      console.error("Error sending POST request:", error);
    }
    setPaused(false);
  };

  return (
    <Flex direction="column" p="20px" gap="10px">
      <Flex direction="column" justifyContent={"center"}>
        <Button onClick={fetchAll}>
          {paused ? <Spinner /> : "refetch everything"}
        </Button>
      </Flex>
      <Flex
        justifyContent={"space-between"}
        gap="20px"
        height="100%"
        overflowY={"scroll"}
      >
        <Flex direction="column">
          <SimpleGrid columns={4} spacing={10}>
            <Text>Package Name</Text>
            <Text>Price Multiplier</Text>
            <Text>Cooldown</Text>
          </SimpleGrid>

          {booPackageMap &&
            Object.entries(booPackageMap)
              .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
              .map(([packageName, packageInfo]) => (
                <SimpleGrid
                  columns={4}
                  spacing={10}
                  backgroundColor="#212e6f"
                  p="10px"
                >
                  <Text>{packageName}</Text>
                  <Input
                    placeholder="price multiplier"
                    value={stagingPackages[packageName].priceMultiplier}
                    onChange={(e) =>
                      setStagingPackages((prev) => ({
                        ...prev,
                        [packageName]: {
                          ...stagingPackages[packageName],
                          priceMultiplier: String(e.target.value),
                        },
                      }))
                    }
                  />
                  <Input
                    placeholder="cooldown"
                    value={stagingPackages[packageName].cooldownInSeconds}
                    onChange={(e) =>
                      setStagingPackages((prev) => ({
                        ...prev,
                        [packageName]: {
                          ...stagingPackages[packageName],
                          cooldownInSeconds: String(e.target.value),
                        },
                      }))
                    }
                  />
                  <Button
                    isDisabled={
                      !stagingPackages[packageName] ||
                      !stagingPackages[packageName].priceMultiplier ||
                      !stagingPackages[packageName].cooldownInSeconds ||
                      (Number(booPackageMap?.[packageName]?.priceMultiplier) ===
                        Number(stagingPackages[packageName].priceMultiplier) &&
                        Number(
                          booPackageMap?.[packageName]?.cooldownInSeconds
                        ) ===
                          Number(
                            stagingPackages[packageName].cooldownInSeconds
                          ))
                    }
                    onClick={async () => {
                      const data = await updatePackage({
                        packageName,
                        cooldownInSeconds: Number(
                          stagingPackages[packageName].cooldownInSeconds
                        ),
                        priceMultiplier:
                          stagingPackages[packageName].priceMultiplier,
                      });
                      interactionsChannel?.publish({
                        name: PACKAGE_PRICE_CHANGE_EVENT,
                        data: {
                          body: JSON.stringify({
                            ...data?.res,
                          }),
                        },
                      });
                      fetchBooPackages();
                    }}
                  >
                    Update
                  </Button>
                </SimpleGrid>
              ))}
        </Flex>
        <Flex direction="column" gap="4px" height="70vh">
          <Text>
            Care Packages (
            {
              receivedPackageInteractions.filter(
                (interaction) => interaction.isCarePackage
              ).length
            }
            )
          </Text>
          <Flex direction="column" gap="4px" height="100%" overflowY={"scroll"}>
            {receivedPackageInteractions
              .filter((interaction) => interaction.isCarePackage)
              .map((interaction) => (
                <Flex
                  key={interaction.id}
                  backgroundColor="#212e6f"
                  p="10px"
                  borderRadius="15px"
                  justifyContent={"space-between"}
                  gap="4px"
                >
                  <Text>
                    {interaction.user} used {interaction.packageName}
                  </Text>
                  <Button
                    bg="red.500"
                    color="white"
                    _hover={{ bg: "red.600" }}
                    onClick={async () => {
                      setPaused(true);
                      await updateStreamInteraction({
                        interactionId: interaction.id,
                        softDeleted: true,
                      });
                      setReceivedPackageInteractions((prevInteractions) =>
                        prevInteractions.filter(
                          (_interaction) => _interaction.id !== interaction.id
                        )
                      );
                      setPaused(false);
                    }}
                  >
                    Remove
                  </Button>
                </Flex>
              ))}
          </Flex>
          <Text>
            Scare Packages (
            {
              receivedPackageInteractions.filter(
                (interaction) => !interaction.isCarePackage
              ).length
            }
            )
          </Text>
          <Flex direction="column" gap="4px" height="100%" overflowY={"scroll"}>
            {receivedPackageInteractions
              .filter((interaction) => !interaction.isCarePackage)
              .map((interaction) => (
                <Flex
                  key={interaction.id}
                  backgroundColor="#212e6f"
                  p="10px"
                  borderRadius="15px"
                  justifyContent={"space-between"}
                  gap="4px"
                >
                  <Text>
                    {interaction.user} used {interaction.packageName}
                  </Text>
                  <Button
                    bg="red.500"
                    color="white"
                    _hover={{ bg: "red.600" }}
                    onClick={async () => {
                      setPaused(true);
                      await updateStreamInteraction({
                        interactionId: interaction.id,
                        softDeleted: true,
                      });
                      setReceivedPackageInteractions((prevInteractions) =>
                        prevInteractions.filter(
                          (_interaction) => _interaction.id !== interaction.id
                        )
                      );
                      setPaused(false);
                    }}
                  >
                    Remove
                  </Button>
                </Flex>
              ))}
          </Flex>
        </Flex>
        <Flex direction="column" height="70vh" width="30vw">
          <Text>Text to Speech ({receivedTtsInteractions.length})</Text>
          {audioQueue.length > 0 ? (
            audioQueue.map((audio) => (
              <Flex
                bg={
                  currentAudio?.interactionId === audio.interactionId
                    ? "green.500"
                    : "#00b3bc"
                }
              >
                <Text>{audio.text}</Text>
              </Flex>
            ))
          ) : (
            <Text>Nothing in queue, add some now</Text>
          )}
          <Flex direction={"column"} gap="4px" overflowY={"scroll"}>
            {receivedTtsInteractions.map((interaction) => (
              <Flex
                key={interaction.id}
                backgroundColor="#212e6f"
                p="10px"
                borderRadius="15px"
                justifyContent={"space-between"}
                gap="4px"
                direction="column"
              >
                <Text>{interaction.text}</Text>
                <Flex justifyContent={"space-between"}>
                  <Button
                    bg={"green.500"}
                    color="white"
                    _hover={{}}
                    onClick={() => {
                      playAndRemoveTtsInteraction(interaction, false);
                    }}
                  >
                    Add to play queue
                  </Button>
                  <Button
                    bg="red.500"
                    color="white"
                    _hover={{ bg: "red.600" }}
                    onClick={() =>
                      playAndRemoveTtsInteraction(interaction, true)
                    }
                  >
                    Remove
                  </Button>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
