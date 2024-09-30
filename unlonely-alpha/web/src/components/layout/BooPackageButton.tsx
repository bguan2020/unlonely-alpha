import {
  Button,
  Flex,
  IconButton,
  Spinner,
  Tooltip,
  Text,
} from "@chakra-ui/react";
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
import { useMemo, useState } from "react";
import useUpdateUserPackageCooldownMapping from "../../hooks/server/channel/useUpdateUserPackageCooldownMapping";
import { StreamInteractionType } from "../../generated/graphql";
import usePostStreamInteraction from "../../hooks/server/usePostStreamInteraction";
import { isValidAddress } from "../../utils/validation/wallet";

export const BooPackageButton = ({
  imageComponent,
  cooldownInSeconds,
  userBooPackageCooldowns,
  dateNow,
  fetchUserBooPackageCooldownMapping,
  packageInfo,
  interactionsAblyChannel,
  price,
  balanceData,
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
  price: string;
  balanceData: {
    balance: number | null;
    fetchTokenBalance: () => void;
  };
}) => {
  const { chat: c } = useChannelContext();
  const { addToChatbot } = c;
  const { user } = useUser();

  const [loading, setLoading] = useState(false);

  const { postStreamInteraction } = usePostStreamInteraction({});

  const {
    updateUserPackageCooldownMapping: updateUserBooPackageCooldownMapping,
  } = useUpdateUserPackageCooldownMapping({});

  const onTransferSuccess = async () => {
    balanceData.fetchTokenBalance();
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

  const handleSendTokens = async () => {
    setLoading(true);
    // await sendTokens(
    //   "CGgvGycx44rLAifbdgWihPAeQtpakubUPksCtiFKqk9i",
    //   "0.000001"
    // );
    await onTransferSuccess();
    setLoading(false);
  };

  const notEnoughBalance = useMemo(() => {
    if (!balanceData.balance) return true;
    return balanceData.balance < Number(price);
  }, [balanceData.balance, price]);

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
      isInCooldown ||
      loading ||
      isValidAddress(user?.address) !== "solana" ||
      notEnoughBalance
    );
  }, [isInCooldown, user, loading, notEnoughBalance]);

  return (
    <Flex direction="column" gap="4px">
      <Tooltip
        label={
          isValidAddress(user?.address) !== "solana"
            ? "log in with solana wallet first"
            : notEnoughBalance
            ? "not enough $BOO"
            : null
        }
        isDisabled={!isDisabled}
      >
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
              onClick={handleSendTokens}
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
                  (userBooPackageCooldowns?.[packageInfo.name]?.lastUsedAt -
                    (dateNow - cooldownInSeconds * 1000)) /
                    1000
                )}s`}
              </Flex>
            )}
          </Flex>
        ) : (
          <Button isDisabled={isDisabled} onClick={handleSendTokens}>
            {loading ? (
              <Spinner />
            ) : isInCooldown ? (
              `${Math.ceil(
                (userBooPackageCooldowns?.[packageInfo.name]?.lastUsedAt -
                  (dateNow - cooldownInSeconds * 1000)) /
                  1000
              )}s`
            ) : (
              packageInfo.name
            )}
          </Button>
        )}
      </Tooltip>
      <Flex justifyContent="center" direction={"column"}>
        <Text textAlign="center">{packageInfo.name}</Text>
        <Text textAlign="center">{price} $BOO</Text>
      </Flex>
    </Flex>
  );
};
