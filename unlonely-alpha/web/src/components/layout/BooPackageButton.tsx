import { Button, Flex, Spinner } from "@chakra-ui/react";
import { useUser } from "../../hooks/context/useUser";
import { useChannelContext } from "../../hooks/context/useChannel";
import {
  AblyChannelPromise,
  InteractionType,
  PACKAGE_PURCHASE_EVENT,
  SOLANA_RPC_URL,
} from "../../constants";
import centerEllipses from "../../utils/centerEllipses";
import { useSolanaTransferTokens } from "../../hooks/internal/solana/useSolanaTransferTokens";
import { useSolanaTokenBalance } from "../../hooks/internal/solana/useSolanaTokenBalance";
import { useState } from "react";
import useUpdateUserPackageCooldownMapping from "../../hooks/server/channel/useUpdateUserPackageCooldownMapping";
import { StreamInteractionType } from "../../generated/graphql";
import usePostStreamInteraction from "../../hooks/server/usePostStreamInteraction";

export const BooPackageButton = ({
  cooldownInSeconds,
  userBooPackageCooldowns,
  dateNow,
  fetchUserBooPackageCooldownMapping,
  packageInfo,
  interactionsAblyChannel,
}: {
  cooldownInSeconds: number;
  userBooPackageCooldowns: any;
  dateNow: number;
  fetchUserBooPackageCooldownMapping: any;
  packageInfo: {
    name: string;
    isCarePackage: boolean;
  };
  interactionsAblyChannel: AblyChannelPromise;
}) => {
  const { chat: c } = useChannelContext();
  const { addToChatbot } = c;
  const { user, activeWallet } = useUser();
  const { fetchTokenBalance } = useSolanaTokenBalance(SOLANA_RPC_URL);

  const [loading, setLoading] = useState(false);

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
    }).then(async (res) => {
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
    </Flex>
  );
};
