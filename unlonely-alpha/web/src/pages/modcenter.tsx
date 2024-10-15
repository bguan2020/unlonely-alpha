import { useLazyQuery } from "@apollo/client";
import {
  GET_PACKAGES_QUERY,
  GET_STREAM_INTERACTIONS_QUERY,
} from "../constants/queries";
import { useCallback, useEffect, useMemo, useState } from "react";
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
// import { io, Socket } from "socket.io-client";
// import { WS_URL } from "../components/layout/BooEventTtsComponent";
import { FaLongArrowAltRight, FaLongArrowAltLeft } from "react-icons/fa";
import { CHANNEL_ID_TO_USE } from "../components/layout/BooEventWrapper";

export const INTERACTIONS_CHANNEL = "persistMessages:interactions";

const mods = process.env.NEXT_PUBLIC_MODS?.split(",");

// let socket: Socket | null;

export default function ModCenterPage() {
  const { user } = useUser();

  const isMod = useMemo(() => {
    if (mods !== undefined && user?.address) {
      const userAddress = user.address;
      return mods.some((mod) => areAddressesEqual(userAddress, mod));
    }
    return false;
  }, [user, mods]);

  // useEffect(() => {
  //   socket = io(WS_URL, {
  //     transports: ["websocket"],
  //   });

  //   // Listen for play-audio events from the server
  //   socket.on("interaction", (data) => {
  //     console.log("interaction", data);
  //   });

  //   return () => {
  //     if (socket) {
  //       socket.disconnect();
  //     }
  //   };
  // }, []);

  return (
    <Flex h="100vh" bg="rgba(5, 0, 31, 1)" position={"relative"}>
      <Flex direction="column">
        <Header />
        {isMod && <ModCenter />}
        {!isMod && <Text>You're not supposed to be here.</Text>}
        {/* <ModCenter /> */}
      </Flex>
    </Flex>
  );
}

export interface PackageInfo {
  id: string;
  tokenHoldingPrice: string;
  cooldownInSeconds: string;
}

export type StagingPackages = {
  [key: string]: PackageInfo;
};

export type AudioData = {
  interactionId: string;
  text?: string;
};

const ModCenter = () => {
  const [paused, setPaused] = useState(false);

  const [stagingPackages, setStagingPackages] = useState<StagingPackages>({});
  const [currentAudio, setCurrentAudio] = useState<AudioData | null>(null); // State to display the current playing audio

  const pushAudio = async (interaction: { id: string; text?: string }) => {
    setCurrentAudio({
      interactionId: interaction.id,
      text: interaction.text,
    }); // Set the current audio being played for display
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
    if (!data.success) {
      setCurrentAudio(null); // Clear current audio when it ends
    }
    const base64Audio = `data:audio/mp3;base64,${data.audio}`;
    const audio = new Audio(base64Audio);

    // Set up the event listener to handle when the audio finishes
    audio.onended = async () => {
      setQueuedTtsInteractions((prevInteractions) =>
        prevInteractions.filter(
          (_interaction) => _interaction.id !== interaction.id
        )
      );
      setCurrentAudio(null); // Clear current audio when it ends
      await updateStreamInteraction({
        interactionId: interaction.id,
        softDeleted: true,
      });
      setReceivedTtsInteractions((prevInteractions) =>
        prevInteractions.filter(
          (_interaction) => _interaction.id !== interaction.id
        )
      );
    };

    audio.play(); // Play the current audio
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
          text: string;
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
              text: packageInfoBody.text,
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
  const [queuedTtsInteractions, setQueuedTtsInteractions] = useState<
    { id: string; text?: string }[]
  >([]);
  const [receivedPackageInteractions, setReceivedPackageInteractions] =
    useState<
      {
        id: string;
        user: string;
        packageName: string;
        isCarePackage: boolean;
        text: string;
      }[]
    >([]);

  const [booPackageMap, setBooPackageMap] = useState<
    Record<string, PackageInfo>
  >({});

  const [_fetchBooPackages] = useLazyQuery(GET_PACKAGES_QUERY, {
    fetchPolicy: "network-only",
  });

  const fetchBooPackages = useCallback(async () => {
    const { data } = await _fetchBooPackages();
    const packages = data?.getPackages;
    if (packages) {
      const packageMap = packages.reduce((map: any, item: any) => {
        map[item.packageName] = {
          tokenHoldingPrice: item.tokenHoldingPrice,
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
          channelId: String(CHANNEL_ID_TO_USE),
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

  const handleQueuedTtsInteractions = useCallback(
    async (interaction: { id: string; text?: string }, remove: boolean) => {
      if (!remove) {
        setQueuedTtsInteractions((prevInteractions) => {
          return [
            {
              id: interaction.id,
              text: interaction.text,
            },
            ...prevInteractions,
          ];
        });
        setReceivedTtsInteractions((prevInteractions) =>
          prevInteractions.filter(
            (_interaction) => _interaction.id !== interaction.id
          )
        );
      } else {
        setReceivedTtsInteractions((prevInteractions) => {
          return [
            ...prevInteractions,
            {
              id: interaction.id,
              text: interaction.text,
            },
          ];
        });
        setQueuedTtsInteractions((prevInteractions) =>
          prevInteractions.filter(
            (_interaction) => _interaction.id !== interaction.id
          )
        );
      }
    },
    []
  );

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
        <Flex
          direction="column"
          bg="rgba(255, 255, 255, 0.1)"
          p="5px"
          gap="5px"
        >
          <SimpleGrid columns={4} spacing={10}>
            <Text>Interaction</Text>
            <Text>Price</Text>
            <Text>Cooldown</Text>
          </SimpleGrid>

          <Flex direction="column" overflowY={"scroll"} height="30vh">
            {booPackageMap &&
              Object.entries(booPackageMap)
                .sort((a, b) => Number(a[1].id) - Number(b[1].id))
                .map(([packageName, packageInfo]) => (
                  <SimpleGrid
                    columns={4}
                    spacing={10}
                    backgroundColor="#212e6f"
                    p="10px"
                  >
                    <Text>{packageName}</Text>
                    <Input
                      placeholder="price"
                      value={stagingPackages[packageName].tokenHoldingPrice}
                      onChange={(e) =>
                        setStagingPackages((prev) => ({
                          ...prev,
                          [packageName]: {
                            ...stagingPackages[packageName],
                            tokenHoldingPrice: String(e.target.value),
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
                        !stagingPackages[packageName].tokenHoldingPrice ||
                        !stagingPackages[packageName].cooldownInSeconds ||
                        (Number(
                          booPackageMap?.[packageName]?.tokenHoldingPrice
                        ) ===
                          Number(
                            stagingPackages[packageName].tokenHoldingPrice
                          ) &&
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
                          tokenHoldingPrice:
                            stagingPackages[packageName].tokenHoldingPrice,
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
          <Flex width="100%" gap="5px">
            <Flex direction="column" gap="4px" width="100%" height="40vh">
              <Text>
                Care Packages (
                {
                  receivedPackageInteractions.filter(
                    (interaction) => interaction.isCarePackage
                  ).length
                }
                )
              </Text>
              <Flex
                direction="column"
                gap="4px"
                height="100%"
                overflowY={"scroll"}
              >
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
                      <Flex direction={"column"}>
                        <Text>
                          {interaction.user} used {interaction.packageName}
                        </Text>
                        {interaction.text && (
                          <Text
                            fontSize="13px"
                            color={"#a1c5ff"}
                            fontStyle={"italic"}
                            fontWeight={"bold"}
                          >
                            {interaction.text}
                          </Text>
                        )}
                      </Flex>
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
                              (_interaction) =>
                                _interaction.id !== interaction.id
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
            <Flex direction="column" gap="4px" width="100%" height="40vh">
              <Text>
                Scare Packages (
                {
                  receivedPackageInteractions.filter(
                    (interaction) => !interaction.isCarePackage
                  ).length
                }
                )
              </Text>
              <Flex
                direction="column"
                gap="4px"
                height="100%"
                overflowY={"scroll"}
              >
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
                      <Flex direction={"column"}>
                        <Text>
                          {interaction.user} used {interaction.packageName}
                        </Text>
                        {interaction.text && (
                          <Text
                            fontSize="13px"
                            color={"#a1c5ff"}
                            fontStyle={"italic"}
                            fontWeight={"bold"}
                          >
                            {interaction.text}
                          </Text>
                        )}{" "}
                      </Flex>
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
                              (_interaction) =>
                                _interaction.id !== interaction.id
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
          </Flex>
        </Flex>

        <Flex
          direction="column"
          bg="rgba(255, 255, 255, 0.1)"
          p="5px"
          gap="5px"
        >
          <Text>Text to Speech ({receivedTtsInteractions.length})</Text>
          <Flex width="40vw" gap="5px">
            <Flex
              direction={"column"}
              gap="4px"
              overflowY={"scroll"}
              width="50%"
              height="70vh"
            >
              {receivedTtsInteractions.map((interaction) => (
                <Flex
                  key={interaction.id}
                  bg={
                    currentAudio?.interactionId === interaction.id
                      ? "green.500"
                      : "#212e6f"
                  }
                  p="10px"
                  borderRadius="15px"
                  justifyContent={"space-between"}
                  gap="4px"
                  direction="column"
                >
                  <Text>{interaction.text}</Text>
                  <Flex justifyContent={"space-between"} gap="4px">
                    <Button
                      bg="transparent"
                      border={"1px solid #db4040"}
                      color="#db4040"
                      _hover={{ bg: "#db4040", color: "white" }}
                      onClick={async () => {
                        await updateStreamInteraction({
                          interactionId: interaction.id,
                          softDeleted: true,
                        });
                        setReceivedTtsInteractions((prevInteractions) =>
                          prevInteractions.filter(
                            (_interaction) => _interaction.id !== interaction.id
                          )
                        );
                      }}
                    >
                      Delete
                    </Button>
                    <Button
                      bg={"green.500"}
                      color="white"
                      _hover={{}}
                      isDisabled={currentAudio !== null}
                      onClick={() => {
                        pushAudio(interaction);
                      }}
                    >
                      Play
                    </Button>
                    <Button
                      bg={"#0c98aaff"}
                      color="white"
                      _hover={{
                        transform: "scale(1.1)",
                      }}
                      onClick={() => {
                        // playAndRemoveTtsInteraction(interaction, false);
                        handleQueuedTtsInteractions(interaction, false);
                      }}
                    >
                      Queue
                      <FaLongArrowAltRight />
                    </Button>
                  </Flex>
                </Flex>
              ))}
            </Flex>
            <Flex
              direction="column"
              gap="4px"
              overflowY={"scroll"}
              width="50%"
              height="70vh"
            >
              {queuedTtsInteractions.length > 0 ? (
                queuedTtsInteractions.map((interaction) => (
                  <Flex
                    key={interaction.id}
                    backgroundColor="#212e6f"
                    bg={
                      currentAudio?.interactionId === interaction.id
                        ? "green.500"
                        : "#212e6f"
                    }
                    p="10px"
                    borderRadius="15px"
                    justifyContent={"space-between"}
                    gap="4px"
                    direction="column"
                  >
                    <Text>{interaction.text}</Text>
                    <Flex justifyContent={"space-between"} gap="4px">
                      <Button
                        bg="red.500"
                        color="white"
                        _hover={{ bg: "#893200" }}
                        onClick={() => {
                          handleQueuedTtsInteractions(interaction, true);
                        }}
                      >
                        <FaLongArrowAltLeft />
                        Remove
                      </Button>
                      <Button
                        bg={"green.500"}
                        color="white"
                        _hover={{}}
                        isDisabled={currentAudio !== null}
                        onClick={() => {
                          pushAudio(interaction);
                        }}
                      >
                        Play
                      </Button>
                    </Flex>
                  </Flex>
                ))
              ) : (
                <Text>No messages in queue, add some now</Text>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
