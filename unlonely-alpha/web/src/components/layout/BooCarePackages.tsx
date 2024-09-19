import { Flex } from "@chakra-ui/react";
import { BooPackageButton } from "./BooPackageButton";

const WATER_PACKAGE_COOLDOWN = 90; // seconds
const FLASHLIGHT_PACKAGE_COOLDOWN = 120; // seconds

export const BooCarePackages = ({
  userBooPackageCooldowns,
  updateUserBooPackageCooldownMapping: update,
  fetchCooldownMapping,
  dateNow,
}: {
  userBooPackageCooldowns: any;
  updateUserBooPackageCooldownMapping: any;
  fetchCooldownMapping: any;
  dateNow: number;
}) => {
  return (
    <Flex flexWrap={"wrap"} justifyContent={"space-evenly"}>
      <BooPackageButton
        cooldownInSeconds={WATER_PACKAGE_COOLDOWN}
        userBooPackageCooldowns={userBooPackageCooldowns}
        dateNow={dateNow}
        packageName={"water"}
        updateUserBooPackageCooldownMapping={update}
        fetchCooldownMapping={fetchCooldownMapping}
      />
      <BooPackageButton
        cooldownInSeconds={FLASHLIGHT_PACKAGE_COOLDOWN}
        userBooPackageCooldowns={userBooPackageCooldowns}
        dateNow={dateNow}
        packageName={"flashlight"}
        updateUserBooPackageCooldownMapping={update}
        fetchCooldownMapping={fetchCooldownMapping}
      />
    </Flex>
  );
};
