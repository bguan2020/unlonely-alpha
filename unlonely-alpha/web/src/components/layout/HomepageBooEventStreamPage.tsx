import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Flex,
  Modal,
  ModalContent,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { useChat } from "../../hooks/chat/useChat";
import ChatComponent from "../chat/ChatComponent";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useSolanaTokenBalance } from "../../hooks/internal/solana/useSolanaTokenBalance";
import { useUser } from "../../hooks/context/useUser";
import { HomepageBooEventStream } from "./HomepageBooEventStream";
import { eventStartTime } from "./BooEventWrapper";
import { HomePageBooEventTokenCountdown } from "./HomepageBooEventCountdown";
import { HomepageBooEventTrailer } from "./HomepageBooEventTrailer";
import Link from "next/link";
import Header from "../navigation/Header";
import { areAddressesEqual } from "../../utils/validation/wallet";

export const HomePageBooEventStreamPage = () => {
  const { chat: c, channel } = useChannelContext();
  const { channelQueryData, channelRoles } = channel;
  const { chatBot } = c;
  const chat = useChat({ chatBot });

  const { user, solanaAddress, logout } = useUser();

  const balanceData = useSolanaTokenBalance();

  const [isGlowing, setIsGlowing] = useState(false);

  const triggerGlowingEffect = () => {
    setIsGlowing(true);
    setTimeout(() => setIsGlowing(false), 3000); // Stop glowing after 3 seconds
  };

  const [dateNow, setDateNow] = useState(Date.now());
  const [isOpen, setIsOpen] = useState(false);
  const timeLeftInMillis = useMemo(() => {
    const now = dateNow;
    const remaining = eventStartTime - now;
    return remaining > 0 ? remaining : 0;
  }, [dateNow]);

  const isThereTimeLeft = useMemo(() => {
    // return timeLeftInMillis > 0;
    // todo: uncomment this line
    return false;
  }, [timeLeftInMillis]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDateNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const userIsChannelOwner = useMemo(
    () =>
      areAddressesEqual(
        user?.address ?? "",
        channelQueryData?.owner?.address ?? ""
      ),
    [user, channelQueryData]
  );

  const userIsModerator = useMemo(
    () =>
      channelRoles?.some((m) => m?.address === user?.address && m?.role === 2),
    [user, channelRoles]
  );

  return (
    <Flex direction="column" height="100vh">
      <Header />
      {isThereTimeLeft && (
        <HomePageBooEventTokenCountdown timeLeftInMillis={timeLeftInMillis} />
      )}
      <Modal
        isCentered
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="sm"
      >
        <ModalOverlay backgroundColor="#230f6683" />
        <ModalContent
          maxW="500px"
          boxShadow="0px 8px 28px #0a061c40"
          padding="12px"
          borderRadius="5px"
          bg="#281b5a"
        >
          <Flex direction="column">
            <Text textAlign="center">
              Please log out and log in with your solana account.
            </Text>
            <Button
              width="100%"
              borderRadius="25px"
              _hover={{}}
              _focus={{}}
              _active={{}}
              color="white"
              bg="#E09025"
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
            >
              logout
            </Button>
          </Flex>
        </ModalContent>
      </Modal>
      <Flex
        direction={["column", "column", "row"]}
        width="100%"
        height={isThereTimeLeft ? "calc(100vh - 100px - 24px - 70px)" : "100%"}
        bg="black"
      >
        {isThereTimeLeft ? (
          <HomepageBooEventTrailer />
        ) : (
          <HomepageBooEventStream
            dateNow={dateNow}
            isModalGlowing={isGlowing}
            balanceData={balanceData}
            triggerGlowingEffect={triggerGlowingEffect}
          />
        )}
        <Flex
          direction="column"
          width={
            isThereTimeLeft ? ["100%", "100%", "30%"] : ["100%", "100%", "20%"]
          }
          height="100%"
        >
          <ChatComponent
            chat={chat}
            customHeight="100%"
            tokenForTransfer="vibes"
            noTabs
            tokenGating={
              (balanceData.balance &&
                balanceData.balance > 0 &&
                solanaAddress) ||
              isThereTimeLeft
                ? undefined
                : solanaAddress
                ? {
                    ctaBuyTokens: triggerGlowingEffect,
                    gateMessage: "BUY $BOO TO JOIN CHAT",
                  }
                : {
                    ctaBuyTokens: () => setIsOpen(true),
                    gateMessage: "SWITCH TO SOLANA",
                  }
            }
            noClipping={!userIsChannelOwner && !userIsModerator}
          />
        </Flex>
      </Flex>
      {isThereTimeLeft && (
        <Flex
          justifyContent={"space-between"}
          px="10px"
          h="24px"
          backgroundImage="url('/svg/gradient.svg')"
          backgroundSize="cover" // Adjust as needed
          backgroundPosition="bottom" // Adjusted to show the bottom part of the image
        >
          <Link
            href="https://www.unlonely.app/privacy"
            passHref
            target="_blank"
          >
            <Text fontFamily="LoRes15">privacy</Text>
          </Link>
          <Link
            href="https://super-okra-6ad.notion.site/Unlonely-Terms-of-Service-b3c0ea0272c943e98e3120243955cd75?pvs=4"
            passHref
            target="_blank"
          >
            <Text fontFamily="LoRes15">terms</Text>
          </Link>
          <Link href="https://bit.ly/unlonelyFAQs" passHref target="_blank">
            <Text fontFamily="LoRes15">faq</Text>
          </Link>
          <Link href="https://t.me/+c19n9g-FxZszODIx" passHref target="_blank">
            <Text fontFamily="LoRes15">telegram</Text>
          </Link>
          <Link
            href="https://twitter.com/unlonely_app"
            passHref
            target="_blank"
          >
            <Text fontFamily="LoRes15">twitter</Text>
          </Link>
        </Flex>
      )}
    </Flex>
  );
};
