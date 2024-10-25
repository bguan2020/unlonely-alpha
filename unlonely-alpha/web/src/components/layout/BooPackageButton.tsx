import { Flex, Image, Tooltip, Text } from "@chakra-ui/react";
import { useUser } from "../../hooks/context/useUser";
import { useChannelContext } from "../../hooks/context/useChannel";
import {
  AblyChannelPromise,
  CarePackageName,
  CarePackageToTooltipDescription,
  InteractionType,
  PACKAGE_PURCHASE_EVENT,
  ScarePackageName,
  ScarePackageToTooltipDescription,
} from "../../constants";
import centerEllipses from "../../utils/centerEllipses";
import { useMemo, useState } from "react";
import useUpdateUserPackageCooldownMapping from "../../hooks/server/channel/useUpdateUserPackageCooldownMapping";
import { StreamInteractionType } from "../../generated/graphql";
import usePostStreamInteraction from "../../hooks/server/usePostStreamInteraction";
import { isValidAddress } from "../../utils/validation/wallet";
import { createPackageCooldownArray } from "../../utils/packageCooldownHandler";
import { convertToHHMMSS } from "../../utils/time";

export const BooPackageButton = ({
  cooldownInSeconds,
  userBooPackageCooldowns,
  dateNow,
  fetchUserBooPackageCooldownMapping,
  packageInfo,
  interactionsAblyChannel,
  booPackageMap,
  isAvailable,
  onClick,
}: {
  cooldownInSeconds: number;
  userBooPackageCooldowns: any;
  dateNow: number;
  fetchUserBooPackageCooldownMapping: any;
  packageInfo: {
    name: string;
    isCarePackage: boolean;
  };
  isAvailable?: boolean;
  interactionsAblyChannel: AblyChannelPromise;
  booPackageMap: any;
  onClick: (
    packageName: string,
    callback: (...args: any[]) => Promise<void>
  ) => void;
}) => {
  const { chat: c, channel } = useChannelContext();
  const { channelQueryData } = channel;
  const { addToChatbot } = c;
  const { user } = useUser();

  const [loading, setLoading] = useState(false);

  const { postStreamInteraction } = usePostStreamInteraction({});

  const {
    updateUserPackageCooldownMapping: updateUserBooPackageCooldownMapping,
  } = useUpdateUserPackageCooldownMapping({});

  const handleSendPackage = async (text: string) => {
    await postStreamInteraction({
      channelId: String(channelQueryData?.id),
      streamInteractionType: StreamInteractionType.PackageInteraction,
      text: JSON.stringify({
        user: user?.username ?? centerEllipses(user?.address, 15),
        packageName: packageInfo.name,
        isCarePackage: packageInfo.isCarePackage,
        text,
      }),
    }).then(async (res) => {
      await updateUserBooPackageCooldownMapping({
        userAddress: user?.address ?? "",
        newPackageCooldownChanges: createPackageCooldownArray(
          booPackageMap,
          userBooPackageCooldowns,
          packageInfo.name
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
            ...packageInfo,
            message: `${
              user?.username ?? centerEllipses(user?.address, 15)
            } sent ${packageInfo.name}!`,
          }),
        });
      });
      await interactionsAblyChannel?.publish({
        name: PACKAGE_PURCHASE_EVENT,
        data: {
          body: JSON.stringify({
            id: res.res?.id ?? "0",
            user: user?.username ?? centerEllipses(user?.address, 15),
            ...packageInfo,
            text,
          }),
        },
      });
    });
  };

  const handleSendTokens = async (text: string) => {
    setLoading(true);
    await handleSendPackage(text);
    setLoading(false);
  };

  const cooldownCountdown = useMemo(() => {
    const lastUsedCooldown = Math.ceil(
      ((userBooPackageCooldowns?.[packageInfo.name]?.lastUsedAt ?? 0) -
        (dateNow - (cooldownInSeconds ?? 0) * 1000)) /
        1000
    );
    const secondaryCooldown = Math.ceil(
      ((userBooPackageCooldowns?.[packageInfo.name]?.usableAt ?? 0) - dateNow) /
        1000
    );
    return {
      lastUsedCooldown,
      secondaryCooldown,
      displayCooldown: Math.max(lastUsedCooldown, secondaryCooldown),
    };
  }, [userBooPackageCooldowns, packageInfo, dateNow, cooldownInSeconds]);

  const isDisabled = useMemo(() => {
    return (
      cooldownCountdown.displayCooldown > 0 ||
      loading ||
      isValidAddress(user?.address) !== "solana" ||
      !isAvailable
    );
  }, [cooldownCountdown, user, loading, isAvailable]);

  return (
    <Flex direction="column" p="4px" margin="auto">
      <Tooltip
        bg="#7EFB97"
        placement="bottom-end"
        color="black"
        label={
          packageInfo.isCarePackage
            ? CarePackageToTooltipDescription[
                packageInfo.name as CarePackageName
              ]
            : ScarePackageToTooltipDescription[
                packageInfo.name as ScarePackageName
              ]
        }
      >
        <Flex
          position="relative"
          justifyContent={"center"}
          alignItems={"center"}
          w="100%"
          h="100%"
        >
          {isDisabled && (
            <>
              {!isAvailable ? (
                <Text
                  textAlign={"center"}
                  fontSize="10px"
                  position="absolute"
                  bg="#7E7E7E"
                  zIndex="2"
                >
                  N/A in this room
                </Text>
              ) : cooldownCountdown.displayCooldown > 0 ? (
                <Flex
                  position={"absolute"}
                  p="10px"
                  bg="blackAlpha.800"
                  color={
                    cooldownCountdown.secondaryCooldown >
                    cooldownCountdown.lastUsedCooldown
                      ? "red"
                      : "unset"
                  }
                  zIndex="2"
                  borderRadius="15px"
                >
                  {convertToHHMMSS(
                    String(cooldownCountdown.displayCooldown),
                    true
                  )}
                </Flex>
              ) : null}
            </>
          )}
          <Image
            src={`/images/packages/${packageInfo.name}.png`}
            filter={`brightness(${isAvailable ? 1 : 0.7}) saturate(${
              isAvailable ? 1 : 0.5
            })`}
            w={["50%", "60%", "80%", "calc(4vh + 3vw + 10px)"]}
            h={["50%", "60%", "80%", "calc(4vh + 3vw + 10px)"]}
            _hover={{
              cursor: "pointer",
              transform: "scale(1.1)",
              transition: "transform 0.2s",
            }}
            onClick={() => {
              !isDisabled && onClick(packageInfo.name, handleSendTokens);
            }}
          />
        </Flex>
      </Tooltip>
    </Flex>
  );
};
