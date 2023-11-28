import { Flex, Image, SimpleGrid, Text } from "@chakra-ui/react";

type Contestant = {
  name: string;
  portrait: string;
  slug: string;
  logo?: string;
  logoSize?: string;
  logoLeft?: string;
  logoBottom?: string;
  rounded?: boolean;
};

export type VersusCardData = {
  contestant1: Contestant;
  contestant2: Contestant;
  time: string;
}[];

export const VersusCard = ({ data }: { data: VersusCardData }) => {
  return (
    <Flex direction="column">
      {data.map((versus, i) => (
        <SimpleGrid key={i} columns={3}>
          <Flex direction="column" align="center" position="relative">
            {versus.contestant1.logo && (
              <Image
                position="absolute"
                src={versus.contestant1.logo}
                width={versus.contestant1.logoSize ?? "60px"}
                bottom={versus.contestant1.logoBottom ?? "-10px"}
                left={versus.contestant1.logoLeft ?? "-10px"}
                borderRadius={versus.contestant1.rounded ? "full" : undefined}
              />
            )}
            <Text
              fontFamily={"LoRes15"}
              fontSize={["15px", "20px"]}
              color={"#37FF8B"}
              position="absolute"
              top={"-6px"}
            >
              {versus.contestant1.name}
            </Text>
            <Image
              width="9rem"
              height="9rem"
              src={versus.contestant1.portrait}
              alt="contestant1"
            />
          </Flex>
          <Flex direction="column" alignSelf="center" align="center">
            <Text fontFamily={"LoRes15"} fontSize={["15px", "20px"]}>
              -VERSUS-
            </Text>
            <Text fontFamily={"LoRes15"} color={"#37FF8B"}>
              {versus.time}
            </Text>
          </Flex>
          <Flex direction="column" align="center" position="relative">
            {versus.contestant2.logo && (
              <Image
                position="absolute"
                src={versus.contestant2.logo}
                width={versus.contestant2.logoSize ?? "60px"}
                bottom={versus.contestant2.logoBottom ?? "-10px"}
                left={versus.contestant2.logoLeft ?? "-10px"}
                borderRadius={versus.contestant2.rounded ? "full" : undefined}
              />
            )}
            <Text
              fontFamily={"LoRes15"}
              fontSize={["15px", "20px"]}
              color={"#37FF8B"}
              position="absolute"
              top={"-6px"}
            >
              {versus.contestant2.name}
            </Text>
            <Image
              width="9rem"
              height="9rem"
              src={versus.contestant2.portrait}
              alt="contestant2"
            />
          </Flex>
        </SimpleGrid>
      ))}
    </Flex>
  );
};
