import { Flex } from "@chakra-ui/react";
import { BooPackageButton } from "./BooPackageButton";
import { useState, useCallback, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import {
  GET_PACKAGES_QUERY,
  GET_USER_PACKAGE_COOLDOWN_MAPPING_QUERY,
} from "../../constants/queries";
import { GetUserPackageCooldownMappingQuery } from "../../generated/graphql";
import { useUser } from "../../hooks/context/useUser";
import { ChatReturnType } from "../../hooks/chat/useChat";
import { PACKAGE_PRICE_CHANGE_EVENT } from "../../constants";
import { jp } from "../../utils/validation/jsonParse";

export const BooCarePackages = ({
  dateNow,
  chat,
}: {
  dateNow: number;
  chat: ChatReturnType;
}) => {
  const { allMessages } = chat;

  const { user } = useUser();

  const [booPackageMap, setBooPackageMap] = useState<any>(undefined);

  const [_fetchBooPackages] = useLazyQuery(GET_PACKAGES_QUERY, {
    fetchPolicy: "network-only",
  });

  const fetchBooPackages = useCallback(async () => {
    const { data } = await _fetchBooPackages();
    const packages = data?.getPackages;
    if (packages) {
      const packageMap = packages.reduce((map: any, item: any) => {
        map[item.packageName] = {
          priceMultiplier: item.priceMultiplier,
          cooldownInSeconds: item.cooldownInSeconds,
          id: item.id,
        };
        return map;
      }, {} as Record<string, { price: number; cooldown: number }>);
      setBooPackageMap(packageMap);
    }
  }, []);

  useEffect(() => {
    fetchBooPackages();
  }, []);

  const [_fetchUserBooPackageCooldownMapping] =
    useLazyQuery<GetUserPackageCooldownMappingQuery>(
      GET_USER_PACKAGE_COOLDOWN_MAPPING_QUERY,
      {
        fetchPolicy: "network-only",
      }
    );

  const [userBooPackageCooldowns, setUserBooPackageCooldowns] =
    useState<any>(undefined);

  const fetchUserBooPackageCooldownMapping = useCallback(
    async (userAddress: string) => {
      const { data } = await _fetchUserBooPackageCooldownMapping({
        variables: {
          data: { address: userAddress },
        },
      });
      const cooldownMapping = data?.getUserPackageCooldownMapping;
      if (cooldownMapping) {
        setUserBooPackageCooldowns(cooldownMapping);
      }
    },
    []
  );

  useEffect(() => {
    if (user) fetchUserBooPackageCooldownMapping(user?.address);
  }, [user]);

  useEffect(() => {
    const init = async () => {
      if (allMessages.length === 0) return;
      const latestMessage = allMessages[allMessages.length - 1];
      if (
        latestMessage &&
        latestMessage.data.body &&
        latestMessage.name === PACKAGE_PRICE_CHANGE_EVENT &&
        Date.now() - latestMessage.timestamp < 12000
      ) {
        const body = latestMessage.data.body;
        const jpBody = jp(body);
        const newPackageMap = {
          ...booPackageMap,
          [jpBody.packageName]: {
            priceMultiplier: jpBody.priceMultiplier,
            cooldownInSeconds: jpBody.cooldownInSeconds,
            id: jpBody.id,
          },
        };
        setBooPackageMap(newPackageMap);
      }
    };
    init();
  }, [allMessages]);

  return (
    <Flex flexWrap={"wrap"} justifyContent={"space-evenly"}>
      <BooPackageButton
        chat={chat}
        cooldownInSeconds={booPackageMap?.["water"]?.cooldownInSeconds ?? 0}
        userBooPackageCooldowns={userBooPackageCooldowns}
        dateNow={dateNow}
        packageInfo={{ name: "water", isCarePackage: true }}
        fetchUserBooPackageCooldownMapping={fetchUserBooPackageCooldownMapping}
      />
      <BooPackageButton
        chat={chat}
        cooldownInSeconds={
          booPackageMap?.["flashlight"]?.cooldownInSeconds ?? 0
        }
        userBooPackageCooldowns={userBooPackageCooldowns}
        dateNow={dateNow}
        packageInfo={{ name: "flashlight", isCarePackage: true }}
        fetchUserBooPackageCooldownMapping={fetchUserBooPackageCooldownMapping}
      />
    </Flex>
  );
};
