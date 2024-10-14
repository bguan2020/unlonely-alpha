import React, { useEffect, useMemo, useState } from "react";
import { Flex, Text } from "@chakra-ui/react";
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

export const HomePageBooEventStreamPage = () => {
  const { chat: c } = useChannelContext();
  const { chatBot } = c;
  const chat = useChat({ chatBot });

  const { solanaAddress, handleIsManagingWallets } = useUser();

  const { balance, fetchTokenBalance } = useSolanaTokenBalance();

  const [isGlowing, setIsGlowing] = useState(false);

  const triggerGlowingEffect = () => {
    setIsGlowing(true);
    setTimeout(() => setIsGlowing(false), 3000); // Stop glowing after 3 seconds
  };

  const [dateNow, setDateNow] = useState(Date.now());
  const timeLeftInMillis = useMemo(() => {
    const now = dateNow;
    const remaining = eventStartTime - now;
    return remaining > 0 ? remaining : 0;
  }, [dateNow]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDateNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Flex direction="column" height="100vh">
      <Header />
      {timeLeftInMillis > 0 && (
        <HomePageBooEventTokenCountdown timeLeftInMillis={timeLeftInMillis} />
      )}
      <Flex
        direction={["column", "column", "row"]}
        width="100%"
        height={
          timeLeftInMillis > 0 ? "calc(100vh - 115px - 24px - 70px)" : "unset"
        }
        bg="black"
      >
        {timeLeftInMillis > 0 ? (
          <HomepageBooEventTrailer />
        ) : (
          <HomepageBooEventStream
            dateNow={dateNow}
            isModalGlowing={isGlowing}
            balanceData={{ balance, fetchTokenBalance }}
          />
        )}
        <Flex
          direction="column"
          width={
            timeLeftInMillis > 0
              ? ["100%", "100%", "40%"]
              : ["100%", "100%", "20%"]
          }
          height="100%"
        >
          <ChatComponent
            chat={chat}
            customHeight="100%"
            tokenForTransfer="vibes"
            noTabs
            tokenGating={
              (balance && balance > 0 && solanaAddress) || timeLeftInMillis > 0
                ? undefined
                : solanaAddress
                ? {
                    ctaBuyTokens: triggerGlowingEffect,
                    gateMessage: "BUY $BOO TO JOIN CHAT",
                  }
                : {
                    ctaBuyTokens: () => handleIsManagingWallets(true),
                    gateMessage: "SWITCH TO SOLANA",
                  }
            }
            noClipping
          />
        </Flex>
      </Flex>
      {timeLeftInMillis > 0 && (
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
          <Link href="https://t.me/+IE_BA-tyLIA5MzZh" passHref target="_blank">
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
