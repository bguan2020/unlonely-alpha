import { Text, Flex, Box, Image, Spacer } from "@chakra-ui/react";
import Link from "next/link";

import centerEllipses from "../../utils/centerEllipses";
import { LikedIcon, LikeIcon } from "../icons/LikeIcon";

const unlonelyAvatar = "/icons/icon-192x192.png";

const NfcCard = ({ nfc, makeLinksExternal }: any) => {
  const handleOpenSeaLink = () => {
    window.open(nfc.openseaLink, "_blank");
  };

  const href = `/nfc/${nfc.id}`;

  return (
    <LinkWrapper href={href} isExternal={makeLinksExternal}>
      <Flex
        direction="column"
        padding="0.3rem"
        borderRadius="1rem"
        minH="8rem"
        minW={{ base: "16rem", sm: "25rem", md: "25rem", lg: "25rem" }}
        bg={"#131323"}
        p={"10px"}
        cursor="pointer"
        transition="transform 0.2s"
        _hover={{ transform: "scale(1.05)" }}
      >
        <Flex
          _hover={{
            filter: "brightness(80%)",
            position: "relative",
          }}
        >
          <Box position="relative" mb="10px">
            <Image
              src={nfc.videoThumbnail ?? "/svg/defaultThumbnail.svg"}
              width={["236px", "380px"]}
              height={["132px", "213px"]}
              borderRadius={"10px"}
            />
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
            owner:{" "}
            {nfc?.owner.username ?? centerEllipses(nfc?.owner.address, 13)}
          </Text>
          <Spacer />
          {nfc.openseaLink && (
            <Image
              src="/images/opensea-blue_logo.png"
              width="1.5rem"
              height="1.5rem"
              opacity={"0.4"}
              onClick={handleOpenSeaLink}
              _hover={{ cursor: "pointer" }}
            />
          )}
        </Flex>
      </Flex>
    </LinkWrapper>
  );
};

const LinkWrapper = ({ href, children, isExternal }: any) => {
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} passHref>
      <a>{children}</a>
    </Link>
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
