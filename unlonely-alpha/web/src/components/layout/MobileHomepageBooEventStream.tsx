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
import {
  Button,
  Modal,
  ModalContent,
  ModalOverlay,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { ContinuousRain } from "../chat/emoji/BlastRain";
import { FIXED_SOLANA_MINT } from "../../constants";
import copy from "copy-to-clipboard";
import { FaRegCopy } from "react-icons/fa";

enum ButtonOptionNames {
  "heart-black-border" = "heart-black-border",
  "ghost-clear" = "ghost-clear",
  "boolloon" = "boolloon",
  "megaphone-color" = "megaphone-color",
}

const buttonOptionNames = Object.values(ButtonOptionNames);

export const MobileHomepageBooEventStream = () => {
  const { channel } = useChannelContext();
  const { channelQueryData } = channel;

  const [modalState, setModalState] = useState<ButtonOptionNames | undefined>(
    undefined
  );
  const toast = useToast();

  const { playbackInfo } = useLivepeerStreamData({
    livepeerPlaybackId: channelQueryData?.livepeerPlaybackId ?? undefined,
    livepeerStreamId: channelQueryData?.livepeerStreamId ?? undefined,
  });

  const handleCopyContractAddress = () => {
    copy(FIXED_SOLANA_MINT.mintAddress);
    toast({
      title: "copied contract address",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Flex
      direction="column"
      //  h="100dvh"
      overflowY="hidden"
    >
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
        direction="column"
        gap="20px"
        justifyContent={"center"}
        width="100%"
        my="20px"
      >
        <Flex justifyContent={"center"}>
          <Button
            onClick={handleCopyContractAddress}
            borderRadius="35px"
            width="150px"
            color="white"
            background="#564F9A"
          >
            <Flex alignItems={"center"}>
              <FaRegCopy size="25px" />
              <Text fontSize="30px" fontFamily="LoRes15">
                $BOO CA
              </Text>
            </Flex>
          </Button>
        </Flex>
        <SimpleGrid columns={2} spacing={5} mx="auto">
          {buttonOptionNames.map((name) => (
            <Box
              width="140px"
              height="140px"
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
              <Image src={`/images/${name}.png`} height="80px" alt={name} />
            </Box>
          ))}
        </SimpleGrid>
        <Flex justifyContent={"center"}>
          <Text
            textAlign="center"
            fontFamily="LoRes15"
            color="#37FF8B"
            fontSize="15px"
          >
            join on desktop for the full experience
          </Text>
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
        {...getModalStyles(modalState)}
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
              numParticles: 6,
              vertSpeedRange: [1, 3],
            }}
          />
        )}
        <Flex direction="column" gap="30px">
          <Flex direction="column">
            <Text
              textAlign="center"
              fontFamily="LoRes15"
              fontSize="25px"
              color={getModalStyles(modalState).color}
            >
              want to unlock
            </Text>
            <Text
              textAlign="center"
              fontFamily="LoRes15"
              fontSize="35px"
              color={getModalStyles(modalState).color}
            >
              CARE PACKAGES?
            </Text>
          </Flex>
          <Flex justifyContent={"center"} bg="white" borderRadius={"50px"}>
            <Text fontSize="15px" color={"black"} fontWeight={"bold"}>
              on desktop you can:
            </Text>
          </Flex>
          {modalState === ButtonOptionNames["heart-black-border"] && (
            <>
              <Box>
                <UnorderedList
                  spacing={2}
                  fontSize="12px"
                  color={getModalStyles(modalState)}
                >
                  <ListItem>
                    send <b>DRiP WATER💧 & FOOD 🍕</b>
                  </ListItem>
                  <ListItem>
                    send <b>a MATCH 🔥</b>
                  </ListItem>
                  <ListItem>
                    send <b>PAPER TOWELS</b> 🧻
                  </ListItem>
                  <ListItem>
                    let them <b>use the BATHROOM</b> 🚽
                  </ListItem>
                  <ListItem>
                    give a contestant <b>their PHONE</b>📱
                  </ListItem>
                </UnorderedList>
              </Box>
            </>
          )}
          {modalState === ButtonOptionNames["ghost-clear"] && (
            <>
              <Box mt="10px">
                <UnorderedList
                  spacing={2}
                  fontSize="12px"
                  color={getModalStyles(modalState)}
                >
                  <ListItem>
                    turn the <b>LIGHTS OFF</b> 💡
                  </ListItem>
                  <ListItem>
                    <b>add FOG</b> 🌬️
                  </ListItem>
                  <ListItem>
                    send a <b>shot of FIREBALL</b> 🥃
                  </ListItem>
                  <ListItem>
                    blast <b>FART SPRAY</b> 💨
                  </ListItem>
                  <ListItem>
                    <b>$BOO WHALE</b> custom request 🐋👀
                  </ListItem>
                </UnorderedList>
              </Box>
            </>
          )}
          {modalState === ButtonOptionNames["megaphone-color"] && (
            <Text
              textAlign="center"
              fontSize="12px"
              color={getModalStyles(modalState)}
            >
              send a <b>custom Text-To-Speech (TTS) message</b> directly to the
              contestants and all viewers
            </Text>
          )}
          {modalState === ButtonOptionNames["boolloon"] && (
            <Text
              textAlign="center"
              fontSize="12px"
              color={getModalStyles(modalState)}
            >
              login to unlonely and own any amount of $BOO to{" "}
              <b>unlock live chat.</b>
              plus <b>update your username</b> to a custom .boo address 👻
            </Text>
          )}
        </Flex>
      </ModalContent>
    </Modal>
  );
};

const getModalStyles = (
  modalState?: ButtonOptionNames
): {
  bg: string;
  color: string;
} => {
  switch (modalState) {
    case ButtonOptionNames["heart-black-border"]:
      return { bg: "#FFCEE4", color: "black" };
    case ButtonOptionNames["ghost-clear"]:
      return { bg: "#7200A5", color: "white" };
    case ButtonOptionNames["boolloon"]:
      return { bg: "#FF7B00", color: "black" };
    case ButtonOptionNames["megaphone-color"]:
      return { bg: "#1C9A00", color: "white" };
    default:
      return {
        bg: "black",
        color: "white",
      };
  }
};
