import { Flex, Text, Tooltip } from "@chakra-ui/react";
import { useMemo } from "react";
import { isValidAddress } from "../../utils/validation/wallet";
import useUpdateUserPackageCooldownMapping from "../../hooks/server/channel/useUpdateUserPackageCooldownMapping";
import { useUser } from "../../hooks/context/useUser";
import { convertToHHMMSS } from "../../utils/time";

export const BooPackageCooldownResetComponent = ({
  dateNow,
  booPackageMap,
  handleBooPackageMap,
  userBooPackageCooldowns,
}: {
  dateNow: number;
  booPackageMap: any;
  handleBooPackageMap: (mapping: any) => void;
  userBooPackageCooldowns: any;
}) => {
  const { user } = useUser();

  const {
    updateUserPackageCooldownMapping: updateUserBooPackageCooldownMapping,
  } = useUpdateUserPackageCooldownMapping({});

  const isInCooldown = useMemo(() => {
    return (
      userBooPackageCooldowns &&
      userBooPackageCooldowns?.["reset-cooldowns"]?.lastUsedAt !== undefined &&
      dateNow -
        (booPackageMap?.["reset-cooldowns"]?.cooldownInSeconds ?? 0) * 1000 <
        userBooPackageCooldowns?.["reset-cooldowns"]?.lastUsedAt
    );
  }, [userBooPackageCooldowns, dateNow, booPackageMap]);

  const isDisabled = useMemo(() => {
    return isInCooldown || isValidAddress(user?.address) !== "solana";
  }, [user, isInCooldown]);

  const handleReset = async () => {
    const { res } = await updateUserBooPackageCooldownMapping({
      userAddress: user?.address ?? "",
      packageName: "reset-cooldowns",
      lastUsedAt: String(Date.now()),
    });
    const newMapping = res?.packageCooldownMapping;
    handleBooPackageMap(newMapping);
  };

  return (
    <Flex
      width="100%"
      height="100%"
      justifyContent={"center"}
      alignItems={"center"}
      onClick={() => {
        if (!isDisabled) handleReset();
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
          {isInCooldown && (
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
              {convertToHHMMSS(
                String(
                  Math.ceil(
                    ((userBooPackageCooldowns?.["reset-cooldowns"]
                      ?.lastUsedAt ?? 0) -
                      (dateNow -
                        (booPackageMap?.["reset-cooldowns"]
                          ?.cooldownInSeconds ?? 0) *
                          1000)) /
                      1000
                  )
                ),
                true
              )}
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
