import { Flex, Text, Image, Button, Textarea, Tooltip } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import usePostStreamInteraction from "../../hooks/server/usePostStreamInteraction";
// import { StreamInteractionType } from "../../generated/graphql";
import { containsSwears } from "../../utils/validation/profanityFilter";
import { AblyChannelPromise, SEND_TTS_EVENT } from "../../constants";
import { StreamInteractionType } from "../../generated/graphql";
import { isValidAddress } from "../../utils/validation/wallet";
import { useUser } from "../../hooks/context/useUser";
import { truncateValue } from "../../utils/tokenDisplayFormatting";
import { useChannelContext } from "../../hooks/context/useChannel";
import useUpdateUserPackageCooldownMapping from "../../hooks/server/channel/useUpdateUserPackageCooldownMapping";

// export const WS_URL = "wss://sea-lion-app-j3rts.ondigitalocean.app/";

// let socket: Socket | null;

export const BooEventTtsComponent = ({
  interactionsAblyChannel,
  balanceData,
  fetchUserBooPackageCooldownMapping,
  dateNow,
  booPackageMap,
  userBooPackageCooldowns,
}: {
  interactionsAblyChannel: AblyChannelPromise;
  balanceData: {
    balance: number | null;
    fetchTokenBalance: () => void;
  };
  fetchUserBooPackageCooldownMapping: any;
  dateNow: number;
  booPackageMap: any;
  userBooPackageCooldowns: any;
}) => {
  const { user } = useUser();
  const { chat: c } = useChannelContext();
  const { addToChatbot } = c;

  const [isEnteringMessage, setIsEnteringMessage] = useState(false);
  const [text, setText] = useState("");

  const { postStreamInteraction } = usePostStreamInteraction({});

  const {
    updateUserPackageCooldownMapping: updateUserBooPackageCooldownMapping,
  } = useUpdateUserPackageCooldownMapping({});

  // useEffect(() => {
  //   socket = io(WS_URL, {
  //     transports: ["websocket"],
  //   });

  //   return () => {
  //     if (socket) {
  //       socket.disconnect();
  //     }
  //   };
  // }, []);

  const handlePost = async () => {
    await postStreamInteraction({
      channelId: "3",
      streamInteractionType: StreamInteractionType.TtsInteraction,
      text,
    }).then(async (res) => {
      await updateUserBooPackageCooldownMapping({
        userAddress: user?.address ?? "",
        packageName: "text-to-speech",
      }).then(async () => {
        await fetchUserBooPackageCooldownMapping(user?.address ?? "");
        // addToChatbot({
        //   username: user?.username ?? "",
        //   address: user?.address ?? "",
        //   taskType: InteractionType.USE_BOO_PACKAGE,
        //   title: `${
        //     user?.username ?? centerEllipses(user?.address, 15)
        //   } asked for ${packageInfo.name}!`,
        //   description: JSON.stringify(packageInfo),
        // });
      });
      await interactionsAblyChannel?.publish({
        name: SEND_TTS_EVENT,
        data: {
          body: JSON.stringify({
            id: res?.res?.id ?? "0",
            text,
          }),
        },
      });
    });
    // socket?.emit("interaction", { text });
    setText("");
    setIsEnteringMessage(false);
  };

  const notEnoughBalance = useMemo(() => {
    if (balanceData.balance === null) return true;
    return (
      balanceData.balance <
      Number(booPackageMap?.["text-to-speech"]?.priceMultiplier)
    );
  }, [balanceData.balance, booPackageMap]);

  const isInCooldown = useMemo(() => {
    return (
      userBooPackageCooldowns &&
      userBooPackageCooldowns?.["text-to-speech"]?.lastUsedAt !== undefined &&
      dateNow -
        (booPackageMap?.["text-to-speech"]?.cooldownInSeconds ?? 0) * 1000 <
        userBooPackageCooldowns?.["text-to-speech"]?.lastUsedAt
    );
  }, [userBooPackageCooldowns, dateNow, booPackageMap]);

  const isDisabled = useMemo(() => {
    return (
      isInCooldown ||
      isValidAddress(user?.address) !== "solana" ||
      notEnoughBalance
    );
  }, [user, isInCooldown, notEnoughBalance]);

  return (
    <Flex
      width="100%"
      height="100%"
      justifyContent={"center"}
      alignItems={"center"}
      onClick={() => {
        if (!isEnteringMessage) setIsEnteringMessage(true);
      }}
      position={"relative"}
    >
      {!isEnteringMessage ? (
        <Tooltip
          label={
            isValidAddress(user?.address) !== "solana"
              ? "log in with solana wallet first"
              : notEnoughBalance
              ? `need ~${truncateValue(
                  Number(booPackageMap?.["text-to-speech"]?.priceMultiplier) ??
                    0 - Number(balanceData.balance)
                )} more $BOO`
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
          >
            <Image
              src="/images/megaphone.png"
              alt="megaphone"
              width="20px"
              height="20px"
            />
            <Text textAlign={"center"} fontFamily="LoRes15" fontSize="20px">
              TTS BROADCAST MESSAGE
            </Text>
          </Flex>
        </Tooltip>
      ) : (
        <Flex direction="column" gap="4px">
          <Textarea
            id="text"
            placeholder="Enter message to broadcast"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Tooltip
            label={
              isValidAddress(user?.address) !== "solana"
                ? "log in with solana wallet first"
                : notEnoughBalance
                ? `need ~${truncateValue(
                    Number(
                      booPackageMap?.["text-to-speech"]?.priceMultiplier
                    ) ?? 0 - Number(balanceData.balance)
                  )} more $BOO`
                : null
            }
            isDisabled={!isDisabled}
          >
            <Button
              bg="#2562db"
              color={"white"}
              _hover={{
                transform: "scale(1.1)",
              }}
              onClick={handlePost}
              isDisabled={
                text.length === 0 ||
                text.length > 200 ||
                containsSwears(text) ||
                isDisabled
              }
            >
              {isInCooldown
                ? `${Math.ceil(
                    ((userBooPackageCooldowns?.["text-to-speech"]?.lastUsedAt ??
                      0) -
                      (dateNow -
                        (booPackageMap?.["text-to-speech"]?.cooldownInSeconds ??
                          0) *
                          1000)) /
                      1000
                  )}s`
                : "Send"}
            </Button>
          </Tooltip>
          <Text h="20px" color={"red"} fontSize="10px">
            {text.length > 200
              ? "message must be 200 characters or under"
              : containsSwears(text)
              ? "message contains strong swear words"
              : ""}
          </Text>
        </Flex>
      )}
    </Flex>
  );
};
