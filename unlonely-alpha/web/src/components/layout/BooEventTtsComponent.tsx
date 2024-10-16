import { Flex, Text, Image, Tooltip } from "@chakra-ui/react";
import { useMemo } from "react";
import usePostStreamInteraction from "../../hooks/server/usePostStreamInteraction";
// import { StreamInteractionType } from "../../generated/graphql";
import { AblyChannelPromise, SEND_TTS_EVENT } from "../../constants";
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
  const { channel } = useChannelContext();
  const { channelQueryData } = channel;

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
          "text-to-speech"
        ),
        replaceExisting: false,
      }).then(async () => {
        await fetchUserBooPackageCooldownMapping(user?.address ?? "");
      });
      await interactionsAblyChannel?.publish({
        name: SEND_TTS_EVENT,
        data: {
          body: JSON.stringify({
            id: res?.res?.id ?? "0",
            text,
            userId: user?.username ?? centerEllipses(user?.address, 15),
          }),
        },
      });
    });
  };

  const cooldownCountdown = useMemo(() => {
    const lastUsedCooldown = Math.ceil(
      ((userBooPackageCooldowns?.["text-to-speech"]?.lastUsedAt ?? 0) -
        (dateNow -
          (booPackageMap?.["text-to-speech"]?.cooldownInSeconds ?? 0) * 1000)) /
        1000
    );
    const secondaryCooldown = Math.ceil(
      ((userBooPackageCooldowns?.["text-to-speech"]?.usableAt ?? 0) - dateNow) /
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
    >
      <Tooltip
        label={
          isValidAddress(user?.address) !== "solana"
            ? "log in with solana wallet first"
            : null
        }
        isDisabled={!isDisabled}
      >
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          gap="16px"
          _hover={{
            cursor: "pointer",
            transform: "scale(1.1)",
            transition: "transform 0.2s",
          }}
          border={"1px solid #b8b8b8"}
          borderRadius={"10px"}
          padding="10px"
          position={"relative"}
        >
          {cooldownCountdown.displayCooldown > 0 && (
            <Flex
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg="blackAlpha.800"
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
          <Image
            src="/images/megaphone.png"
            alt="megaphone"
            width="20px"
            height="20px"
          />
          <Text textAlign={"center"} fontFamily="LoRes15" fontSize="20px">
            TTS BROADCAST MESSAGE
          </Text>
        </Flex>
      </Tooltip>
    </Flex>
  );
};
