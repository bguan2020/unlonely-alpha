import { Button } from "@chakra-ui/react";
import { useUser } from "../../hooks/context/useUser";

export const BooPackageButton = ({
  cooldownInSeconds,
  userBooPackageCooldowns,
  dateNow,
  packageName,
  updateUserBooPackageCooldownMapping,
  fetchCooldownMapping,
}: {
  cooldownInSeconds: number;
  userBooPackageCooldowns: any;
  dateNow: number;
  packageName: string;
  updateUserBooPackageCooldownMapping: any;
  fetchCooldownMapping: any;
}) => {
  const { user, solanaAddress } = useUser();

  return (
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
          await fetchCooldownMapping(user?.address ?? "");
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
  );
};
