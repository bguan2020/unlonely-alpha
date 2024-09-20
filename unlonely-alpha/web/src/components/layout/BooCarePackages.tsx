import { Flex } from "@chakra-ui/react";
import { BooPackageButton } from "./BooPackageButton";

export const BooCarePackages = ({
  booPackages,
  userBooPackageCooldowns,
  updateUserBooPackageCooldownMapping: updateForUser,
  fetchUserBooPackageCooldownMapping,
  updateBooPackage: updatePrice,
  dateNow,
}: {
  booPackages: any;
  userBooPackageCooldowns: any;
  updateUserBooPackageCooldownMapping: any;
  fetchUserBooPackageCooldownMapping: any;
  updateBooPackage: any;
  dateNow: number;
}) => {
  return (
    <Flex flexWrap={"wrap"} justifyContent={"space-evenly"}>
      <BooPackageButton
        cooldownInSeconds={
          booPackages.find((p: any) => p.packageName === "water")
            ?.cooldownInSeconds ?? 0
        }
        userBooPackageCooldowns={userBooPackageCooldowns}
        dateNow={dateNow}
        packageInfo={{ name: "water", isCarePackage: true }}
        updateBooPackage={updatePrice}
        updateUserBooPackageCooldownMapping={updateForUser}
        fetchUserBooPackageCooldownMapping={fetchUserBooPackageCooldownMapping}
      />
      <BooPackageButton
        cooldownInSeconds={
          booPackages.find((p: any) => p.packageName === "flashlight")
            ?.cooldownInSeconds ?? 0
        }
        userBooPackageCooldowns={userBooPackageCooldowns}
        dateNow={dateNow}
        packageInfo={{ name: "flashlight", isCarePackage: true }}
        updateBooPackage={updatePrice}
        updateUserBooPackageCooldownMapping={updateForUser}
        fetchUserBooPackageCooldownMapping={fetchUserBooPackageCooldownMapping}
      />
    </Flex>
  );
};
