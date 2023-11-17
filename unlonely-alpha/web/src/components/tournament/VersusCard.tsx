import { Flex, Image, SimpleGrid, Text } from "@chakra-ui/react";

export type VersusCardData = {
  contestant1: {
    name: string;
    portrait: string;
    slug: string;
    logo?: string;
  };
  contestant2: {
    name: string;
    portrait: string;
    slug: string;
    logo?: string;
  };
  time: string;
}[];

export const VersusCard = ({ data }: { data: VersusCardData }) => {
  return (
    <Flex direction="column">
      {data.map((versus, i) => (
        <SimpleGrid key={i} columns={3}>
          <Flex
            direction="column"
            align="center"
            position="relative"
            _hover={{
              transform: "scale(1.1)",
              transition: "all 200ms ease-in",
            }}
            onClick={() => {
              window.open(`/channels/${versus.contestant1.slug}`, "_blank");
            }}
          >
            {versus.contestant1.logo && (
              <Image
                position="absolute"
                src={versus.contestant1.logo}
                width="60px"
                height="60px"
                bottom={"-10px"}
                left={"-10px"}
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
          <Flex
            direction="column"
            align="center"
            position="relative"
            _hover={{
              transform: "scale(1.1)",
              transition: "all 200ms ease-in",
            }}
            onClick={() => {
              window.open(`/channels/${versus.contestant2.slug}`, "_blank");
            }}
          >
            {versus.contestant2.logo && (
              <Image
                position="absolute"
                src={versus.contestant2.logo}
                width="60px"
                height="60px"
                bottom={"-10px"}
                left={"-10px"}
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
