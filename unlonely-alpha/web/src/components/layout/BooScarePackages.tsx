import { SimpleGrid } from "@chakra-ui/react";
import { BooPackageButton } from "./BooPackageButton";
import { AblyChannelPromise, ScarePackageName } from "../../constants";
import { RoomInfo } from "../../pages/modcenter";

const scarePackageNames: string[] = Object.values(ScarePackageName);

export const BooScarePackages = ({
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
    <SimpleGrid columns={3} height="100%" alignItems={"center"}>
      {scarePackageNames.map((name) => (
        <BooPackageButton
          booPackageMap={booPackageMap}
          key={name}
          cooldownInSeconds={booPackageMap?.[name]?.cooldownInSeconds ?? 0}
          userBooPackageCooldowns={userBooPackageCooldowns}
          dateNow={dateNow}
          packageInfo={{ name, isCarePackage: false }}
          fetchUserBooPackageCooldownMapping={
            fetchUserBooPackageCooldownMapping
          }
          isAvailable={currentRoom?.availablePackages?.includes(name) ?? false}
          interactionsAblyChannel={interactionsAblyChannel}
          onClick={onPackageClick}
        />
      ))}
    </SimpleGrid>
  );
};
