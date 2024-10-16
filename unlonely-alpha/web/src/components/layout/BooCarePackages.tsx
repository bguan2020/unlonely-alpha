import { Flex, Image } from "@chakra-ui/react";
import { BooPackageButton } from "./BooPackageButton";
import { AblyChannelPromise } from "../../constants";
import { RoomInfo } from "../../pages/modcenter";

const carePackageNames = ["water", "flashlight"];

export const BooCarePackages = ({
  dateNow,
  currentRoom,
  booPackageMap,
  userBooPackageCooldowns,
  fetchUserBooPackageCooldownMapping,
  interactionsAblyChannel,
  onPackageClick,
}: {
  dateNow: number;
  currentRoom: RoomInfo | undefined;
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
      {carePackageNames
        .filter((name) => currentRoom?.availablePackages.includes(name))
        .map((name) => (
          <BooPackageButton
            booPackageMap={booPackageMap}
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
            packageInfo={{ name, isCarePackage: true }}
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
