import { useLazyQuery } from "@apollo/client";
import { GET_STREAM_INTERACTIONS_QUERY } from "../constants/queries";
import { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { Button, Flex, Progress, Text } from "@chakra-ui/react";
import useUpdateStreamInteraction from "../hooks/server/channel/useUpdateStreamInteraction";
import { StreamInteractionType } from "../generated/graphql";
import axios from "axios";
import { useUser } from "../hooks/context/useUser";
import Header from "../components/navigation/Header";
import { areAddressesEqual } from "../utils/validation/wallet";
const mods = process.env.NEXT_PUBLIC_MODS?.split(",");

export default function ModCenterPage() {
  const { user } = useUser();

  const isMod = useMemo(() => {
    if (mods !== undefined && user?.address) {
      const userAddress = user.address;
      return mods.some((mod) => areAddressesEqual(userAddress, mod));
    }
    return false;
  }, [user, mods]);

  return (
    <AppLayout isCustomHeader={false} noHeader>
      <Header />
      {isMod && <ModCenter />}
      {!isMod && <Text>You're not supposed to be here.</Text>}
    </AppLayout>
  );
}

const ModCenter = () => {
  const [count, setCount] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setCount((prevCount) => (prevCount < 100 ? prevCount + 10 : 0));
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [paused]);

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

  useEffect(() => {
    getStreamInteractions();
  }, []);

  useEffect(() => {
    if (count === 100) getStreamInteractions();
  }, [count]);

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
        const response = await axios.post(
          "https://overlay-five.vercel.app/api/payment-confirmation",
          {
            paymentId: "test123",
            userId: "userTest",
            textToSpeak: interaction.text,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        console.log("response", response);
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
        <Text textAlign={"center"}>time until next fetch</Text>
        <Progress colorScheme={paused ? "yellow" : "green"} value={count} />
      </Flex>
      <Flex justifyContent={"space-between"}>
        <Flex direction="column" gap="4px">
          <Text>
            Care Packages (
            {
              receivedPackageInteractions.filter(
                (interaction) => interaction.isCarePackage
              ).length
            }
            )
          </Text>
          {receivedPackageInteractions
            .filter((interaction) => interaction.isCarePackage)
            .map((interaction) => (
              <Flex
                key={interaction.user}
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
        <Flex direction="column" gap="4px">
          <Text>
            Scare Packages (
            {
              receivedPackageInteractions.filter(
                (interaction) => !interaction.isCarePackage
              ).length
            }
            )
          </Text>
          {receivedPackageInteractions
            .filter((interaction) => !interaction.isCarePackage)
            .map((interaction) => (
              <Flex
                key={interaction.user}
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
        <Flex direction={"column"} gap="4px" flexWrap="wrap">
          <Text>Text to Speech ({receivedTtsInteractions.length})</Text>
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
              <Flex gap="4px">
                <Button
                  bg={"blue.500"}
                  color="white"
                  _hover={{ bg: "blue.600" }}
                  onClick={() =>
                    playAndRemoveTtsInteraction(interaction, false)
                  }
                >
                  Play and remove
                </Button>
                <Button
                  bg="red.500"
                  color="white"
                  _hover={{ bg: "red.600" }}
                  onClick={() => playAndRemoveTtsInteraction(interaction, true)}
                >
                  Remove
                </Button>
              </Flex>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};
