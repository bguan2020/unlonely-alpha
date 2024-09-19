import { Button, Flex } from "@chakra-ui/react";
import { useUser } from "../../hooks/context/useUser";
import { useChannelContext } from "../../hooks/context/useChannel";

export const BooPackageButton = ({
  cooldownInSeconds,
  userBooPackageCooldowns,
  dateNow,
  packageName,
  updateUserBooPackageCooldownMapping,
  updateBooPackage,
  fetchUserBooPackageCooldownMapping,
}: {
  cooldownInSeconds: number;
  userBooPackageCooldowns: any;
  dateNow: number;
  packageName: string;
  updateUserBooPackageCooldownMapping: any;
  updateBooPackage: any;
  fetchUserBooPackageCooldownMapping: any;
}) => {
  const { channel } = useChannelContext();
  const { isOwner } = channel;
  const { user, solanaAddress } = useUser();

  return (
    <Flex direction="column">
      <Button
        isDisabled={
          userBooPackageCooldowns &&
          userBooPackageCooldowns?.[packageName]?.lastUsedAt !== undefined &&
          dateNow - cooldownInSeconds * 1000 <
            userBooPackageCooldowns?.[packageName]?.lastUsedAt
        }
        onClick={async () => {
          await updateUserBooPackageCooldownMapping({
            userAddress: solanaAddress ?? "",
            packageName: packageName,
          }).then(async () => {
            await fetchUserBooPackageCooldownMapping(user?.address ?? "");
          });
        }}
      >
        {userBooPackageCooldowns &&
        userBooPackageCooldowns?.[packageName]?.lastUsedAt !== undefined &&
        dateNow - cooldownInSeconds * 1000 <
          userBooPackageCooldowns?.[packageName]?.lastUsedAt
          ? `${Math.ceil(
              (userBooPackageCooldowns?.[packageName]?.lastUsedAt -
                (dateNow - cooldownInSeconds * 1000)) /
                1000
            )}s`
          : packageName}
      </Button>
      {isOwner && (
        <Flex>
          <Button
            onClick={async () => {
              const { data: newPackage } = await updateBooPackage({
                packageName: packageName,
                cooldownInSeconds: cooldownInSeconds + 10,
                priceMultiplier: "1",
              });
            }}
          >
            Update {packageName}
          </Button>
        </Flex>
      )}
    </Flex>
  );
};
