import { Text, Flex } from "@chakra-ui/layout";
import { Image, Spacer } from "@chakra-ui/react";
import { useState } from "react";

import { LikeObj } from "../../generated/graphql";
import useLike from "../../hooks/useLike";
import { useUser } from "../../hooks/useUser";
import { LikeIcon, LikedIcon } from "../icons/LikeIcon";

const unlonelyAvatar = "https://i.imgur.com/MNArpwV.png";

const NfcDetailCard = ({ nfc }: any) => {
  const { user } = useUser();
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const { like } = useLike({
    likedObj: LikeObj.Nfc,
    likableId: nfc.id,
    powerLvl: user?.powerUserLvl,
  });

  const submit = async () => {
    setButtonDisabled(true);
    await like();

    setTimeout(() => {
      setButtonDisabled(false);
    }, 3000);
  };

  const handleOpenSeaLink = () => {
    window.open(nfc.openseaLink, "_blank");
  };

  return (
    <>
      <Flex
        direction="column"
        w={{ base: "100%", md: "60%", lg: "60%", sm: "100%" }}
        padding="0.3rem"
        borderRadius="1rem"
        minW={{ base: "16rem", sm: "25rem", md: "25rem", lg: "25rem" }}
        mb="1.5rem"
        mt="8px"
        mr="1rem"
      >
        <video controls loop preload="metadata" poster={nfc.videoThumbnail}>
          <source src={nfc.videoLink} type="video/mp4"></source>
        </video>
        <Flex justifyContent="space-between">
          <Text fontSize={32} fontWeight="bold">
            {nfc.title}
          </Text>
          <button
            margin-top="0.5rem"
            onClick={submit}
            disabled={buttonDisabled}
          >
            {nfc.score > 1 ? nfc.score : null}
            {nfc.liked === true ? (
              <LikedIcon boxSize={6} />
            ) : (
              <LikeIcon boxSize={6} />
            )}
          </button>
        </Flex>
        <Flex direction="row" justifyContent="flex-end">
          <Image
            height="36px"
            width="36px"
            objectFit="cover"
            src={nfc.owner.FCImageUrl ? nfc.owner.FCImageUrl : unlonelyAvatar}
            borderRadius="full"
            mr="0.5rem"
          />
          <Text
            fontSize="18px"
            noOfLines={1}
            color="black"
            fontWeight="light"
            textAlign="center"
            fontFamily="Inter"
          >
            owner: {nfc.owner.username}
          </Text>
          <Spacer />
          <Image
            src="/images/opensea-blue_logo.png"
            width="1.5rem"
            height="1.5rem"
            opacity={"0.4"}
            onClick={handleOpenSeaLink}
            _hover={{ cursor: "pointer" }}
          />
        </Flex>
      </Flex>
    </>
  );
};

export default NfcDetailCard;
