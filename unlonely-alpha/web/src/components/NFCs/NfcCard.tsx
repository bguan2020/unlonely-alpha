import { Text, Flex } from "@chakra-ui/layout";
import { Image, Spacer } from "@chakra-ui/react";

const unlonelyAvatar = "https://i.imgur.com/MNArpwV.png";

const NfcCard = ({ nfc }: any) => {
  return (
    <>
      <Flex
        direction="column"
        w={{ base: "100%", md: "60%", lg: "60%", sm: "100%" }}
        h={{base: "9rem", sm: "3rem", md: "6rem", lg: "9rem"}}
        padding="0.3rem"
        borderRadius="1rem"
        minH="8rem"
        minW={{base: "16rem", sm: "25rem", md: "25rem", lg: "25rem"}}
        mb="1.5rem"
        mt="8px"
        mr="1rem"
      >
        <video controls loop preload="metadata">
          <source src={`${nfc.videoLink}#t=0.5`} type="video/mp4"></source>
        </video>
        <Text fontSize={16} fontWeight="bold">
          {nfc.title}
        </Text>
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
          <Text
            fontSize="12px"
            noOfLines={1}
            color="black"
            fontWeight="light"
            textAlign="center"
            fontFamily="Inter"
          >
            <a href="https://opensea.io/collection/unlonelynfcs">Opensea</a>
          </Text>
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
