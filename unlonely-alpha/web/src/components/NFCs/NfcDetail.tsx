import { Text, Flex } from "@chakra-ui/layout";
import { Image, Spacer } from "@chakra-ui/react";

const unlonelyAvatar = "https://i.imgur.com/MNArpwV.png";

const NfcDetailCard = ({ nfc }: any) => {
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
        <Text fontSize={32} fontWeight="bold">
          {nfc.title}
        </Text>
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
