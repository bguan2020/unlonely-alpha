import { useLazyQuery } from "@apollo/client";
import {
  GET_PACKAGES_QUERY,
  GET_STREAM_INTERACTIONS_QUERY,
} from "../constants/queries";
import { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import {
  Button,
  Flex,
  Input,
  Progress,
  Select,
  SimpleGrid,
  Text,
  useToast,
} from "@chakra-ui/react";
import useUpdateStreamInteraction from "../hooks/server/channel/useUpdateStreamInteraction";
import { StreamInteractionType } from "../generated/graphql";
import { useUser } from "../hooks/context/useUser";
import Header from "../components/navigation/Header";
import { areAddressesEqual } from "../utils/validation/wallet";
import { useAblyChannel } from "../hooks/chat/useChatChannel";
import { useUpdatePackage } from "../hooks/server/useUpdatePackage";
import { PACKAGE_PRICE_CHANGE_EVENT } from "../constants";
import axios from "axios";
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
      {/* {isMod && <ModCenter />} */}
      {/* {!isMod && <Text>You're not supposed to be here.</Text>} */}
      <ModCenter />
    </AppLayout>
  );
}

const ModCenter = () => {
  const [count, setCount] = useState(0);
  const [paused, setPaused] = useState(false);

  const chatChannelName = "persistMessages:danny-chat-channel"; // todo: change this to actual channel's name

  const [stagingPackage, setStagingPackage] = useState<{
    name: string;
    priceMultiplier: string;
    cooldownInSeconds: string;
  }>({
    name: "",
    priceMultiplier: "",
    cooldownInSeconds: "",
  });

  const toast = useToast();

  const handleUpdate = () => {
    toast({
      title: "update sent, please wait for next fetch",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };
  const [channel] = useAblyChannel(chatChannelName, async (message) => {
    console.log("message received", message.data);
  });

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
      }, {} as Record<string, { price: number; cooldown: number }>);
      setBooPackageMap(packageMap);
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

  useEffect(() => {
    getStreamInteractions();
    fetchBooPackages();
  }, []);

  useEffect(() => {
    if (count === 100) {
      getStreamInteractions();
      fetchBooPackages();
    }
  }, [count]);

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
      <Flex justifyContent={"space-between"} gap="10px">
        <Flex direction="column">
          <Text>Package Prices</Text>
          <Flex
            gap="5px"
            backgroundColor="#212e6f"
            p="10px"
            borderRadius="15px"
          >
            <Select
              placeholder="Select option"
              borderColor="white"
              bg="#10bfcc"
              style={{
                color: "black",
              }}
              onChange={async (e) => {
                setStagingPackage({
                  ...stagingPackage,
                  name: e.target.value,
                });
              }}
            >
              {booPackageMap &&
                Object.entries(booPackageMap).map(
                  ([packageName, packageInfo]) => (
                    <option
                      key={packageName}
                      value={packageName}
                      style={{
                        backgroundColor: "#10bfcc",
                      }}
                    >
                      {packageName}
                    </option>
                  )
                )}
            </Select>
            <Input
              placeholder="price multiplier"
              value={stagingPackage.priceMultiplier}
              onChange={(e) =>
                setStagingPackage({
                  ...stagingPackage,
                  priceMultiplier: String(e.target.value),
                })
              }
            />
            <Input
              placeholder="cooldown"
              value={stagingPackage.cooldownInSeconds}
              onChange={(e) =>
                setStagingPackage({
                  ...stagingPackage,
                  cooldownInSeconds: String(e.target.value),
                })
              }
            />
            <Button
              isDisabled={
                !stagingPackage.name ||
                !stagingPackage.priceMultiplier ||
                !stagingPackage.cooldownInSeconds ||
                (Number(
                  booPackageMap?.[stagingPackage.name]?.priceMultiplier
                ) === Number(stagingPackage.priceMultiplier) &&
                  Number(
                    booPackageMap?.[stagingPackage.name]?.cooldownInSeconds
                  ) === Number(stagingPackage.cooldownInSeconds))
              }
              onClick={async () => {
                const data = await updatePackage({
                  packageName: stagingPackage.name,
                  cooldownInSeconds: Number(stagingPackage.cooldownInSeconds),
                  priceMultiplier: stagingPackage.priceMultiplier,
                });
                channel?.publish({
                  name: PACKAGE_PRICE_CHANGE_EVENT,
                  data: {
                    body: JSON.stringify({
                      ...data?.res,
                    }),
                  },
                });
                handleUpdate();
              }}
            >
              Update
            </Button>
          </Flex>
          <SimpleGrid columns={3} spacing={10}>
            <Text>Package Name</Text>
            <Text>Price Multiplier</Text>
            <Text>Cooldown</Text>
          </SimpleGrid>

          {booPackageMap &&
            Object.entries(booPackageMap).map(([packageName, packageInfo]) => (
              <SimpleGrid columns={3} spacing={10}>
                <Text>{packageName}</Text>
                <Text>{(packageInfo as any)?.priceMultiplier}</Text>
                <Text>{(packageInfo as any)?.cooldownInSeconds}</Text>
              </SimpleGrid>
            ))}
        </Flex>
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
