import { Button, Flex, IconButton, Spinner } from "@chakra-ui/react";
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
import { convertToHHMMSS } from "../../utils/time";

export const BooPackageButton = ({
  imageComponent,
  cooldownInSeconds,
  userBooPackageCooldowns,
  dateNow,
  fetchUserBooPackageCooldownMapping,
  packageInfo,
  interactionsAblyChannel,
  onClick,
}: {
  imageComponent?: any;
  cooldownInSeconds: number;
  userBooPackageCooldowns: any;
  dateNow: number;
  fetchUserBooPackageCooldownMapping: any;
  packageInfo: {
    name: string;
    isCarePackage: boolean;
  };
  interactionsAblyChannel: AblyChannelPromise;
  onClick: (
    packageName: string,
    callback: (...args: any[]) => Promise<void>
  ) => void;
}) => {
  const { chat: c } = useChannelContext();
  const { addToChatbot } = c;
  const { user } = useUser();

  const [loading, setLoading] = useState(false);

  const { postStreamInteraction } = usePostStreamInteraction({});

  const {
    updateUserPackageCooldownMapping: updateUserBooPackageCooldownMapping,
  } = useUpdateUserPackageCooldownMapping({});

  const onTransferSuccess = async (text: string) => {
    await postStreamInteraction({
      channelId: "3",
      streamInteractionType: StreamInteractionType.PackageInteraction,
      text: JSON.stringify({
        user: user?.username ?? centerEllipses(user?.address, 15),
        packageName: packageInfo.name,
        isCarePackage: packageInfo.isCarePackage,
      }),
    }).then(async (res) => {
      await updateUserBooPackageCooldownMapping({
        userAddress: user?.address ?? "",
        packageName: packageInfo.name,
        lastUsedAt: String(Date.now()),
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
          }),
        },
      });
    });
  };

  const handleSendTokens = async (text: string) => {
    setLoading(true);
    await onTransferSuccess(text);
    setLoading(false);
  };

  const isInCooldown = useMemo(() => {
    return (
      userBooPackageCooldowns &&
      userBooPackageCooldowns?.[packageInfo.name]?.lastUsedAt !== undefined &&
      dateNow - cooldownInSeconds * 1000 <
        userBooPackageCooldowns?.[packageInfo.name]?.lastUsedAt
    );
  }, [userBooPackageCooldowns, packageInfo, dateNow, cooldownInSeconds]);

  const isDisabled = useMemo(() => {
    return (
      isInCooldown || loading || isValidAddress(user?.address) !== "solana"
    );
  }, [isInCooldown, user, loading]);

  return (
    <Flex direction="column" gap="4px">
      {imageComponent ? (
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
          {isInCooldown && (
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
            >
              {`${Math.ceil(
                ((userBooPackageCooldowns?.[packageInfo.name]?.lastUsedAt ??
                  0) -
                  (dateNow - cooldownInSeconds * 1000)) /
                  1000
              )}s`}
            </Flex>
          )}
        </Flex>
      ) : (
        <Button
          isDisabled={isDisabled}
          onClick={() => {
            onClick(packageInfo.name, handleSendTokens);
          }}
        >
          {loading ? (
            <Spinner />
          ) : isInCooldown ? (
            convertToHHMMSS(
              String(
                Math.ceil(
                  ((userBooPackageCooldowns?.[packageInfo.name]?.lastUsedAt ??
                    0) -
                    (dateNow - (cooldownInSeconds ?? 0) * 1000)) /
                    1000
                )
              ),
              true
            )
          ) : (
            packageInfo.name
          )}
        </Button>
      )}
    </Flex>
  );
};
