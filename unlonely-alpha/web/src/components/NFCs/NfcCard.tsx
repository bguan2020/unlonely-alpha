import { Text, Flex } from "@chakra-ui/layout";
import { Box, Image, Spacer } from "@chakra-ui/react";

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
        padding="0.3rem"
        borderRadius="1rem"
        minH="8rem"
        minW={{ base: "16rem", sm: "25rem", md: "25rem", lg: "25rem" }}
        onClick={handleRedirect}
        bg={"#131323"}
        p={"10px"}
        gap={"10px"}
      >
        <Flex
          _hover={{
            filter: "brightness(80%)",
            position: "relative",
          }}
        >
          {nfc.videoThumbnail && (
            <Box position="relative">
              <Image src={nfc.videoThumbnail} borderRadius={"10px"} />
              <Image
                src="/images/playIcon.png"
                opacity={0.5}
                style={
                  {
                    position: "absolute",
                    zIndex: 1,
                    visibility: "visible",
                    margin: "auto",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  } as React.CSSProperties
                }
              />
            </Box>
          )}
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
            fontWeight="light"
            textAlign="center"
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
