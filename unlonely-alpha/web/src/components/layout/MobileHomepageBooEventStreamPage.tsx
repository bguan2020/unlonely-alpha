import {
  Box,
  Flex,
  ListItem,
  SimpleGrid,
  Text,
  UnorderedList,
} from "@chakra-ui/layout";
import { Image } from "@chakra-ui/image";
import LivepeerPlayer from "../stream/LivepeerPlayer";
import { getSrc } from "@livepeer/react/external";
import { useChannelContext } from "../../hooks/context/useChannel";
import { useLivepeerStreamData } from "../../hooks/internal/useLivepeerStreamData";
import NextImage from "next/image";
import { Modal, ModalContent, ModalOverlay } from "@chakra-ui/react";
import { useState } from "react";
import { ContinuousRain } from "../chat/emoji/BlastRain";

enum ButtonOptionNames {
  "pixel-heart" = "pixel-heart",
  "pixel-ghost" = "pixel-ghost",
  "boolloon" = "boolloon",
  "megaphone-color" = "megaphone-color",
}

const buttonOptionNames = Object.values(ButtonOptionNames);

export const MobileHomePageBooEventStreamPage = () => {
  const { channel } = useChannelContext();
  const { channelQueryData } = channel;

  const [modalState, setModalState] = useState<ButtonOptionNames | undefined>(
    undefined
  );

  const { playbackInfo } = useLivepeerStreamData({
    livepeerPlaybackId: channelQueryData?.livepeerPlaybackId ?? undefined,
    livepeerStreamId: channelQueryData?.livepeerStreamId ?? undefined,
  });

  return (
    <Flex direction="column" h="100vh">
      <WantToUnlockModal
        modalState={modalState}
        handleClose={() => setModalState(undefined)}
      />

      <Flex h="30px" p="5px" alignContent={"center"}>
        <NextImage
          src="/svg/unlonely-green.svg"
          priority
          alt="unlonely"
          width={80}
          height={80}
        />
      </Flex>
      {playbackInfo ? (
        <Box width={"100%"} height={"30vh"} transition="all 0.3s">
          <LivepeerPlayer src={getSrc(playbackInfo)} cannotOpenClipDrawer />
        </Box>
      ) : (
        <Box width={"100%"} height={"30vh"} bg={"black"}></Box>
      )}
      <Flex
        flexWrap={"wrap"}
        justifyContent={"space-evenly"}
        height={"calc(100vh - 30vh - 30px)"}
      >
        <Flex
          direction="column"
          justifyContent={"center"}
          alignContent={"center"}
          gap="20px"
        >
          <SimpleGrid columns={2} spacing={5} mx="auto">
            {buttonOptionNames.map((name) => (
              <Box
                width="100px"
                height="100px"
                bg="#FF7B00"
                borderRadius="100%"
                key={name}
                onClick={() => {
                  setModalState(name as ButtonOptionNames);
                }}
                _hover={{
                  cursor: "pointer",
                  transform: "scale(1.1)",
                  transition: "transform 0.2s",
                }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="5px 5px 10px #37FF8B"
              >
                <Image src={`/images/${name}.png`} height="60px" alt={name} />
              </Box>
            ))}
          </SimpleGrid>
          <Flex justifyContent={"center"}>
            <Text
              textAlign="center"
              width="190px"
              fontFamily="LoRes15"
              color="#37FF8B"
              fontSize="15px"
            >
              join on desktop for the full experience
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

const WantToUnlockModal = ({
  modalState,
  handleClose,
}: {
  modalState: ButtonOptionNames | undefined;
  handleClose: () => void;
}) => {
  return (
    <Modal
      isCentered
      isOpen={modalState !== undefined}
      onClose={handleClose}
      size={"sm"}
    >
      <ModalOverlay backgroundColor="#282828e6" />
      <ModalContent
        padding="50px 20px"
        borderRadius="20px"
        width="300px"
        bg="#FF7B00"
        color="black"
      >
        {modalState !== undefined && (
          <ContinuousRain
            emoji={
              <Image
                src={`/images/${modalState}.png`}
                height="60px"
                alt={modalState}
              />
            }
            uid="modalState"
            config={{
              numParticles: 4,
              vertSpeed: 1,
            }}
          />
        )}
        <Flex direction="column">
          <Flex direction="column" mb="30px">
            <Text
              textAlign="center"
              fontFamily="LoRes15"
              fontSize="25px"
              color="white"
              textShadow="1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black"
            >
              want to unlock
            </Text>
            <Text
              textAlign="center"
              fontFamily="LoRes15"
              fontSize="35px"
              color="white"
              textShadow="1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black"
            >
              CARE PACKAGES?
            </Text>
          </Flex>
          {modalState === ButtonOptionNames["pixel-heart"] && (
            <>
              <Text textAlign="left" textDecoration="underline" fontSize="15px">
                on desktop you can:
              </Text>
              <Box mt="10px">
                <UnorderedList spacing={2} fontSize="15px" color="black">
                  <ListItem>
                    send participants <b>water and food</b> in real time
                  </ListItem>
                  <ListItem>
                    send a <b>mad lads backpack</b> with surprise goodies
                  </ListItem>
                  <ListItem>
                    hurry, <b>the show ends in XXX hours!</b>
                  </ListItem>
                </UnorderedList>
              </Box>
            </>
          )}
          {modalState === ButtonOptionNames["pixel-ghost"] && (
            <>
              <Text textAlign="left" textDecoration="underline" fontSize="15px">
                on desktop you can:
              </Text>
              <Box mt="10px">
                <UnorderedList spacing={2} fontSize="15px" color="black">
                  <ListItem>
                    <b>send in a ghost</b> to chase the contestants
                  </ListItem>
                  <ListItem>
                    turn on <b>high frequency sound</b>
                  </ListItem>
                  <ListItem>
                    flicker the <b>lights</b>
                  </ListItem>
                  <ListItem>
                    turn the <b>fog machine</b> on
                  </ListItem>
                </UnorderedList>
              </Box>
            </>
          )}
          {modalState === ButtonOptionNames["megaphone-color"] && (
            <Text textAlign="left" fontSize="15px">
              only on desktop, you can send a{" "}
              <b>custom TTS (text-to-speech) broadcast message</b> to the
              contestants
            </Text>
          )}
          {modalState === ButtonOptionNames["boolloon"] && (
            <Text textAlign="left" fontSize="15px">
              only on desktop, you can <b>participate in live chat</b> with the
              rest of the viewers
            </Text>
          )}
        </Flex>
      </ModalContent>
    </Modal>
  );
};
