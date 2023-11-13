import { Flex, Text, Image } from "@chakra-ui/react";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useCountUp } from "react-countup";

import { CHAT_MESSAGE_EVENT, InteractionType } from "../../constants";
import { ChatReturnType } from "../../hooks/chat/useChat";
import { useChannelContext } from "../../hooks/context/useChannel";
import { BlastRain } from "../chat/emoji/BlastRain";
import { BorderType, OuterBorder } from "../general/OuterBorder";

const debounceDelay = 1000; // milliseconds

const NUMBER_DECIMAL_THRESHOLD = 0.0000000001;

const TournamentPot = ({ chat }: { chat: ChatReturnType }) => {
  const { ui } = useChannelContext();
  const { vipPool, tournamentActive } = ui;

  const countUpRef = useRef(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio("/mp3/coin.mp3"));
  const canPlaySound = useRef<boolean>(true);
  const [debouncedVipPool, setDebouncedVipPool] = useState(vipPool);
  const [coinQueue, setCoinQueue] = useState<string[]>([]);
  const [receivedCalls, setReceivedCalls] = useState<number>(0);

  const coinBlast = () => {
    setCoinQueue((prev) => [...prev, Date.now().toString()]);
  };

  const removeCoin = useCallback((uid: string) => {
    setCoinQueue((prev) => prev.filter((e) => e !== uid));
  }, []);

  const rainComponents = useMemo(
    () =>
      coinQueue.map((c) => (
        <BlastRain
          key={c}
          emoji={
            <Image
              src={"https://i.gifer.com/Fw3P.gif"}
              sx={{
                animation:
                  Number(c) % 2 === 0
                    ? "rotate-clockwise 5s linear infinite"
                    : "rotate-counterclockwise 5s linear infinite",
              }}
            />
          }
          uid={c}
          remove={removeCoin}
          config={{
            notFixed: true,
            numParticles: 9,
            durationInMillis: 5000,
            vertSpeed: 4,
            downward: true,
          }}
        />
      )),
    [coinQueue, removeCoin]
  );

  useEffect(() => {
    // Cleanup function to pause audio when the component unmounts
    return () => {
      audioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    // Define a function to handle the audio ended event
    const handleAudioEnd = () => {
      console.log("Sound has finished playing");
      canPlaySound.current = true;
      // Perform any additional logic you need when audio finishes here
    };

    // Add event listener for the 'ended' event
    const audio = audioRef.current;
    audio.addEventListener("ended", handleAudioEnd);

    // Cleanup the event listener when the component unmounts
    return () => {
      audio.removeEventListener("ended", handleAudioEnd);
    };
  }, []);

  const playSound = () => {
    // Play the audio file
    audioRef.current.play().catch((error) => {
      console.error("Playback failed", error);
    });
  };

  const { update } = useCountUp({
    ref: countUpRef,
    start: 0,
    end: Number(debouncedVipPool),
    delay: 0,
    duration: 1,
    decimals:
      Number(debouncedVipPool) === 0
        ? 0
        : Number(debouncedVipPool) > 1
        ? 3
        : 10,
    useEasing: true,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedVipPool(vipPool);
    }, debounceDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [vipPool]);

  useEffect(() => {
    update(Number(debouncedVipPool));
    if (receivedCalls > 0) {
      if (canPlaySound.current) {
        canPlaySound.current = false;
        playSound();
      }
      coinBlast();
      setReceivedCalls(0);
    }
  }, [debouncedVipPool, update]);

  useEffect(() => {
    const latestMessage =
      chat.receivedMessages[chat.receivedMessages.length - 1];
    if (
      latestMessage &&
      latestMessage.data.body &&
      latestMessage.name === CHAT_MESSAGE_EVENT &&
      Date.now() - latestMessage.timestamp < 12000
    ) {
      const body = latestMessage.data.body;
      if (
        (body.split(":")[0] === InteractionType.BUY_BADGES ||
          body.split(":")[0] === InteractionType.SELL_BADGES) &&
        Date.now() - latestMessage.timestamp < 12000
      ) {
        setReceivedCalls((prev) => prev + 1);
      }
    }
  }, [chat.receivedMessages]);

  return (
    <OuterBorder type={BorderType.FIRE} m={"0px !important"}>
      <Flex
        width="100%"
        bg={
          !tournamentActive
            ? "rgba(19,18,37,1)"
            : "radial-gradient(circle, rgba(158,98,0,1) 0%, rgba(120,74,0,1) 11%, rgba(56,38,0,1) 40%, rgba(19,18,37,1) 100%)"
        }
        justifyContent={"center"}
        alignItems={"center"}
        position={"relative"}
      >
        {rainComponents}
        <Flex direction="column" py="5px">
          <>
            <Text
              fontFamily="LoRes15"
              textAlign={"center"}
              fontSize="20px"
              color={tournamentActive ? "#fcd875" : "#c2c2c2"}
            >
              {tournamentActive
                ? "tournament is live!"
                : "tournament is not live"}
            </Text>
            <Flex gap="5px" justifyContent={"center"}>
              {Number(debouncedVipPool) < NUMBER_DECIMAL_THRESHOLD &&
                Number(debouncedVipPool) > 0 && (
                  <Text
                    fontFamily="LoRes15"
                    fontWeight="bold"
                    fontSize="40px"
                    color="#f7cf60"
                  >
                    ~
                  </Text>
                )}
              <Text
                fontFamily="LoRes15"
                fontWeight="bold"
                fontSize="40px"
                color="#f7cf60"
                ref={countUpRef}
                textShadow={"white 1px 0 5px"}
              />
              <Text
                fontFamily="LoRes15"
                fontWeight="bold"
                fontSize="40px"
                color="#f7cf60"
              >
                ETH
              </Text>
            </Flex>
            <Text
              textAlign={"center"}
              fontSize="14px"
              color="#e4b944"
              fontFamily="LoRes15"
            >
              in the vip pool
            </Text>
          </>
        </Flex>
      </Flex>
    </OuterBorder>
  );
};

export default TournamentPot;
