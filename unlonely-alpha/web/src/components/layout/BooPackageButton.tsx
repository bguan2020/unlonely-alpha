import { Button, Flex, Spinner } from "@chakra-ui/react";
import { useUser } from "../../hooks/context/useUser";
import { useChannelContext } from "../../hooks/context/useChannel";
import {
  InteractionType,
  PACKAGE_PRICE_CHANGE_EVENT,
  SOLANA_RPC_URL,
} from "../../constants";
import centerEllipses from "../../utils/centerEllipses";
import { useSolanaTransferTokens } from "../../hooks/internal/solana/useSolanaTransferTokens";
import { useSolanaTokenBalance } from "../../hooks/internal/solana/useSolanaTokenBalance";
import { useState } from "react";
import { useUpdatePackage } from "../../hooks/server/useUpdatePackage";
import useUpdateUserPackageCooldownMapping from "../../hooks/server/channel/useUpdateUserPackageCooldownMapping";
import { ChatReturnType } from "../../hooks/chat/useChat";
import { StreamInteractionType } from "../../generated/graphql";
import usePostStreamInteraction from "../../hooks/server/usePostStreamInteraction";

export const BooPackageButton = ({
  chat,
  cooldownInSeconds,
  userBooPackageCooldowns,
  dateNow,
  fetchUserBooPackageCooldownMapping,
  packageInfo,
}: {
  chat: ChatReturnType;
  cooldownInSeconds: number;
  userBooPackageCooldowns: any;
  dateNow: number;
  fetchUserBooPackageCooldownMapping: any;
  packageInfo: {
    name: string;
    isCarePackage: boolean;
  };
}) => {
  const { channel, chat: c } = useChannelContext();
  const { isOwner } = channel;
  const { addToChatbot } = c;
  const { user, activeWallet } = useUser();
  const { fetchTokenBalance } = useSolanaTokenBalance(SOLANA_RPC_URL);

  const [loading, setLoading] = useState(false);
  const { updatePackage } = useUpdatePackage({});

  const { postStreamInteraction } = usePostStreamInteraction({});

  const {
    updateUserPackageCooldownMapping: updateUserBooPackageCooldownMapping,
  } = useUpdateUserPackageCooldownMapping({});

  const onTransferSuccess = async () => {
    fetchTokenBalance();
    await postStreamInteraction({
      channelId: "3",
      streamInteractionType: StreamInteractionType.PackageInteraction,
      text: JSON.stringify({
        user: user?.username ?? centerEllipses(user?.address, 15),
        packageName: packageInfo.name,
        isCarePackage: packageInfo.isCarePackage,
      }),
    }).then(async () => {
      await updateUserBooPackageCooldownMapping({
        userAddress: user?.address ?? "",
        packageName: packageInfo.name,
      }).then(async () => {
        await fetchUserBooPackageCooldownMapping(user?.address ?? "");
        addToChatbot({
          username: user?.username ?? "",
          address: user?.address ?? "",
          taskType: InteractionType.USE_BOO_PACKAGE,
          title: `${
            user?.username ?? centerEllipses(user?.address, 15)
          } asked for ${packageInfo.name}!`,
          description: JSON.stringify(packageInfo),
        });
      });
    });
  };

  const { sendTokens } = useSolanaTransferTokens({
    rpcUrl: SOLANA_RPC_URL,
    onTransferSuccess,
    onTransferError: (error: any) => {
      console.error("Error sending tokens:", error);
    },
  });

  return (
    <Flex direction="column" gap="4px">
      <Button
        isDisabled={
          (userBooPackageCooldowns &&
            userBooPackageCooldowns?.[packageInfo.name]?.lastUsedAt !==
              undefined &&
            dateNow - cooldownInSeconds * 1000 <
              userBooPackageCooldowns?.[packageInfo.name]?.lastUsedAt) ||
          loading ||
          !activeWallet
        }
        onClick={async () => {
          setLoading(true);
          // await sendTokens(
          //   "CGgvGycx44rLAifbdgWihPAeQtpakubUPksCtiFKqk9i",
          //   "0.000001"
          // );
          await onTransferSuccess();
          setLoading(false);
        }}
      >
        {loading ? (
          <Spinner />
        ) : userBooPackageCooldowns &&
          userBooPackageCooldowns?.[packageInfo.name]?.lastUsedAt !==
            undefined &&
          dateNow - cooldownInSeconds * 1000 <
            userBooPackageCooldowns?.[packageInfo.name]?.lastUsedAt ? (
          `${Math.ceil(
            (userBooPackageCooldowns?.[packageInfo.name]?.lastUsedAt -
              (dateNow - cooldownInSeconds * 1000)) /
              1000
          )}s`
        ) : (
          packageInfo.name
        )}
      </Button>
      {isOwner && (
        <Flex>
          <Button
            onClick={async () => {
              const data = await updatePackage({
                packageName: packageInfo.name,
                cooldownInSeconds: cooldownInSeconds + 10,
                priceMultiplier: "1",
              });
              chat.channel?.publish({
                name: PACKAGE_PRICE_CHANGE_EVENT,
                data: {
                  body: JSON.stringify({
                    ...data?.res,
                  }),
                },
              });
            }}
          >
            Update price
          </Button>
        </Flex>
      )}
    </Flex>
  );
};
