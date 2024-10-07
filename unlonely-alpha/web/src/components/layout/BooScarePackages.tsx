import { Flex, Image } from "@chakra-ui/react";
import { BooPackageButton } from "./BooPackageButton";
import { AblyChannelPromise } from "../../constants";

const scarePackageNames = ["ghost"];

export const BooScarePackages = ({
  dateNow,
  booPackageMap,
  userBooPackageCooldowns,
  fetchUserBooPackageCooldownMapping,
  interactionsAblyChannel,
  onPackageClick,
}: {
  dateNow: number;
  booPackageMap: any;
  userBooPackageCooldowns: any;
  fetchUserBooPackageCooldownMapping: any;
  interactionsAblyChannel: AblyChannelPromise;
  onPackageClick: (
    packageName: string,
    callback: (...args: any[]) => Promise<void>
  ) => void;
}) => {
  return (
    <Flex flexWrap={"wrap"} justifyContent={"space-evenly"}>
      {scarePackageNames.map((name) => (
        <BooPackageButton
          imageComponent={
            <Image
              src={`/images/packages/${name}.png`}
              height="50px"
              _hover={{
                cursor: "pointer",
                transform: "scale(1.1)",
                transition: "transform 0.2s",
              }}
            />
          }
          key={name}
          cooldownInSeconds={booPackageMap?.[name]?.cooldownInSeconds ?? 0}
          userBooPackageCooldowns={userBooPackageCooldowns}
          dateNow={dateNow}
          packageInfo={{ name, isCarePackage: false }}
          fetchUserBooPackageCooldownMapping={
            fetchUserBooPackageCooldownMapping
          }
          interactionsAblyChannel={interactionsAblyChannel}
          onClick={onPackageClick}
        />
      ))}
    </Flex>
  );
};
