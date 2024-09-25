import { useLazyQuery } from "@apollo/client";
import { GET_STREAM_INTERACTIONS_QUERY } from "../constants/queries";
import { useCallback, useEffect, useMemo, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { Button, Flex, Text } from "@chakra-ui/react";
import useUpdateStreamInteraction from "../hooks/server/channel/useUpdateStreamInteraction";
import { InteractionType as BackendInteractionType } from "../generated/graphql";
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
    if (!interaction.text || doNotPlay) return;
    try {
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

      await updateStreamInteraction({
        interactionId: interaction.id,
        softDeleted: true,
      });
      setReceivedInteractions((prevInteractions) =>
        prevInteractions.filter(
          (_interaction) => _interaction.id !== interaction.id
        )
      );
    } catch (error) {
      console.error("Error sending POST request:", error);
    }
  };

  return (
    <AppLayout isCustomHeader={true}>
      <Flex justifyContent={"space-between"}>
        <Flex>
          <Text>Care Packages</Text>
        </Flex>
        <Flex>
          <Text>Scare Packages</Text>
        </Flex>
      </Flex>
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
