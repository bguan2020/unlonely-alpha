import { Button, Flex } from "@chakra-ui/react";
import { useUser } from "../../hooks/context/useUser";
import { useChannelContext } from "../../hooks/context/useChannel";
import { InteractionType, SOLANA_RPC_URL } from "../../constants";
import centerEllipses from "../../utils/centerEllipses";
import { useSolanaTransferTokens } from "../../hooks/internal/solana/useSolanaTransferTokens";
import { useSolanaTokenBalance } from "../../hooks/internal/solana/useSolanaTokenBalance";

export const BooPackageButton = ({
  cooldownInSeconds,
  userBooPackageCooldowns,
  dateNow,
  updateUserBooPackageCooldownMapping,
  updateBooPackage,
  fetchUserBooPackageCooldownMapping,
  packageInfo,
}: {
  cooldownInSeconds: number;
  userBooPackageCooldowns: any;
  dateNow: number;
  updateUserBooPackageCooldownMapping: any;
  updateBooPackage: any;
  fetchUserBooPackageCooldownMapping: any;
  packageInfo: {
    name: string;
    isCarePackage: boolean;
  };
}) => {
  const { channel, chat } = useChannelContext();
  const { isOwner } = channel;
  const { addToChatbot } = chat;
  const { user } = useUser();
  const { fetchTokenBalance } = useSolanaTokenBalance(SOLANA_RPC_URL);

  const { sendTokens } = useSolanaTransferTokens({
    rpcUrl: SOLANA_RPC_URL,
    onTransferSuccess: async () => {
      fetchTokenBalance();
      await updateUserBooPackageCooldownMapping({
        userAddress: user?.address ?? "",
        packageName: packageInfo.name,
      }).then(async () => {
        await fetchUserBooPackageCooldownMapping(user?.address ?? "");
        addToChatbot({
          username: user?.username ?? "",
          address: user?.address ?? "",
          taskType: InteractionType.USE_BOO_PACKAGE,
          title: `${user?.username ?? centerEllipses(user?.address, 15)} used ${
            packageInfo.name
          }!`,
          description: JSON.stringify(packageInfo),
        });
      });
    },
    onTransferError: (error: any) => {
      console.error("Error sending tokens:", error);
    },
  });

  return (
    <Flex direction="column">
      <Button
        isDisabled={
          userBooPackageCooldowns &&
          userBooPackageCooldowns?.[packageInfo.name]?.lastUsedAt !==
            undefined &&
          dateNow - cooldownInSeconds * 1000 <
            userBooPackageCooldowns?.[packageInfo.name]?.lastUsedAt
        }
        onClick={async () => {
          sendTokens("CGgvGycx44rLAifbdgWihPAeQtpakubUPksCtiFKqk9i", "0.01");
        }}
      >
        {userBooPackageCooldowns &&
        userBooPackageCooldowns?.[packageInfo.name]?.lastUsedAt !== undefined &&
        dateNow - cooldownInSeconds * 1000 <
          userBooPackageCooldowns?.[packageInfo.name]?.lastUsedAt
          ? `${Math.ceil(
              (userBooPackageCooldowns?.[packageInfo.name]?.lastUsedAt -
                (dateNow - cooldownInSeconds * 1000)) /
                1000
            )}s`
          : packageInfo.name}
      </Button>
      {isOwner && (
        <Flex>
          <Button
            onClick={async () => {
              const { data: newPackage } = await updateBooPackage({
                packageName: packageInfo.name,
                cooldownInSeconds: cooldownInSeconds + 10,
                priceMultiplier: "1",
              });
            }}
          >
            Update {packageInfo.name}
          </Button>
        </Flex>
      )}
    </Flex>
  );
};
