import { Flex, Text, Image } from "@chakra-ui/react";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useCountUp } from "react-countup";

import { CHAT_MESSAGE_EVENT, InteractionType } from "../../constants";
import { ChatReturnType } from "../../hooks/chat/useChat";
import { useChannelContext } from "../../hooks/context/useChannel";
import { BlastRain } from "../chat/emoji/BlastRain";
import { BorderType, OuterBorder } from "../general/OuterBorder";

const debounceDelay = 1000; // milliseconds

function countDecimalPlaces(decimalString: string) {
  // Check if there is a decimal point in the string
  const index = decimalString.indexOf(".");
  if (index === -1) {
    // No decimal point, so no decimal places
    return 0;
  }
  // Calculate the number of decimal places
  return decimalString.length - index - 1;
}

const TournamentPot = ({ chat }: { chat: ChatReturnType }) => {
  const { ui } = useChannelContext();
  const { vipPool } = ui;

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
            numParticles: 6,
            durationInMillis: 5000,
            vertSpeed: 4,
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
      Number(debouncedVipPool) > 1 ? 6 : countDecimalPlaces(debouncedVipPool),
    useEasing: true,
    onStart: () => console.log("Started counting!"),
    onEnd: () => console.log("Finished counting!"),
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedVipPool(ui.vipPool);
    }, debounceDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [ui.vipPool]);

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
    <OuterBorder type={BorderType.FIRE}>
      <Flex
        width="100%"
        // bg="rgba(19, 18, 37, 1)"
        bg={
          "radial-gradient(circle, rgba(158,98,0,1) 0%, rgba(120,74,0,1) 11%, rgba(56,38,0,1) 40%, rgba(19,18,37,1) 100%)"
        }
        justifyContent={"center"}
        alignItems={"center"}
        position={"relative"}
      >
        {rainComponents}
        <Flex direction="column">
          <Text textAlign={"center"} fontSize="10px">
            Vip Pool
          </Text>
          <Flex
            gap="5px"
            // bg={
            //   "radial-gradient(circle, rgba(195,117,0,1) 40%, rgba(246,173,24,1) 59%, rgba(255,255,255,0) 100%)"
            // }
          >
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
        </Flex>
      </Flex>
    </OuterBorder>
  );
};

export default TournamentPot;
