import { Flex, Text, Tooltip } from "@chakra-ui/react";
import { useMemo } from "react";
import { isValidAddress } from "../../utils/validation/wallet";
import useUpdateUserPackageCooldownMapping from "../../hooks/server/channel/useUpdateUserPackageCooldownMapping";
import { useUser } from "../../hooks/context/useUser";
import { convertToHHMMSS } from "../../utils/time";

export const BooPackageCooldownResetComponent = ({
  dateNow,
  booPackageMap,
  userBooPackageCooldowns,
  handleUserBooPackageCooldowns,
  onClick,
}: {
  dateNow: number;
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
      ((userBooPackageCooldowns?.["reset-cooldowns"]?.lastUsedAt ?? 0) -
        (dateNow -
          (booPackageMap?.["reset-cooldowns"]?.cooldownInSeconds ?? 0) *
            1000)) /
        1000
    );
  }, [userBooPackageCooldowns, dateNow, booPackageMap]);

  const hasOtherCooldowns = useMemo(() => {
    const iterable = Object.entries(userBooPackageCooldowns ?? {});
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
          name: "reset-cooldowns",
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
        label={
          isValidAddress(user?.address) !== "solana"
            ? "log in with solana wallet first"
            : null
        }
        isDisabled={!isDisabled}
      >
        <Flex
          alignItems={"center"}
          justifyContent={"center"}
          gap="16px"
          _hover={{
            cursor: "pointer",
            transform: "scale(1.1)",
            transition: "transform 0.2s",
          }}
          border={"1px solid #b8b8b8"}
          borderRadius={"10px"}
          padding="10px"
          position={"relative"}
        >
          {cooldownCountdown > 0 && (
            <Flex
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg="blackAlpha.800"
              justifyContent="center"
              alignItems="center"
              borderRadius="10px"
            >
              {convertToHHMMSS(String(cooldownCountdown), true)}
            </Flex>
          )}
          <Text textAlign={"center"} fontFamily="LoRes15" fontSize="20px">
            reset
          </Text>
        </Flex>
      </Tooltip>
    </Flex>
  );
};
