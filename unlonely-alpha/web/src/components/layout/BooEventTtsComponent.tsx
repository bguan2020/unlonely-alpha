import { Flex, Text, Image, Tooltip } from "@chakra-ui/react";
import { useMemo } from "react";
import usePostStreamInteraction from "../../hooks/server/usePostStreamInteraction";
// import { StreamInteractionType } from "../../generated/graphql";
import {
  AblyChannelPromise,
  InteractionType,
  SEND_TTS_EVENT,
  TEXT_TO_SPEECH_PACKAGE_NAME,
} from "../../constants";
import { StreamInteractionType } from "../../generated/graphql";
import { isValidAddress } from "../../utils/validation/wallet";
import { useUser } from "../../hooks/context/useUser";
import useUpdateUserPackageCooldownMapping from "../../hooks/server/channel/useUpdateUserPackageCooldownMapping";
import { convertToHHMMSS } from "../../utils/time";
import { useChannelContext } from "../../hooks/context/useChannel";
import { createPackageCooldownArray } from "../../utils/packageCooldownHandler";
import centerEllipses from "../../utils/centerEllipses";

export const BooEventTtsComponent = ({
  interactionsAblyChannel,
  fetchUserBooPackageCooldownMapping,
  dateNow,
  booPackageMap,
  userBooPackageCooldowns,
  onTtsClick,
}: {
  interactionsAblyChannel: AblyChannelPromise;
  fetchUserBooPackageCooldownMapping: any;
  dateNow: number;
  booPackageMap: any;
  userBooPackageCooldowns: any;
  onTtsClick: (callback: (...args: any[]) => Promise<void>) => void;
}) => {
  const { user } = useUser();
  const { chat: c, channel } = useChannelContext();
  const { channelQueryData } = channel;
  const { addToChatbot } = c;

  const { postStreamInteraction } = usePostStreamInteraction({});

  const {
    updateUserPackageCooldownMapping: updateUserBooPackageCooldownMapping,
  } = useUpdateUserPackageCooldownMapping({});

  const handlePost = async (text: string) => {
    await postStreamInteraction({
      channelId: String(channelQueryData?.id),
      streamInteractionType: StreamInteractionType.TtsInteraction,
      text,
    }).then(async (res) => {
      await updateUserBooPackageCooldownMapping({
        userAddress: user?.address ?? "",
        newPackageCooldownChanges: createPackageCooldownArray(
          booPackageMap,
          userBooPackageCooldowns,
          TEXT_TO_SPEECH_PACKAGE_NAME
        ),
        replaceExisting: false,
      }).then(async () => {
        await fetchUserBooPackageCooldownMapping(user?.address ?? "");
        addToChatbot({
          username: user?.username ?? "",
          address: user?.address ?? "",
          taskType: InteractionType.USE_BOO_PACKAGE,
          title: text,
          description: JSON.stringify({
            message: `${
              user?.username ?? centerEllipses(user?.address, 15)
            } sent a TTS!`,
          }),
        });
      });
      await interactionsAblyChannel?.publish({
        name: SEND_TTS_EVENT,
        data: {
          body: JSON.stringify({
            id: res?.res?.id ?? "0",
            text,
            userId: user?.username ?? user?.address,
          }),
        },
      });
    });
  };

  const cooldownCountdown = useMemo(() => {
    const lastUsedCooldown = Math.ceil(
      ((userBooPackageCooldowns?.[TEXT_TO_SPEECH_PACKAGE_NAME]?.lastUsedAt ??
        0) -
        (dateNow -
          (booPackageMap?.[TEXT_TO_SPEECH_PACKAGE_NAME]?.cooldownInSeconds ??
            0) *
            1000)) /
        1000
    );
    const secondaryCooldown = Math.ceil(
      ((userBooPackageCooldowns?.[TEXT_TO_SPEECH_PACKAGE_NAME]?.usableAt ?? 0) -
        dateNow) /
        1000
    );
    return {
      lastUsedCooldown,
      secondaryCooldown,
      displayCooldown: Math.max(lastUsedCooldown, secondaryCooldown),
    };
  }, [userBooPackageCooldowns, dateNow, booPackageMap]);

  const isDisabled = useMemo(() => {
    return (
      cooldownCountdown.displayCooldown > 0 ||
      isValidAddress(user?.address) !== "solana"
    );
  }, [user, cooldownCountdown]);

  return (
    <Flex
      width="100%"
      height="100%"
      justifyContent={"center"}
      alignItems={"center"}
      onClick={() => {
        if (!isDisabled) onTtsClick(handlePost);
      }}
      position={"relative"}
      opacity={isValidAddress(user?.address) !== "solana" ? 0.5 : 1}
    >
      <Tooltip
        bg={"#7EFB97"}
        placement="bottom-end"
        color={"black"}
        label={
          isValidAddress(user?.address) !== "solana"
            ? "log in with solana wallet first"
            : "send a custom Text-To-Speech message to the contestants"
        }
      >
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          _hover={{
            cursor: "pointer",
          }}
          position={"relative"}
          direction={"column"}
        >
          {cooldownCountdown.displayCooldown > 0 && (
            <Flex
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg="blackAlpha.900"
              justifyContent="center"
              alignItems="center"
              borderRadius="10px"
              color={
                cooldownCountdown.secondaryCooldown >
                cooldownCountdown.lastUsedCooldown
                  ? "red"
                  : "unset"
              }
            >
              {convertToHHMMSS(String(cooldownCountdown.displayCooldown), true)}
            </Flex>
          )}
          <Text
            textAlign={"center"}
            fontFamily="LoRes15"
            fontSize="calc(0.8vw + 0.8vh)"
          >
            TTS MESSAGE
          </Text>
          <Image src={"/images/packages/tts.png"} w="5vw" />
        </Flex>
      </Tooltip>
    </Flex>
  );
};
