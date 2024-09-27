import { Flex, Image } from "@chakra-ui/react";
import { BooPackageButton } from "./BooPackageButton";

const carePackageNames = ["water", "flashlight"];

export const BooCarePackages = ({
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
      {/* {carePackageNames.map((name) => (
        <BooPackageButton
          key={name}
          cooldownInSeconds={booPackageMap?.[name]?.cooldownInSeconds ?? 0}
          userBooPackageCooldowns={userBooPackageCooldowns}
          dateNow={dateNow}
          packageInfo={{ name, isCarePackage: true }}
          fetchUserBooPackageCooldownMapping={
            fetchUserBooPackageCooldownMapping
          }
        />
      ))} */}
      {
        <Image
          src="/images/packages/light.png"
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
          src="/images/packages/food.png"
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
          src="/images/packages/water.png"
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
