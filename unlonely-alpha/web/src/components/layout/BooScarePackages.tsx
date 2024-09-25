import { Flex } from "@chakra-ui/react";
import { BooPackageButton } from "./BooPackageButton";

const scarePackageNames = ["ghost"];

export const BooScarePackages = ({
  dateNow,
  booPackageMap,
  userBooPackageCooldowns,
  fetchUserBooPackageCooldownMapping,
}: {
  dateNow: number;
  booPackageMap: any;
  userBooPackageCooldowns: any;
  fetchUserBooPackageCooldownMapping: any;
}) => {
  return (
    <Flex flexWrap={"wrap"} justifyContent={"space-evenly"}>
      {scarePackageNames.map((name) => (
        <BooPackageButton
          key={name}
          cooldownInSeconds={booPackageMap?.[name]?.cooldownInSeconds ?? 0}
          userBooPackageCooldowns={userBooPackageCooldowns}
          dateNow={dateNow}
          packageInfo={{ name, isCarePackage: false }}
          fetchUserBooPackageCooldownMapping={
            fetchUserBooPackageCooldownMapping
          }
        />
      ))}
    </Flex>
  );
};
