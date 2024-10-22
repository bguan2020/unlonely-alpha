import { Flex, Image, Tooltip, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { isValidAddress } from "../../utils/validation/wallet";
import useUpdateUserPackageCooldownMapping from "../../hooks/server/channel/useUpdateUserPackageCooldownMapping";
import { useUser } from "../../hooks/context/useUser";
import { convertToHHMMSS } from "../../utils/time";
import {
  RESET_COOLDOWNS_NAME,
  TEXT_TO_SPEECH_PACKAGE_NAME,
} from "../../constants";
import { RoomInfo } from "../../pages/modcenter";

export const BooPackageCooldownResetComponent = ({
  dateNow,
  currentRoom,
  booPackageMap,
  userBooPackageCooldowns,
  handleUserBooPackageCooldowns,
  onClick,
}: {
  dateNow: number;
  currentRoom: RoomInfo | undefined;
  booPackageMap: any;
  userBooPackageCooldowns: any;
  handleUserBooPackageCooldowns: (mapping: any) => void;
  onClick: (callback: (...args: any[]) => Promise<void>) => void;
}) => {
  const { user } = useUser();

  const {
    updateUserPackageCooldownMapping: updateUserBooPackageCooldownMapping,
  } = useUpdateUserPackageCooldownMapping({});

  const cooldownCountdown = useMemo(() => {
    return Math.ceil(
      ((userBooPackageCooldowns?.[RESET_COOLDOWNS_NAME]?.lastUsedAt ?? 0) -
        (dateNow -
          (booPackageMap?.[RESET_COOLDOWNS_NAME]?.cooldownInSeconds ?? 0) *
            1000)) /
        1000
    );
  }, [userBooPackageCooldowns, dateNow, booPackageMap]);

  const hasOtherCooldowns = useMemo(() => {
    const iterable = Object.entries(userBooPackageCooldowns ?? {}).filter(
      ([key]) =>
        currentRoom?.availablePackages.includes(key) ||
        key === TEXT_TO_SPEECH_PACKAGE_NAME
    );
    for (const [key, value] of iterable) {
      if (
        dateNow - (booPackageMap?.[key]?.cooldownInSeconds ?? 0) * 1000 <
          (value as any)?.lastUsedAt ||
        ((value as any)?.usableAt ?? 0) > dateNow
      ) {
        return true;
      }
    }
    return false;
  }, [dateNow, userBooPackageCooldowns, booPackageMap]);

  const isDisabled = useMemo(() => {
    return (
      cooldownCountdown > 0 ||
      isValidAddress(user?.address) !== "solana" ||
      !hasOtherCooldowns
    );
  }, [user, cooldownCountdown, hasOtherCooldowns]);

  const handleReset = async () => {
    const { res } = await updateUserBooPackageCooldownMapping({
      userAddress: user?.address ?? "",
      newPackageCooldownChanges: [
        {
          name: RESET_COOLDOWNS_NAME,
          lastUsedAt: String(dateNow),
          usableAt: "0",
        },
      ],
      replaceExisting: true,
    });
    const newMapping = res?.packageCooldownMapping;
    handleUserBooPackageCooldowns(newMapping);
  };

  return (
    <Flex
      width="100%"
      height="100%"
      justifyContent={"center"}
      alignItems={"center"}
      onClick={() => {
        if (!isDisabled) onClick(handleReset);
      }}
      position={"relative"}
    >
      <Tooltip
        bg={isValidAddress(user?.address) !== "solana" ? "unset" : "#7EFB97"}
        placement="bottom-end"
        color={isValidAddress(user?.address) !== "solana" ? "unset" : "black"}
        label={
          isValidAddress(user?.address) !== "solana"
            ? "log in with solana wallet first"
            : "don’t want to wait? reset cooldown period here"
        }
      >
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          direction="column"
          _hover={{
            cursor: "pointer",
          }}
          p="10px"
          position={"relative"}
        >
          {cooldownCountdown > 0 && (
            <Flex
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg="blackAlpha.900"
              justifyContent="center"
              alignItems="center"
              borderRadius="10px"
            >
              {convertToHHMMSS(String(cooldownCountdown), true)}
            </Flex>
          )}
          <Text fontFamily="LoRes15" fontSize="30px" color="#FF9800">
            COOLDOWN
          </Text>
          <Image src={"/images/packages/reset.png"} />
        </Flex>
      </Tooltip>
    </Flex>
  );
};
