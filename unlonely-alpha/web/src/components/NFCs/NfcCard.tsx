import { Text, Flex } from "@chakra-ui/layout";
import { Image, Spacer } from "@chakra-ui/react";

import { LikedIcon, LikeIcon } from "../icons/LikeIcon";

const unlonelyAvatar = "https://i.imgur.com/MNArpwV.png";

const NfcCard = ({ nfc }: any) => {
  const handleOpenSeaLink = () => {
    window.open(nfc.openseaLink, "_blank");
  };

  const handleRedirect = () => {
    window.location.href = `/nfc/${nfc.id}`;
  };
  return (
    <>
      <Flex
        direction="column"
        w={{ base: "100%", md: "60%", lg: "60%", sm: "100%" }}
        h={{ base: "9rem", sm: "3rem", md: "6rem", lg: "9rem" }}
        padding="0.3rem"
        borderRadius="1rem"
        minH="8rem"
        minW={{ base: "16rem", sm: "25rem", md: "25rem", lg: "25rem" }}
        mb="1.5rem"
        mt="8px"
        mr="1rem"
        onClick={handleRedirect}
        on
      >
        <Flex
          _hover={{
            filter: "brightness(80%)", // darken the image on hover
            position: "relative", // needed to position the "Play" text
          }}
        >
          <video poster={nfc.videoThumbnail}>
            <source src={nfc.videoLink} type="video/mp4"></source>
          </video>
          <Image
            src="/images/playIcon.png"
            opacity={0.5}
            style={
              {
                position: "relative",
                zIndex: 1,
                visibility: "visible",
                margin: "auto",
                top: "0%",
                left: "-65%",
              } as React.CSSProperties
            }
          />
        </Flex>
        <Flex justifyContent="space-between">
          <Text fontSize={16} fontWeight="bold" noOfLines={1}>
            {nfc.title}
          </Text>
          <Flex mt="0.25rem" direction="row">
            {nfc.score >= 1 ? <Text fontSize={12}>{nfc.score}</Text> : null}
            {nfc.liked === true ? (
              <LikedIcon boxSize={4} />
            ) : (
              <LikeIcon boxSize={4} />
            )}
          </Flex>
        </Flex>
        <Flex direction="row" justifyContent="flex-end">
          <Image
            height="22px"
            width="22px"
            objectFit="cover"
            src={nfc.owner.FCImageUrl ? nfc.owner.FCImageUrl : unlonelyAvatar}
            borderRadius="full"
            mr="0.5rem"
          />
          <Text
            fontSize="12px"
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

// NfcCard.fragments = {
//   nFC: gql`
//     fragment NFCCard_nFC on NFC {
//       createdAt
//       id
//       videoLink
//       owner {
//         address
//         FCImageUrl
//         powerUserLvl
//         videoSavantLvl
//       }
//       title
//   `,
// };

export default NfcCard;
