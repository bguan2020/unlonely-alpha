import { Flex, IconButton, Tooltip } from "@chakra-ui/react";
import { useUser } from "../../hooks/context/useUser";
import { useChannelContext } from "../../hooks/context/useChannel";
import {
  AblyChannelPromise,
  InteractionType,
  PACKAGE_PURCHASE_EVENT,
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
  imageComponent,
  cooldownInSeconds,
  userBooPackageCooldowns,
  dateNow,
  fetchUserBooPackageCooldownMapping,
  packageInfo,
  interactionsAblyChannel,
  booPackageMap,
  onClick,
}: {
  imageComponent: any;
  cooldownInSeconds: number;
  userBooPackageCooldowns: any;
  dateNow: number;
  fetchUserBooPackageCooldownMapping: any;
  packageInfo: {
    name: string;
    isCarePackage: boolean;
  };
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
      isValidAddress(user?.address) !== "solana"
    );
  }, [cooldownCountdown, user, loading]);

  return (
    <Flex direction="column" gap="4px">
      <Tooltip
        label={
          isValidAddress(user?.address) !== "solana"
            ? "log in with solana wallet first"
            : null
        }
        isDisabled={!isDisabled}
      >
        <Flex position="relative" justifyContent={"center"}>
          <IconButton
            bg="transparent"
            _focus={{}}
            _active={{}}
            _hover={{}}
            icon={imageComponent}
            aria-label={`${packageInfo.name}-package`}
            isDisabled={isDisabled}
            onClick={() => {
              onClick(packageInfo.name, handleSendTokens);
            }}
          />
          {cooldownCountdown.displayCooldown > 0 && (
            <Flex
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg="blackAlpha.500"
              justifyContent="center"
              alignItems="center"
              borderRadius="15px"
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
        </Flex>
      </Tooltip>
    </Flex>
  );
};
