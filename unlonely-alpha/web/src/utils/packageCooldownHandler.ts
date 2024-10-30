import { RESET_COOLDOWNS_NAME } from "../constants";
import { PackageInfo } from "../pages/modcenter";

type NewPackageCooldown = {
  name: string;
  lastUsedAt: string;
  usableAt: string;
};

const SECONDARY_COOLDOWN_IN_MILLIS = 15 * 60 * 1000;

export const createPackageCooldownArray = (
  _packageMap: any,
  _userPackageCooldownMapping: any,
  nameOfPackageUsed: string,
  namesOfPackagesExcused: string[] = [RESET_COOLDOWNS_NAME]
): NewPackageCooldown[] => {
  const packageMap: Record<string, PackageInfo> = { ..._packageMap };

  const now = Date.now();

  const array = Object.keys(packageMap).map((name) => {
    if (name === nameOfPackageUsed) {
      return {
        name,
        lastUsedAt: String(now),
        usableAt: _userPackageCooldownMapping?.[name]?.usableAt ?? "0",
      };
    } else if (!(namesOfPackagesExcused?.includes(name))) {
      return {
        name,
        lastUsedAt: _userPackageCooldownMapping?.[name]?.lastUsedAt ?? "0",
        usableAt: String(now + SECONDARY_COOLDOWN_IN_MILLIS),
      };
    } else {
      return null;
    }
  });

  return array.filter((item) => item !== null) as NewPackageCooldown[];
};
