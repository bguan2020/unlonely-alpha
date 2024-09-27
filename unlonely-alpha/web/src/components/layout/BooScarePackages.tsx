import { Flex, Image } from "@chakra-ui/react";
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
      {/* {scarePackageNames.map((name) => (
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
      ))} */}
      {
        <Image
          src="/images/packages/cloud.png"
          height="100px"
          _hover={{
            cursor: "pointer",
            transform: "scale(1.1)",
            transition: "transform 0.2s",
          }}
        />
      }
      {
        <Image
          src="/images/packages/skull.png"
          height="100px"
          _hover={{
            cursor: "pointer",
            transform: "scale(1.1)",
            transition: "transform 0.2s",
          }}
        />
      }
      {
        <Image
          src="/images/packages/clown.png"
          height="100px"
          _hover={{
            cursor: "pointer",
            transform: "scale(1.1)",
            transition: "transform 0.2s",
          }}
        />
      }
    </Flex>
  );
};
